import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('explain-invoice')
  async explainInvoice(@Body() body: { invoiceId: string }) {
    return await this.chatService.explainInvoice(body.invoiceId);
  }

  @Post('pick-top-discounts')
  async pickTopDiscounts(@Body() body: { budget: number }) {
    return await this.chatService.pickTopDiscounts(body.budget);
  }
}
