import { Controller, Post, Get, Patch, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService } from './invoices.service';
import { RatesService } from '../rates/rates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly ratesService: RatesService,
  ) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // Debug log: request metadata
    Logger.log(
      `Import request received: userId=${user?.id} filename=${file.originalname} size=${file.size} bytes mimetype=${file.mimetype}`,
      InvoicesController.name,
    );

    const result = await this.invoicesService.importCsv(file.buffer, user.id);
    Logger.log(
      `Import completed: userId=${user?.id} imported=${result.imported} skipped=${result.skipped}`,
      InvoicesController.name,
    );
    return result;
  }

  @Get()
  async list(
    @User() user: any,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const result = await this.invoicesService.list({ status, limit: limitNum, cursor }, user.id);
    
    // Transform to match frontend expectations
    const items = result.items.map(invoice => ({
      id: invoice.id,
      vendor: invoice.vendor,
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.amount),
      currency: invoice.currency,
      invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      terms: invoice.terms,
      discountDeadline: invoice.discountDeadline?.toISOString().split('T')[0],
      impliedAprPct: invoice.impliedAprPct,
      recommendation: invoice.recommendation,
      reason: invoice.reason,
      status: invoice.status,
      userRate: invoice.userRate,
      rateType: invoice.rateType,
      borrowingCost: invoice.borrowingCost,
      investmentReturn: invoice.investmentReturn,
    }));

    return { items, nextCursor: result.nextCursor };
  }

  @Post('update-recommendations')
  async updateRecommendations(@User() user: any) {
    const result = await this.invoicesService.updateRecommendations(user.id);
    return result;
  }

  @Patch(':id/rate')
  async updateInvoiceRate(
    @Param('id') id: string,
    @Body() body: { userRate: number; rateType: 'INVESTMENT' | 'BORROWING' },
    @User() user: { id: string }
  ) {
    const result = await this.invoicesService.updateInvoiceRate(id, body.userRate, body.rateType, user.id);
    return result;
  }
}
