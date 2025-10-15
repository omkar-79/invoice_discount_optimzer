import prisma from '../prisma.client';
import { DecisionAction } from '@prisma/client';

export class AnalyticsService {
  // Helper function to parse discount percentage from terms
  private parseDiscountPercentage(terms: string): number {
    const match = terms.match(/(\d+)\/\d+/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Generates savings tracker data for the last 6 months
   * Combines actual savings from past decisions with potential savings from current recommendations
   * 
   * @param userId - User ID for data isolation
   * @returns Monthly savings data for chart visualization
   */
  async getSavingsTracker(userId: string) {
    // Get savings data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Get actual decisions made
    const decisions = await prisma.decision.findMany({
      where: {
        userId,
        action: 'APPROVE_TAKE',
        timestamp: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        timestamp: true,
        estimatedSavings: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Get current pending invoices with potential savings
    const currentInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      select: {
        amount: true,
        terms: true,
        recommendation: true,
        borrowingCost: true,
        investmentReturn: true,
      },
    });

    // Group by month and sum savings
    const monthlySavings = new Map<string, number>();
    
    // Add actual savings from decisions made
    decisions.forEach(decision => {
      const monthKey = decision.timestamp.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlySavings.get(monthKey) || 0;
      monthlySavings.set(monthKey, current + Number(decision.estimatedSavings));
    });

    // Add potential savings from current recommendations
    const currentMonth = new Date().toISOString().substring(0, 7);
    let currentMonthPotential = monthlySavings.get(currentMonth) || 0;
    
    currentInvoices.forEach(invoice => {
      if (invoice.recommendation === 'TAKE') {
        // For TAKE: potential discount savings
        const discountPct = this.parseDiscountPercentage(invoice.terms);
        const potentialSavings = Number(invoice.amount) * (discountPct / 100);
        currentMonthPotential += potentialSavings;
      } else if (invoice.recommendation === 'BORROW') {
        // For BORROW: net benefit (savings - borrowing cost)
        const discountPct = this.parseDiscountPercentage(invoice.terms);
        const discountSavings = Number(invoice.amount) * (discountPct / 100);
        const netBenefit = discountSavings - (invoice.borrowingCost || 0);
        if (netBenefit > 0) {
          currentMonthPotential += netBenefit;
        }
      }
    });
    
    monthlySavings.set(currentMonth, currentMonthPotential);

    // Convert to array format for chart
    const savingsData = Array.from(monthlySavings.entries()).map(([month, savings]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      savings,
    }));

    // Fill in missing months with 0 savings
    const allMonths: Array<{ month: string; savings: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const existingData = savingsData.find(d => d.month === monthName);
      allMonths.push({
        month: monthName,
        savings: existingData?.savings || 0,
      });
    }

    return allMonths;
  }

  /**
   * Generates cash plan data for the last 4 weeks
   * Shows cash flow from both past decisions and current recommendations
   * 
   * @param userId - User ID for data isolation
   * @returns Weekly cash flow data for chart visualization
   */
  async getCashPlan(userId: string) {
    // Get current week's data
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get decisions for the last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const decisions = await prisma.decision.findMany({
      where: {
        userId,
        timestamp: {
          gte: fourWeeksAgo,
        },
      },
      select: {
        timestamp: true,
        action: true,
        estimatedSavings: true,
        invoiceIds: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Get current pending invoices for potential cash flow
    const currentInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      select: {
        amount: true,
        terms: true,
        recommendation: true,
        borrowingCost: true,
        investmentReturn: true,
      },
    });

    // Group by week
    const weeklyData = new Map<string, { take: number; hold: number }>();
    
    decisions.forEach(decision => {
      const weekStart = new Date(decision.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().substring(0, 10);
      
      const current = weeklyData.get(weekKey) || { take: 0, hold: 0 };
      
      if (decision.action === 'APPROVE_TAKE') {
        current.take += Number(decision.estimatedSavings);
      } else if (decision.action === 'APPROVE_HOLD') {
        // For hold decisions, we estimate the cash amount based on invoice amounts
        // This is a simplified calculation - in reality you'd need to track the actual invoice amounts
        current.hold += Number(decision.estimatedSavings) * 10; // Rough estimate
      }
      
      weeklyData.set(weekKey, current);
    });

    // Add current week's potential cash flow from pending invoices
    const currentWeekKey = new Date().toISOString().substring(0, 10);
    const currentWeekData = weeklyData.get(currentWeekKey) || { take: 0, hold: 0 };
    
    currentInvoices.forEach(invoice => {
      if (invoice.recommendation === 'TAKE') {
        // For TAKE: potential discount savings
        const discountPct = this.parseDiscountPercentage(invoice.terms);
        const potentialSavings = Number(invoice.amount) * (discountPct / 100);
        currentWeekData.take += potentialSavings;
      } else if (invoice.recommendation === 'BORROW') {
        // For BORROW: net benefit (savings - borrowing cost)
        const discountPct = this.parseDiscountPercentage(invoice.terms);
        const discountSavings = Number(invoice.amount) * (discountPct / 100);
        const netBenefit = discountSavings - (invoice.borrowingCost || 0);
        if (netBenefit > 0) {
          currentWeekData.take += netBenefit;
        }
      } else if (invoice.recommendation === 'HOLD') {
        // For HOLD: potential investment return
        if (invoice.investmentReturn) {
          currentWeekData.hold += invoice.investmentReturn;
        }
      }
    });
    
    weeklyData.set(currentWeekKey, currentWeekData);

    // Convert to array format for chart
    const cashPlanData: Array<{ week: string; take: number; hold: number }> = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
      const weekKey = weekStart.toISOString().substring(0, 10);
      
      const data = weeklyData.get(weekKey) || { take: 0, hold: 0 };
      cashPlanData.push({
        week: `Week ${4 - i}`,
        take: data.take,
        hold: data.hold,
      });
    }

    return cashPlanData;
  }

  async getDashboardStats(userId: string) {
    // Get total savings from all approved take decisions
    const totalSavings = await prisma.decision.aggregate({
      where: {
        userId,
        action: 'APPROVE_TAKE',
      },
      _sum: {
        estimatedSavings: true,
      },
    });

    // Get total decisions count
    const totalDecisions = await prisma.decision.count({
      where: {
        userId,
      },
    });

    // Get this month's savings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthSavings = await prisma.decision.aggregate({
      where: {
        userId,
        action: 'APPROVE_TAKE',
        timestamp: {
          gte: startOfMonth,
        },
      },
      _sum: {
        estimatedSavings: true,
      },
    });

    return {
      totalSavings: Number(totalSavings._sum.estimatedSavings || 0),
      totalDecisions,
      thisMonthSavings: Number(thisMonthSavings._sum.estimatedSavings || 0),
    };
  }
}
