# Guia de Deploy — Hospedagem Gratuita para Demonstração

> **Luvaria Ulisses 2026** — Deploy completo em serviços gratuitos: Render (Backend + Postgres), Vercel (Frontend), Upstash (Redis), AWS S3 (Imagens).

---

## 🗺️ Arquitetura de Deploy

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   VERCEL        │  ────►  │   RENDER         │  ────►  │   SUPABASE/     │
│   (Frontend)    │  HTTP   │   (Backend API)  │  SQL    │   NEON          │
│   Next.js 14    │         │   Node.js/Docker │         │   (PostgreSQL)  │
└─────────────────┘         └────────┬─────────┘         └─────────────────┘
                                     │
                          ┌──────────┴──────────┐
                          ▼                     ▼
                   ┌─────────────┐        ┌─────────────┐
                   │   UPSTASH   │        │   AWS S3    │
                   │   (Redis)   │        │  (Imagens)  │
                   └─────────────┘        └─────────────┘
```

---

## 1️⃣ Banco de Dados — Supabase (PostgreSQL Gratuito)

> **Por que Supabase?** PostgreSQL real, 500MB grátis, sem expiração. Alternativa: **Neon.tech** (500MB, branch de DB).

### Passo a Passo

1. Acesse **https://supabase.com** → "Start your project" → Login com GitHub
2. Clique em **"New Project"**
3. Preencha:
   - **Organization**: `luvaria-ulisses`
   - **Project name**: `luvaria-db`
   - **Database Password**: gere uma senha forte (salve!)
   - **Region**: **US East (North Virginia)** — mais perto do Render Oregon
4. Clique em **"Create new project"** (aguarde ~2 minutos)
5. Após pronto, vá em **Settings → Database**
6. Em **Connection string**, selecione **URI** e copie a string:

```
postgresql://postgres.xxxxx:[SUA_SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### ⚠️ Ajuste Importante para Prisma

A string do Supabase vem com `?pgbouncer=true`. **Remova esse parâmetro** para o Prisma funcionar:

```
# ✅ Correto:
postgresql://postgres.xxxxx:SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# ❌ Errado (não funciona com Prisma):
postgresql://postgres.xxxxx:SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

> **Alternativa Neon.tech**: Vá em https://neon.tech → New Project → copie a connection string (já vem sem pgbouncer).

---

## 2️⃣ Redis — Upstash (Serverless Gratuito)

> **Por que Upstash?** Redis serverless, 10k comandos/dia grátis, sem expiração.

### Passo a Passo

1. Acesse **https://upstash.com** → "Start for free" → Login com GitHub
2. Clique em **"Create Database"**
3. Preencha:
   - **Name**: `luvaria-redis`
   - **Region**: **US East (Virginia)** — mesma região do Supabase e Render
   - **Read-only**: desmarcado
   - **Eviction**: deixe marcado (política LRU)
   - **TLS**: ativado (padrão)
4. Clique em **"Create"**
5. Na tela do database, role até **"REST API"** ou **"Connect"**
6. Copie a **UPSTASH_REDIS_REST_URL** — essa é a URL que vamos usar

A URL tem o formato:
```
redis://default:SENHA@HOST:PORTA
```

Se a URL vier no formato `rediss://` (com dois 's'), troque para `redis://`:
```
# Upstash retorna assim:
rediss://default:abc123@my-redis.upstash.io:6379

# Converta para:
redis://default:abc123@my-redis.upstash.io:6379
```

---

## 3️⃣ AWS S3 — Bucket de Imagens (Grátis no Free Tier)

> **Free Tier AWS**: 5GB de armazenamento S3 grátis por 12 meses.

### Passo a Passo

1. Crie uma conta em **https://aws.amazon.com** (precisa de cartão de crédito, mas não cobra no free tier)
2. Vá no console **S3** → **"Create bucket"**
3. Preencha:
   - **Bucket name**: `luvaria-ulisses` (deve ser globalmente único!)
   - **Region**: **US East (N. Virginia) us-east-1**
   - **ACLs**: Enabled (preciso para public-read)
   - **Block Public Access**: **DESMARQUE** "Block all public access"
4. Clique em **"Create bucket"**
5. Vá na aba **Permissions** → **Bucket policy** → adicione:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::luvaria-ulisses/*"
    }
  ]
}
```

6. Crie um **IAM User** para acesso programático:
   - Console IAM → **"Users"** → **"Create user"**
   - Nome: `luvaria-s3-access`
   - Marque **"Attach policies directly"**
   - Adicione a policy **`AmazonS3FullAccess`** (ou crie uma restrita ao bucket)
   - Vá em **"Security credentials"** → **"Create access key"**
   - Selecione **"Application running outside AWS"**
   - **Salve o Access Key ID e Secret Access Key** (só aparece uma vez!)

---

## 4️⃣ Backend — Render.com (Docker Gratuito)

> **Plano Free**: 750 horas/mês, serviço dorme após 15min de inatividade (acorda em ~30s).

### Opção A: Via Blueprint (render.yaml) — Recomendado

1. Faça **fork** do repositório no GitHub
2. Acesse **https://render.com** → Login com GitHub
3. Clique em **"New +"** → **"Blueprint"**
4. Selecione o repositório `luvaria-ulisses-2026-qwen`
5. O Render detectará o `render.yaml` automaticamente
6. Preencha as variáveis marcadas como **[OBRIGATÓRIO]** (veja tabela abaixo)
7. Clique em **"Apply"**
8. Aguarde o deploy (~3-5 minutos)
9. A URL do backend será algo como: `https://luvaria-backend-xxxx.onrender.com`

### Opção B: Deploy Manual

1. No Render, clique em **"New +"** → **"Web Service"**
2. Conecte o repositório GitHub
3. Configure:
   - **Name**: `luvaria-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile**: `Dockerfile.render`
   - **Plan**: **Free**
   - **Health Check Path**: `/health`
   - **Region**: Oregon
4. Adicione todas as variáveis de ambiente (tabela abaixo)
5. Clique em **"Create Web Service"**

---

## 5️⃣ Variáveis de Ambiente — Tabela Completa

| Variável | Onde Obter | Exemplo | Obrigatória? |
|----------|-----------|---------|:------------:|
| `DATABASE_URL` | Supabase/Neon (Settings → Database → Connection string) | `postgresql://postgres.xxxxx:SENHA@host:5432/postgres` | ✅ |
| `JWT_SECRET` | Gerar localmente: `openssl rand -hex 32` | `a1b2c3d4...64chars` | ✅ |
| `JWT_REFRESH_SECRET` | Gerar localmente: `openssl rand -hex 32` (diferente do anterior) | `e5f6g7h8...64chars` | ✅ |
| `JWT_EXPIRES_IN` | Valor fixo | `15m` | ❌ (padrão) |
| `JWT_REFRESH_EXPIRES_IN` | Valor fixo | `7d` | ❌ (padrão) |
| `REDIS_URL` | Upstash (Connect → URL) | `redis://default:SENHA@host:6379` | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS IAM User → Security credentials | `AKIAIOSFODNN7EXAMPLE` | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM User → Security credentials | `wJalrXUtnFEMI/K7MDENG/...` | ✅ |
| `AWS_REGION` | Região do bucket S3 | `us-east-1` | ❌ (padrão) |
| `AWS_S3_BUCKET` | Nome do bucket S3 | `luvaria-ulisses` | ✅ |
| `WEBHOOK_SECRET_N8N` | Gerar: `openssl rand -hex 32` | `abc123...64chars` | ✅ |
| `N8N_WEBHOOK_URL` | URL do webhook no n8n | `https://n8n.exemplo.com/webhook/luvaria` | ❌ |
| `FRONTEND_URL` | URL do frontend na Vercel (crie primeiro o deploy vazio) | `https://luvaria.vercel.app` | ✅ |
| `NODE_ENV` | Ambiente | `production` | ❌ (padrão) |
| `RATE_LIMIT_WINDOW_MS` | Valor fixo | `900000` | ❌ (padrão) |
| `RATE_LIMIT_MAX_REQUESTS` | Valor fixo | `100` | ❌ (padrão) |

### Como Gerar as Secrets no Terminal

```bash
# JWT Secret (64 caracteres hex)
openssl rand -hex 32
# Saída: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2

# Refresh Secret (diferente!)
openssl rand -hex 32

# Webhook Secret
openssl rand -hex 32
```

### Onde Configurar no Render

1. Acesse o serviço `luvaria-backend` no painel do Render
2. Vá na aba **"Environment"**
3. Para cada variável:
   - Clique em **"Add Environment Variable"**
   - Cole a **key** e o **value**
   - Para secrets (JWT, AWS keys, etc.), marque **"Encrypt"** 🔒
4. Clique em **"Save Changes"** — o serviço redeploya automaticamente

---

## 6️⃣ Frontend — Vercel (Next.js Gratuito)

> **Por que Vercel?** É a casa nativa do Next.js. Deploy automático do GitHub, HTTPS, CDN global, 100GB de banda grátis.

### Passo a Passo

1. Acesse **https://vercel.com** → "Sign Up" → Login com **a mesma conta GitHub**
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório `luvaria-ulisses-2026-qwen`
4. Configure:
   - **Framework Preset**: `Next.js` (detecta automaticamente)
   - **Root Directory**: `frontend` ← **IMPORTANTE!**
   - **Build Command**: `next build` (padrão)
   - **Output Directory**: `.next` (padrão)
5. Adicione as **Environment Variables**:

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `NEXT_PUBLIC_API_URL` | URL do backend no Render | `https://luvaria-backend-xxxx.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | URL do frontend na Vercel | `https://luvaria-ulisses.vercel.app` |
| `NEXT_PUBLIC_AWS_S3_BUCKET` | Nome do bucket S3 | `luvaria-ulisses` |
| `NEXT_PUBLIC_AWS_REGION` | Região do S3 | `us-east-1` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número com DDI+DDD | `5511999999999` |

6. Clique em **"Deploy"**
7. Aguarde ~2 minutos
8. A URL será algo como: `https://luvaria-ulisses-xxxx.vercel.app`

### ⚠️ Conexão Frontend → Backend

O ponto **CRUCIAL** é a variável `NEXT_PUBLIC_API_URL` no frontend apontar para a URL do backend no Render.

```
✅ Correto:
NEXT_PUBLIC_API_URL=https://luvaria-backend-xxxx.onrender.com

❌ Errado:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Se alterar a variável, é necessário um **novo deploy** na Vercel:
- Vercel → Projeto → **"Deployments"** → **"Redeploy"** (último deploy)
- Ou faça push de qualquer commit no repositório

---

## 7️⃣ CORS — Configurando o Backend para Aceitar o Frontend

O backend usa **Helmet + CORS** restritivo. A variável `FRONTEND_URL` controla qual origem é aceita.

No painel do Render, certifique-se de que:

```
FRONTEND_URL=https://luvaria-ulisses-xxxx.vercel.app
```

**Sem barra no final!** Com barra, o CORS pode falhar.

```
✅ Correto:  https://luvaria-ulisses.vercel.app
❌ Errado:   https://luvaria-ulisses.vercel.app/
```

---

## 8️⃣ Pós-Deploy — Primeiros Passos

### Rodar Migrations

```bash
# Via painel do Render → Shell:
npx prisma migrate deploy
```

Ou conecte-se localmente ao banco remoto:

```bash
# Copie o DATABASE_URL do Render
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

### Criar o Primeiro Admin

```bash
# Via Render Shell:
npm run db:seed
```

Ou manualmente via API:

```bash
# Primeiro faça login (se já existir um admin) ou crie via API direta no DB
curl -X POST https://luvaria-backend-xxxx.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@luvariaulisses.com","password":"Admin@2026!"}'
```

### Verificar Health

```bash
# Health básico
curl https://luvaria-backend-xxxx.onrender.com/health

# Deep health (verifica DB, Redis, S3)
curl https://luvaria-backend-xxxx.onrender.com/health/deep
```

Esperado:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-12T14:00:00.000Z",
  "checks": {
    "postgres": { "status": "ok" },
    "redis": { "status": "ok" },
    "s3": { "status": "ok" },
    "n8n": { "status": "not_configured" }
  }
}
```

---

## 9️⃣ Limitações do Plano Gratuito

| Serviço | Limite | Impacto |
|---------|--------|---------|
| **Render (Free)** | Serviço dorme após 15min de inatividade | Primeiro acesso após inatividade leva ~30s para acordar |
| **Supabase (Free)** | 500MB de DB | Suficiente para ~50k usuários + produtos |
| **Neon (Free)** | 500MB, branch único | Similar ao Supabase |
| **Upstash (Free)** | 10k comandos Redis/dia | Suficiente para rate limiting básico |
| **Vercel (Free)** | 100GB banda/mês | ~10k visitantes/mês |
| **AWS S3 (Free Tier)** | 5GB por 12 meses | ~500 imagens de produtos |

### 💡 Dica: Manter o Backend Acordado

Para demonstrações, use um serviço como **UptimeRobot** (grátis) para pingar o endpoint `/health` a cada 10 minutos:

1. Acesse **https://uptimerobot.com**
2. Crie um monitor **HTTP(s)**
3. URL: `https://luvaria-backend-xxxx.onrender.com/health`
4. Interval: **10 minutes**
5. Friendly name: `Luvaria Backend Keep-Alive`

---

## 🔟 Ordem Correta de Deploy

```
1. Supabase/Neon    → Cria o banco, copia DATABASE_URL
2. Upstash          → Cria o Redis, copia REDIS_URL
3. AWS S3           → Cria bucket, copia AWS keys
4. Render (Backend) → Deploy com todas as vars, copia URL do backend
5. Vercel (Frontend) → Deploy apontando NEXT_PUBLIC_API_URL para o backend
6. Seed/Migrations  → Roda prisma migrate deploy + seed
```

> ⚠️ Se alterar qualquer variável no backend, o redeploy é automático. Se alterar `NEXT_PUBLIC_API_URL` no frontend, precisa de redeploy manual na Vercel.

---

## 🆘 Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| **Build falha no Render** | `package-lock.json` ausente | Rode `npm install` localmente e commit do lock |
| **Erro de CORS** | `FRONTEND_URL` com barra ou errado | Remova a `/` final e verifique o domínio |
| **Erro de DB no deploy** | Migrations não rodaram | Render Shell → `npx prisma migrate deploy` |
| **Prisma não conecta** | `?pgbouncer=true` na URL | Remova o parâmetro pgbouncer |
| **Redis falha** | URL com `rediss://` | Troque para `redis://` |
| **S3 403 Forbidden** | Bucket sem política pública | Verifique a bucket policy e ACLs |
| **Frontend 500** | `NEXT_PUBLIC_API_URL` errado | Redeploy na Vercel com URL correto |
| **JWT inválido** | Segredo muito curto | Use `openssl rand -hex 32` (64 chars) |

---

*Última atualização: 12 de abril de 2026*
