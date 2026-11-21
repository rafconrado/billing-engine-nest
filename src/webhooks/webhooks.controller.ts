import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks & Invoices')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('payment')
  @UseGuards(WebhookSignatureGuard)
  @ApiOperation({ summary: 'Processa webhook de pagamento com verificação de idempotência' })
  @ApiHeader({ name: 'x-webhook-secret', description: 'Chave de assinatura do webhook' })
  processPaymentWebhook(@Body() dto: PaymentWebhookDto) {
    return this.webhooksService.processPaymentWebhook(dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Lista todas as faturas geradas' })
  findAllInvoices() {
    return this.webhooksService.findAllInvoices();
  }

  @Post('run-billing-job')
  @ApiOperation({ summary: 'Dispara a rotina de faturamento recorrente' })
  runRecurringBillingJob() {
    return this.webhooksService.runRecurringBillingJob();
  }
}
