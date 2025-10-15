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

/** Calculate investment return if holding cash until due date */
export function calculateInvestmentReturn(
  amount: number,
  annualRate: number,
  daysToHold: number
): number {
  const dailyRate = annualRate / 365 / 100;
  return amount * dailyRate * daysToHold;
}

/** Calculate borrowing cost to pay early */
export function calculateBorrowingCost(
  amount: number,
  annualBorrowingRate: number,
  discountDays: number,
  netDays: number
): number {
  const daysOfBorrowing = netDays - discountDays;
  const dailyRate = annualBorrowingRate / 365 / 100;
  return amount * dailyRate * daysOfBorrowing;
}

/** Calculate discount savings */
export function calculateDiscountSavings(
  amount: number,
  discountPct: number
): number {
  return amount * (discountPct / 100);
}

/**
 * Advanced recommendation logic with three-scenario analysis
 * 
 * This function analyzes three financial scenarios:
 * 1. PAY EARLY: Use own cash to capture discount
 * 2. HOLD CASH: Invest cash elsewhere for better returns
 * 3. BORROW TO PAY EARLY: Borrow money to capture discount
 * 
 * @param amount - Invoice amount
 * @param discountPct - Discount percentage (e.g., 2 for 2%)
 * @param discountDays - Days to pay for discount (e.g., 10)
 * @param netDays - Total payment terms (e.g., 30)
 * @param userRate - User's investment or borrowing rate (annual %)
 * @param rateType - Whether rate is for investment or borrowing
 * @returns Recommendation with reasoning and scenario calculations
 */
export function recommendWithScenarios(
  amount: number,
  discountPct: number,
  discountDays: number,
  netDays: number,
  userRate: number,
  rateType: 'INVESTMENT' | 'BORROWING'
) {
  const discountSavings = calculateDiscountSavings(amount, discountPct);
  
  if (rateType === 'INVESTMENT') {
    // For investment scenario: compare discount savings vs investment return for the discount period
    const investmentReturn = calculateInvestmentReturn(amount, userRate, discountDays);
    
    // Compare: discount savings vs investment return
    if (discountSavings > investmentReturn) {
      return {
        rec: 'TAKE' as const,
        reason: `Take discount: Save $${discountSavings.toFixed(2)} vs earning $${investmentReturn.toFixed(2)} from investment`,
        scenarios: {
          payEarly: discountSavings,
          hold: investmentReturn,
          borrow: null
        }
      };
    } else {
      return {
        rec: 'HOLD' as const,
        reason: `Hold cash: Earn $${investmentReturn.toFixed(2)} from investment vs $${discountSavings.toFixed(2)} discount`,
        scenarios: {
          payEarly: discountSavings,
          hold: investmentReturn,
          borrow: null
        }
      };
    }
  } else {
    // BORROWING scenario: compare discount savings vs borrowing cost
    const borrowingCost = calculateBorrowingCost(amount, userRate, discountDays, netDays);
    const netBenefit = discountSavings - borrowingCost;
    
    if (netBenefit > 0) {
      return {
        rec: 'BORROW' as const,
        reason: `Borrow to pay early: Net benefit $${netBenefit.toFixed(2)} (save $${discountSavings.toFixed(2)} - borrow cost $${borrowingCost.toFixed(2)})`,
        scenarios: {
          payEarly: discountSavings,
          hold: 0,
          borrow: borrowingCost
        }
      };
    } else {
      return {
        rec: 'HOLD' as const,
        reason: `Don't borrow: Cost $${borrowingCost.toFixed(2)} exceeds discount $${discountSavings.toFixed(2)}`,
        scenarios: {
          payEarly: discountSavings,
          hold: 0,
          borrow: borrowingCost
        }
      };
    }
  }
}
