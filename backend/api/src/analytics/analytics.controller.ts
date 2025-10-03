import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('savings-tracker')
  async getSavingsTracker(@User() user: any) {
    return this.analyticsService.getSavingsTracker(user.id);
  }

  @Get('cash-plan')
  async getCashPlan(@User() user: any) {
    return this.analyticsService.getCashPlan(user.id);
  }

  @Get('dashboard-stats')
  async getDashboardStats(@User() user: any) {
    return this.analyticsService.getDashboardStats(user.id);
  }
}
