import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { PlansService } from '../plans/plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly plansService: PlansService,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const customer = await this.customersService.findById(dto.customerId);
    const plan = await this.plansService.findById(dto.planId);

    const existingActive = await this.prisma.subscription.findFirst({
      where: {
        customerId: customer.id,
        planId: plan.id,
        status: 'ACTIVE',
      },
    });

    if (existingActive) {
      throw new ConflictException('Este cliente já possui uma assinatura ativa neste plano.');
    }

    const now = new Date();
    const nextBillingDate = new Date(now);
    if (plan.interval === 'YEARLY') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    const firstDueDate = new Date(now);
    firstDueDate.setDate(firstDueDate.getDate() + 3);
    const cycleDateStr = now.toISOString().slice(0, 10);

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          customerId: customer.id,
          planId: plan.id,
          status: 'ACTIVE',
          nextBillingDate,
        },
      });

      const firstInvoice = await tx.invoice.create({
        data: {
          subscriptionId: subscription.id,
          customerId: customer.id,
          amountCents: plan.priceCents,
          status: 'PENDING',
          dueDate: firstDueDate,
          idempotencyKey: `sub_${subscription.id}_cycle_${cycleDateStr}`,
        },
      });

      return {
        subscription,
        firstInvoice,
      };
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: { customer: true, plan: true, invoices: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada.');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });
  }
}
