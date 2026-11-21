import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const receivedSecret = request.headers['x-webhook-secret'];
    const expectedSecret = process.env.WEBHOOK_SECRET ?? 'whsec_local_dev_secret';

    if (!receivedSecret || expectedSecret !== receivedSecret) {
      throw new UnauthorizedException('Assinatura do webhook inválida ou ausente.');
    }

    return true;
  }
}
