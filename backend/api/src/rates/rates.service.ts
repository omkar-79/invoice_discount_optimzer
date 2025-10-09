import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { fetchFredSeriesLatest } from './fred.client';

@Injectable()
export class RatesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getToday() {
    const apiKey = process.env.FRED_API_KEY!;
    const series = process.env.FRED_SERIES_CODE || 'DGS3MO';
    const latest = await fetchFredSeriesLatest(apiKey, series);

    const rate = await this.prisma.rate.upsert({
      where: { asOf: new Date(latest.asOf) },
      update: { 
        annualRatePct: latest.annualRatePct, 
        deltaBpsDay: latest.deltaBpsDay, 
        name: series 
      },
      create: {
        asOf: new Date(latest.asOf),
        name: series,
        annualRatePct: latest.annualRatePct,
        deltaBpsDay: latest.deltaBpsDay,
      },
    });

    return rate;
  }
}
