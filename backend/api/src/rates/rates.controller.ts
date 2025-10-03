import { Controller, Get } from '@nestjs/common';
import { RatesService } from './rates.service';

@Controller('api/rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('today')
  async getToday() {
    const rate = await this.ratesService.getToday();
    const asOfDate = rate.asOf instanceof Date ? rate.asOf : new Date(rate.asOf);
    return {
      asOf: asOfDate.toISOString().split('T')[0],
      benchmark: {
        name: rate.name,
        annualRatePct: rate.annualRatePct,
        deltaBpsDay: rate.deltaBpsDay,
      },
    };
  }
}
