import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processPaymentWebhook(dto: PaymentWebhookDto) {
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { externalId: dto.externalId },
    });

    if (existingEvent) {
      return {
        duplicated: true,
        message: `Evento "${dto.externalId}" já processado anteriormente.`,
        event: existingEvent,
      };
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada.');
    }

    const isPaid = dto.type === 'invoice.paid';

    return this.prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: isPaid ? 'PAID' : 'FAILED',
          paidAt: isPaid ? new Date() : null,
        },
      });

      await tx.subscription.update({
        where: { id: invoice.subscriptionId },
        data: { status: isPaid ? 'ACTIVE' : 'PAST_DUE' },
      });

      const webhookEvent = await tx.webhookEvent.create({
        data: {
          externalId: dto.externalId,
          type: dto.type,
          payload: JSON.stringify(dto),
          status: 'PROCESSED',
          attempts: 1,
          processedAt: new Date(),
        },
      });

      return {
        duplicated: false,
        invoice: updatedInvoice,
        webhookEvent,
      };
    });
  }

  async findAllInvoices() {
    return this.prisma.invoice.findMany({
      include: { customer: true, subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runRecurringBillingJob() {
    const now = new Date();
    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: now },
      },
      include: { plan: true },
    });

    let generatedCount = 0;

    for (const sub of dueSubscriptions) {
      const cycleDateStr = sub.nextBillingDate.toISOString().slice(0, 10);
      const idempotencyKey = `sub_${sub.id}_cycle_${cycleDateStr}`;

      const nextCycle = new Date(sub.nextBillingDate);
      if (sub.plan.interval === 'YEARLY') {
        nextCycle.setFullYear(nextCycle.getFullYear() + 1);
      } else {
        nextCycle.setMonth(nextCycle.getMonth() + 1);
      }

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 3);

      await this.prisma.$transaction(async (tx) => {
        const alreadyExists = await tx.invoice.findUnique({
          where: { idempotencyKey },
        });
        if (!alreadyExists) {
          await tx.invoice.create({
            data: {
              subscriptionId: sub.id,
              customerId: sub.customerId,
              amountCents: sub.plan.priceCents,
              status: 'PENDING',
              dueDate,
              idempotencyKey,
            },
          });
          generatedCount++;
        }

        await tx.subscription.update({
          where: { id: sub.id },
          data: { nextBillingDate: nextCycle },
        });
      });
    }

    this.logger.log(`Ciclo recorrente concluído: ${generatedCount} fatura(s) gerada(s).`);
    return {
      checkedSubscriptions: dueSubscriptions.length,
      generatedInvoices: generatedCount,
    };
  }
}
