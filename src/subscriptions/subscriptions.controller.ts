import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova assinatura e gera a primeira fatura' })
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as assinaturas' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancela uma assinatura pelo ID' })
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
