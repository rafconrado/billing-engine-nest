import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'UUID do cliente' })
  @IsUUID('4', { message: 'customerId deve ser um UUID válido.' })
  customerId!: string;

  @ApiProperty({ description: 'UUID do plano' })
  @IsUUID('4', { message: 'planId deve ser um UUID válido.' })
  planId!: string;
}
