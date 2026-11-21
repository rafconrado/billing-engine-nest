import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Plano Pro Mensal' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do plano é obrigatório.' })
  name!: string;

  @ApiProperty({ example: 'PRO_MONTHLY' })
  @IsString()
  @Matches(/^[A-Z0-9_]{3,32}$/, {
    message: 'O código deve conter apenas letras maiúsculas, números e underline.',
  })
  code!: string;

  @ApiProperty({ example: 9990 })
  @IsInt({ message: 'O preço deve ser um número inteiro em centavos.' })
  @Min(100, { message: 'O preço mínimo do plano é 100 centavos.' })
  priceCents!: number;

  @ApiProperty({ example: 'MONTHLY', enum: ['MONTHLY', 'YEARLY'] })
  @IsString()
  @IsIn(['MONTHLY', 'YEARLY'], {
    message: 'O intervalo deve ser MONTHLY ou YEARLY.',
  })
  interval!: 'MONTHLY' | 'YEARLY';
}
