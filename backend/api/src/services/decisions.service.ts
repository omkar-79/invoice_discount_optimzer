import prisma from '../prisma.client';
import { RatesService } from './rates.service';
import { parseTerms } from '../utils/terms.parser';
import { estimatedSavings } from '../utils/calculator';
import { DecisionAction } from '@prisma/client';

export class DecisionsService {
  private ratesService: RatesService;

  constructor() {
    this.ratesService = new RatesService();
  }

  async decide(userId: string, invoiceIds: string[], action: DecisionAction, note?: string) {
    const rate = await this.ratesService.getToday();
    const invs = await prisma.invoice.findMany({ 
      where: { 
        id: { in: invoiceIds },
        userId: userId // Only get invoices belonging to this user
      } 
    });

    let totalSavings = 0;
    for (const inv of invs) {
      const terms = parseTerms(inv.terms)!;
      const savings = action === 'APPROVE_TAKE'
        ? estimatedSavings(Number(inv.amount), terms.discountPct)
        : 0;
      totalSavings += savings;
    }

    const dec = await prisma.decision.create({
      data: {
        userId,
        invoiceIds,
        action,
        benchmarkPct: rate.annualRatePct,
        impliedAprPct: invs[0]?.impliedAprPct ?? 0,
        estimatedSavings: totalSavings,
        note,
      },
    });

    await prisma.invoice.updateMany({
      where: { id: { in: invoiceIds } },
      data: {
        status:
          action === 'APPROVE_TAKE' ? 'APPROVED_TAKE' :
          action === 'APPROVE_HOLD' ? 'APPROVED_HOLD' : 'DISMISSED',
      },
    });

    return { saved: invoiceIds.length, estimatedSavings: totalSavings };
  }

  async audit(userId: string, from?: string, to?: string) {
    const where: any = { userId }; // Filter by user
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }
    const items = await prisma.decision.findMany({ 
      where, 
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { email: true } } }
    });
    
    // Fetch invoice details for each decision
    const itemsWithInvoices = await Promise.all(
      items.map(async (item) => {
        const invoices = await prisma.invoice.findMany({
          where: { id: { in: item.invoiceIds } },
          select: { id: true, invoiceNumber: true, vendor: true }
        });
        
        return {
          id: item.id,
          timestamp: item.timestamp.toISOString(),
          user: item.user.email,
          invoiceIds: item.invoiceIds,
          invoices: invoices, // Add invoice details
          action: item.action,
          benchmarkPct: item.benchmarkPct,
          impliedAprPct: item.impliedAprPct,
          estimatedSavings: Number(item.estimatedSavings),
          note: item.note,
        };
      })
    );
    
    return { 
      items: itemsWithInvoices
    };
  }
}
