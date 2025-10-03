import { ParsedTerms } from './terms.parser';

/** Implied APR for discount terms.
 *  Formula: (d / (1 - d)) * (365 / (netDays - discountDays)) * 100
 *  where d = discountPct / 100
 */
export function impliedAprPct(terms: ParsedTerms): number {
  if (!terms || terms.discountPct <= 0) return 0;
  const d = terms.discountPct / 100;
  const days = terms.netDays - terms.discountDays;
  return (d / (1 - d)) * (365 / days) * 100;
}

/** Discount deadline date = invoiceDate + discountDays */
export function discountDeadline(invoiceDate: Date, discountDays: number): Date | null {
  if (!discountDays || discountDays <= 0) return null;
  const dt = new Date(invoiceDate);
  dt.setDate(dt.getDate() + discountDays);
  return dt;
}

/** Check if discount deadline has passed */
export function isDiscountDeadlinePassed(discountDeadline: Date | null): boolean {
  if (!discountDeadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const deadline = new Date(discountDeadline);
  deadline.setHours(0, 0, 0, 0);
  return deadline < today;
}

/** Calculate days until discount deadline */
export function daysUntilDeadline(discountDeadline: Date | null): number {
  if (!discountDeadline) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(discountDeadline);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/** Get urgency status based on days until deadline */
export function getUrgencyStatus(daysUntil: number): 'urgent' | 'warning' | 'normal' | 'expired' {
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'warning';
  return 'normal';
}

/** Recommendation vs benchmark with safety buffer in bps */
export function recommend(impliedApr: number, benchmarkPct: number, safetyBufferBps = 200) {
  const threshold = benchmarkPct + safetyBufferBps / 100;
  if (impliedApr >= threshold) {
    return { rec: 'TAKE' as const, reason: `Implied APR ${impliedApr.toFixed(2)}% ≥ ${threshold.toFixed(2)}% (benchmark + buffer)` };
  }
  return { rec: 'HOLD' as const, reason: `Implied APR ${impliedApr.toFixed(2)}% < ${threshold.toFixed(2)}% (benchmark + buffer)` };
}

/** Estimated savings if TAKE = amount * (discountPct/100) */
export function estimatedSavings(amount: number, discountPct: number): number {
  return Number((amount * (discountPct / 100)).toFixed(2));
}