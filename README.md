# Billing Engine API

API REST desenvolvida com **NestJS** e **Prisma ORM** para gerenciamento de planos, assinaturas recorrentes, faturamento automatizado e processamento idempotente de webhooks de pagamento.

## Arquitetura e Recursos

- **Plans (`/plans`)**: Cadastro e consulta de planos (`MONTHLY` e `YEARLY`) com valores armazenados em centavos (`Int`).
- **Customers (`/customers`)**: Cadastro de clientes PF/PJ com validação de documento e e-mail único.
- **Subscriptions (`/subscriptions`)**: Criação de assinaturas com geração atômica (`$transaction`) da primeira fatura e controle de cancelamento.
- **Webhooks & Invoices (`/webhooks`)**:
  - Validação de assinatura via `WebhookSignatureGuard` (`x-webhook-secret`).
  - Garantia de idempotência por `externalId` para evitar baixa duplicada de faturas.
  - Rotina agendada (`@Cron`) para geração de faturas recorrentes a cada ciclo vencido.

## Requisitos e Execução

```bash
npm install
cp .env.example .env
npx prisma db push
npm run start:dev
```

- **Servidor:** `http://localhost:3000`
- **Documentação Swagger:** `http://localhost:3000/docs`

## Licença

MIT
