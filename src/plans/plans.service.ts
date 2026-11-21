import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Já existe um plano cadastrado com o código "${dto.code}".`);
    }

    return this.prisma.plan.create({
      data: {
        name: dto.name,
        code: dto.code,
        priceCents: dto.priceCents,
        interval: dto.interval,
      },
    });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plano com ID "${id}" não encontrado.`);
    }

    return plan;
  }
}
