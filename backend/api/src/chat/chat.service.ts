import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RatesService } from '../rates/rates.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private rates: RatesService,
  ) {}

  async explainInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const rate = await this.rates.getToday();
    const daysUntilDeadline = invoice.discountDeadline 
      ? Math.ceil((invoice.discountDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    const insight = `${invoice.terms} on $${Number(invoice.amount).toLocaleString()} ≈ ${invoice.impliedAprPct.toFixed(2)}%/yr vs ${rate.annualRatePct.toFixed(2)}% benchmark`;
    
    const steps = [
      `Pay by ${invoice.discountDeadline?.toISOString().split('T')[0]} to save $${(Number(invoice.amount) * 0.02).toFixed(2)}`,
      `Cash impact: $${(Number(invoice.amount) * 0.98).toLocaleString()} this week`,
    ];

    return { insight, steps };
  }

  async pickTopDiscounts(budget: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: { 
        status: 'PENDING',
        recommendation: 'TAKE',
      },
      orderBy: { impliedAprPct: 'desc' },
      take: 10,
    });

    const rate = await this.rates.getToday();
    const selection: Array<{
      invoiceId: string;
      impliedAprPct: number;
      takeAmount: number;
      savings: number;
    }> = [];
    let totalTake = 0;
    let totalSavings = 0;

    for (const inv of invoices) {
      const takeAmount = Number(inv.amount) * 0.98; // 2% discount
      if (totalTake + takeAmount <= budget) {
        const savings = Number(inv.amount) * 0.02;
        selection.push({
          invoiceId: inv.id,
          impliedAprPct: inv.impliedAprPct,
          takeAmount,
          savings,
        });
        totalTake += takeAmount;
        totalSavings += savings;
      }
    }

    return {
      selection,
      totalTake,
      totalSavings,
    };
  }
}
