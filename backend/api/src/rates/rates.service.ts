import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Redis from 'ioredis';
import { fetchFredSeriesLatest } from './fred.client';

@Injectable()
export class RatesService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS') private redis: Redis,
  ) {}

  private cacheKey = 'rate:today';

  async getToday() {
    const cached = await this.redis.get(this.cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Ensure asOf is converted back to Date object
      parsed.asOf = new Date(parsed.asOf);
      return parsed;
    }

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

    await this.redis.setex(this.cacheKey, 60 * 60, JSON.stringify(rate)); // 1h TTL
    return rate;
  }
}
