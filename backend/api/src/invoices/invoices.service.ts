import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RatesService } from '../rates/rates.service';
import { parseTerms } from './terms.parser';
import { impliedAprPct, discountDeadline, recommend, recommendWithScenarios, isDiscountDeadlinePassed, daysUntilDeadline, getUrgencyStatus } from './calculator';
import { parseCsv } from './csv.parser';
import { Prisma } from '@prisma/client';

/**
 * InvoicesService handles all invoice-related operations including:
 * - CSV import and parsing
 * - Financial calculations and recommendations
 * - User-specific data filtering
 * - Recommendation updates based on current rates
 */
@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private rates: RatesService,
  ) {}

  /**
   * Imports invoices from CSV file and processes them with financial recommendations
   * @param fileBuf - CSV file buffer
   * @param userId - User ID for data isolation
   * @returns Object with import statistics
   */
  async importCsv(fileBuf: Buffer, userId: string) {
    // Debug: high-level import start
    const rows = await parseCsv(fileBuf);
    const totalRows = rows.length;
    console.log(`[InvoicesService] importCsv: userId=${userId} rows=${totalRows}`);
    
    // Get user's default settings for rate preferences
    const userSettings = await this.prisma.userSettings.findUnique({
      where: { userId }
    });
    
    let imported = 0, skipped = 0;

    // Process each row in the CSV file
    for (const r of rows) {
      try {
        // Parse and validate invoice data
        const amount = Number(r.amount);
        const terms = parseTerms(r.terms);
        if (!terms) throw new Error('Invalid terms');
        const invDate = new Date(r.invoice_date);
        const dueDate = new Date(r.due_date);
        const implied = impliedAprPct(terms);
        const dd = discountDeadline(invDate, terms.discountDays);
        
        // Determine user rate: CSV data takes precedence over user defaults
        const userRate = r.user_rate ? Number(r.user_rate) : (userSettings?.defaultInvestmentRate || 5.0);
        const rateType = r.rate_type || userSettings?.defaultRateType || 'INVESTMENT';
        
        // Calculate recommendation using three-scenario analysis
        const rec = recommendWithScenarios(
          amount,
          terms.discountPct,
          terms.discountDays,
          terms.netDays,
          userRate,
          rateType as 'INVESTMENT' | 'BORROWING'
        );

        await this.prisma.invoice.create({
          data: {
            userId, // Associate with user
            vendor: r.vendor,
            invoiceNumber: r.invoice_number,
            amount,
            currency: r.currency ?? 'USD',
            invoiceDate: invDate,
            dueDate,
            terms: r.terms,
            discountDeadline: dd,
            impliedAprPct: implied,
            recommendation: rec.rec as 'TAKE' | 'HOLD' | 'BORROW',
            reason: rec.reason,
            status: 'PENDING',
            userRate,
            rateType: rateType as 'INVESTMENT' | 'BORROWING',
            borrowingCost: rec.scenarios.borrow || undefined,
            investmentReturn: rec.scenarios.hold || undefined,
          },
        });
        imported++;
        // Row-level success log (limited fields for PII safety)
        console.log(
          `[InvoicesService] row imported: vendor=${r.vendor} invoice=${r.invoice_number} amount=${amount} rec=${rec.rec} rateType=${rateType} userRate=${userRate}`
        );
      } catch (err: any) {
        skipped++;
        // Row-level error with safe context
        console.error(
          `[InvoicesService] row failed: vendor=${r?.vendor} invoice=${r?.invoice_number} reason=${err?.message}`,
          err?.stack || err
        );
      }
    }
    console.log(`[InvoicesService] import complete: userId=${userId} imported=${imported} skipped=${skipped} rows=${totalRows}`);
    return { imported, skipped };
  }

  /**
   * Retrieves paginated list of invoices for a specific user
   * @param params - Query parameters including status filter, limit, and cursor
   * @param userId - User ID for data isolation
   * @returns Paginated invoice list with cursor for next page
   */
  async list(params: { status?: string; limit: number; cursor?: string }, userId: string) {
    const { status, limit, cursor } = params;
    const where: any = { userId }; // Filter by user for data isolation
    if (status) where.status = status as any;
    
    const items = await this.prisma.invoice.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    let nextCursor: string | null = null;
    if (items.length > limit) {
      nextCursor = items[limit].id;
      items.pop();
    }
    return { items, nextCursor };
  }

  /**
   * Updates recommendations for all pending invoices based on current date and rates
   * This method recalculates recommendations when:
   * - Discount deadlines have passed
   * - User rates have changed
   * - Current date affects calculations
   * @param userId - User ID for data isolation
   * @returns Number of invoices updated
   */
  async updateRecommendations(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId, status: 'PENDING' }
    });

    const updates: Array<{
      id: string;
      recommendation: 'TAKE' | 'HOLD' | 'BORROW';
      reason: string;
      borrowingCost?: number;
      investmentReturn?: number;
    }> = [];
    
    for (const invoice of invoices) {
      // Check if discount deadline has passed
      const deadlinePassed = isDiscountDeadlinePassed(invoice.discountDeadline);
      
      if (deadlinePassed) {
        // If deadline passed, recommend HOLD (no discount available)
        updates.push({
          id: invoice.id,
          recommendation: 'HOLD' as const,
          reason: 'Discount deadline has passed - no discount available'
        });
      } else {
        // Recalculate with user's rate if available
        const terms = parseTerms(invoice.terms);
        if (terms && invoice.userRate && invoice.rateType) {
          const rec = recommendWithScenarios(
            Number(invoice.amount),
            terms.discountPct,
            terms.discountDays,
            terms.netDays,
            invoice.userRate,
            invoice.rateType as 'INVESTMENT' | 'BORROWING'
          );
          
          updates.push({
            id: invoice.id,
            recommendation: rec.rec as 'TAKE' | 'HOLD' | 'BORROW',
            reason: rec.reason,
            borrowingCost: rec.scenarios.borrow || undefined,
            investmentReturn: rec.scenarios.hold || undefined
          });
        } else {
          // If no user rate is set, prefer HOLD without external benchmarks
          updates.push({
            id: invoice.id,
            recommendation: 'HOLD',
            reason: 'No user rate provided; holding cash by default'
          });
        }
      }
    }

    // Batch update all invoices
    for (const update of updates) {
      await this.prisma.invoice.update({
        where: { id: update.id },
        data: {
          recommendation: update.recommendation,
          reason: update.reason,
          ...(update.borrowingCost !== undefined && { borrowingCost: update.borrowingCost }),
          ...(update.investmentReturn !== undefined && { investmentReturn: update.investmentReturn })
        }
      });
    }

    return { updated: updates.length };
  }

  /** Update invoice rate and recalculate recommendation */
  async updateInvoiceRate(invoiceId: string, userRate: number, rateType: 'INVESTMENT' | 'BORROWING', userId: string) {
    // First, verify the invoice belongs to the user
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, userId }
    });

    if (!invoice) {
      throw new Error('Invoice not found or access denied');
    }

    // Parse terms to get discount details
    const terms = parseTerms(invoice.terms);
    if (!terms) {
      throw new Error('Invalid invoice terms');
    }

    // Recalculate with new rate
    const rec = recommendWithScenarios(
      Number(invoice.amount),
      terms.discountPct,
      terms.discountDays,
      terms.netDays,
      userRate,
      rateType
    );

    // Update the invoice
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        userRate,
        rateType,
        recommendation: rec.rec as 'TAKE' | 'HOLD' | 'BORROW',
        reason: rec.reason,
        borrowingCost: rec.scenarios.borrow || undefined,
        investmentReturn: rec.scenarios.hold || undefined,
      }
    });

    return {
      id: updatedInvoice.id,
      vendor: updatedInvoice.vendor,
      invoiceNumber: updatedInvoice.invoiceNumber,
      amount: Number(updatedInvoice.amount),
      currency: updatedInvoice.currency,
      invoiceDate: updatedInvoice.invoiceDate.toISOString().split('T')[0],
      dueDate: updatedInvoice.dueDate.toISOString().split('T')[0],
      terms: updatedInvoice.terms,
      discountDeadline: updatedInvoice.discountDeadline?.toISOString().split('T')[0],
      impliedAprPct: updatedInvoice.impliedAprPct,
      recommendation: updatedInvoice.recommendation,
      reason: updatedInvoice.reason,
      status: updatedInvoice.status,
      userRate: updatedInvoice.userRate,
      rateType: updatedInvoice.rateType,
      borrowingCost: updatedInvoice.borrowingCost,
      investmentReturn: updatedInvoice.investmentReturn,
    };
  }
}
