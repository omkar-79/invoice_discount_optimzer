import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('api/decisions')
@UseGuards(JwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post()
  async decide(
    @Body() body: { invoiceIds: string[]; action: string; note?: string },
    @User() user: any,
  ) {
    const result = await this.decisionsService.decide(
      user.id,
      body.invoiceIds,
      body.action as any,
      body.note,
    );
    return result;
  }

  @Get('audit')
  async audit(
    @User() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.decisionsService.audit(user.id, from, to);
    return result;
  }
}
