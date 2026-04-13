# Luvaria Ulisses 2026

> Plataforma de luxo artesanal para a Luvaria Ulisses — modernizando a experiência de compra e reserva de luvas sob medida desde 1925.

## Visão Geral

Sistema SaaS completo que:
- Organiza inventário de luvas e materiais de forma inteligente
- Permite agendamento de "Reserva VIP" para atendimento presencial
- Automatiza comunicação via WhatsApp/E-mail (n8n)
- Reduz desorganização no processo de pedidos e pós-venda

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + TypeScript (Clean Architecture) |
| Frontend | Next.js 14 (App Router) + React + Tailwind + Framer Motion |
| Banco de Dados | PostgreSQL + Prisma ORM |
| Cache/Rate Limiting | Redis |
| Storage | AWS S3 (SDK v3) |
| Automação | n8n (Webhooks outbound com HMAC SHA256) |
| Containerização | Docker + Docker Compose |

## Estrutura de Pastas

```
luvaria-ulisses-2026/
├── backend/                    # API Node.js (Clean Architecture)
│   ├── src/
│   │   ├── core/              # Entidades, erros de domínio, value objects
│   │   ├── modules/           # Módulos por domínio
│   │   │   ├── auth/          # Autenticação e autorização
│   │   │   ├── users/         # Gestão de usuários
│   │   │   ├── products/      # Catálogo de luvas
│   │   │   ├── materials/     # Materiais e forros
│   │   │   ├── reservations/  # Reservas VIP
│   │   │   ├── uploads/       # Gestão de arquivos S3
│   │   │   └── webhooks/      # Disparo de eventos para n8n
│   │   ├── shared/            # Infraestrutura compartilhada
│   │   │   ├── database/      # Prisma client
│   │   │   ├── config/        # Variáveis de ambiente
│   │   │   ├── middleware/    # Middlewares globais
│   │   │   ├── utils/         # Utilitários
│   │   │   └── webhook-signer.ts
│   │   └── app.ts             # Bootstrap da aplicação
│   ├── prisma/                # Schema e migrations
│   ├── tests/                 # Testes unitários e integração
│   ├── Dockerfile
│   └── package.json
├── frontend/                  # Next.js 14 App Router
│   ├── src/
│   │   ├── app/              # Rotas (App Router)
│   │   │   ├── (client)/     # Rotas públicas do cliente
│   │   │   ├── (admin)/      # Painel administrativo
│   │   │   └── api/          # API routes (auth proxy)
│   │   ├── components/       # Componentes React
│   │   │   ├── ui/           # Componentes base (botões, inputs)
│   │   │   ├── client/       # Componentes do cliente
│   │   │   └── admin/        # Componentes do admin
│   │   ├── lib/              # Utilitários e hooks
│   │   ├── services/         # Camada de API client
│   │   └── styles/           # Tailwind e globals
│   ├── Dockerfile
│   └── package.json
├── infra/
│   ├── docker-compose.yml
│   ├── nginx/                # Configuração do reverse proxy
│   ├── scripts/              # Backup, restore, health checks
│   └── monitoring/           # Health check endpoints
├── docs/
│   ├── WEBHOOK-MAP.md        # Documentação de webhooks para n8n
│   ├── GUIA-USUARIO.md       # Guia para o gerente da Luvaria
│   └── SRE-REPORT.md         # Relatório SRE
└── README.md
```

## Quick Start

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- AWS S3 credentials (para upload de imagens)

### 1. Clone e configure variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Ou gere secrets automáticos:
./infra/scripts/generate-secrets.sh
```

### 2. Suba a infraestrutura

```bash
docker compose up -d
```

### 3. Execute migrations

```bash
docker compose exec backend npx prisma migrate dev
```

### 4. Crie o primeiro admin

```bash
docker compose exec backend npm run seed
```

### 5. Acesse

- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Deploy em Host Gratuito (Demonstração)

Veja o guia completo em [`docs/GUIA-DEPLOY.md`](docs/GUIA-DEPLOY.md).

| Componente | Onde Hospedar | Custo |
|---|---|---|
| **Frontend (Next.js)** | Vercel | Grátis |
| **Backend (Node.js)** | Render.com | Grátis |
| **PostgreSQL** | Supabase ou Neon.tech | Grátis |
| **Redis** | Upstash | Grátis |
| **Imagens** | AWS S3 (Free Tier) | Grátis (12 meses) |

Deploy rápido:
```bash
# 1. Fork o repo no GitHub
# 2. Render.com → Blueprint → conecte o repo
# 3. Vercel.com → Import repo → Root: frontend
# 4. Configure env vars (veja GUIA-DEPLOY.md)
```

## Backup e Restore

### Backup Manual

```bash
docker compose exec -T postgres pg_dump -U luvaria luvaria_db | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Backup Automático

O cron container executa backups automáticos a cada 6 horas. Os arquivos ficam em `backups/`.

### Restore

```bash
gunzip < backups/backup_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U luvaria luvaria_db
```

## Webhooks para n8n

Todos os eventos são assinados com HMAC SHA256. Veja `docs/WEBHOOK-MAP.md` para detalhes.

## Testes

```bash
# Backend
cd backend && npm test

# Frontend E2E
cd frontend && npm run test:e2e
```

## Monitoramento

- `/health` — Status básico (200 OK)
- `/health/deep` — Verifica DB, Redis, S3 e n8n connectivity

---

**Luvaria Ulisses** — Tradição desde 1925, modernizada para 2026.
