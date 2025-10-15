import prisma from '../prisma.client';

export class RatesService {
  async getToday() {
    // Return a default rate since FRED API is not being used
    // Users can set their own rates in the application
    const defaultRate = {
      asOf: new Date(),
      name: 'DEFAULT',
      annualRatePct: 5.0, // Default 5% annual rate
      deltaBpsDay: 0, // No change
    };

    const rate = await prisma.rate.upsert({
      where: { asOf: new Date(defaultRate.asOf) },
      update: { 
        annualRatePct: defaultRate.annualRatePct, 
        deltaBpsDay: defaultRate.deltaBpsDay, 
        name: defaultRate.name 
      },
      create: {
        asOf: new Date(defaultRate.asOf),
        name: defaultRate.name,
        annualRatePct: defaultRate.annualRatePct,
        deltaBpsDay: defaultRate.deltaBpsDay,
      },
    });

    return rate;
  }
}
