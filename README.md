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

## Execução Local

```bash
npm install
cp .env.example .env
npx prisma db push
npm run start:dev
```

## Execução com Docker

O projeto conta com `Dockerfile` multi-stage (`builder` e `runner` em `node:22-alpine`) e orquestração via Docker Compose com `healthcheck`:

```bash
docker compose up -d --build
```

- **Servidor:** `http://localhost:3000`
- **Documentação Swagger:** `http://localhost:3000/docs`

## Licença

MIT
