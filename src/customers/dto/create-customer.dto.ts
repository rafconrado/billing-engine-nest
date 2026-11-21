import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Rafael Conrado' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'rafael@exemplo.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @Matches(/^(?:\d{11}|\d{14})$/, {
    message: 'O documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) apenas com números.',
  })
  document!: string;
}
