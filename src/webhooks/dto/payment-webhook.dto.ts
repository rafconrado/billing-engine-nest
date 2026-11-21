import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ example: 'evt_pay_0001' })
  @IsString()
  @IsNotEmpty()
  externalId!: string;

  @ApiProperty({
    example: 'invoice.paid',
    enum: ['invoice.paid', 'invoice.payment_failed'],
  })
  @IsString()
  @IsIn(['invoice.paid', 'invoice.payment_failed'])
  type!: 'invoice.paid' | 'invoice.payment_failed';

  @ApiProperty({ description: 'UUID da fatura' })
  @IsUUID('4', { message: 'invoiceId deve ser um UUID válido.' })
  invoiceId!: string;
}
