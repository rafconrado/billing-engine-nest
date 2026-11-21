import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: dto.email }, { document: dto.document }],
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um cliente com este e-mail ou CPF/CNPJ.');
    }

    return this.prisma.customer.create({ data: { ...dto } });
  }

  async findAll() {
    return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return customer;
  }
}
