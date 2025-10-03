import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RatesService } from '../rates/rates.service';
import { parseTerms } from './terms.parser';
import { impliedAprPct, discountDeadline, recommend, isDiscountDeadlinePassed, daysUntilDeadline, getUrgencyStatus } from './calculator';
import { parseCsv } from './csv.parser';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private rates: RatesService,
  ) {}

  async importCsv(fileBuf: Buffer, userId: string) {
    const rows = await parseCsv(fileBuf);
    const rate = await this.rates.getToday();
    let imported = 0, skipped = 0;

    for (const r of rows) {
      try {
        const amount = Number(r.amount);
        const terms = parseTerms(r.terms);
        if (!terms) throw new Error('Invalid terms');
        const invDate = new Date(r.invoice_date);
        const dueDate = new Date(r.due_date);
        const implied = impliedAprPct(terms);
        const dd = discountDeadline(invDate, terms.discountDays);
        const rec = recommend(implied, rate.annualRatePct, 200); // 200 bps buffer

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
            recommendation: rec.rec as 'TAKE' | 'HOLD',
            reason: rec.reason,
            status: 'PENDING',
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }
    return { imported, skipped };
  }

  async list(params: { status?: string; limit: number; cursor?: string }, userId: string) {
    const { status, limit, cursor } = params;
    const where: any = { userId }; // Filter by user
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

  /** Update recommendations based on today's date and current rates */
  async updateRecommendations(userId: string) {
    const currentRate = await this.rates.getToday();
    const invoices = await this.prisma.invoice.findMany({
      where: { userId, status: 'PENDING' }
    });

    const updates: Array<{
      id: string;
      recommendation: 'TAKE' | 'HOLD';
      reason: string;
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
        // Recalculate with current rate
        const terms = parseTerms(invoice.terms);
        if (terms) {
          const implied = impliedAprPct(terms);
          const rec = recommend(implied, currentRate.annualRatePct, 200);
          
          updates.push({
            id: invoice.id,
            recommendation: rec.rec as 'TAKE' | 'HOLD',
            reason: rec.reason
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
          reason: update.reason
        }
      });
    }

    return { updated: updates.length };
  }
}
