# Relatório SRE — Luvaria Ulisses 2026

> Métricas de performance, segurança e confiabilidade do sistema.

---

## 1. Visão Geral

| Métrica | Valor |
|---------|-------|
| **Arquitetura** | Monólito modular (Node.js + Next.js) |
| **Banco de Dados** | PostgreSQL 16 (com WAL e backups automáticos) |
| **Cache** | Redis 7 (rate limiting, sessões) |
| **Storage** | AWS S3 (imagens de produtos) |
| **Containerização** | Docker Compose (multi-stage builds) |
| **Disponibilidade Alvo** | 99.9% uptime |

---

## 2. Segurança

### 2.1 Autenticação e Autorização

| Controle | Status | Detalhes |
|----------|--------|----------|
| **RBAC** | ✅ Implementado | Roles: ADMIN, CLIENT |
| **JWT + Refresh Tokens** | ✅ Implementado | HttpOnly, Secure, SameSite=Strict |
| **Hash de Senhas** | ✅ Implementado | bcrypt com salt round 12 |
| **Sem auto-registro** | ✅ Implementado | Apenas ADMIN cria contas |
| **Conta desativação** | ✅ Implementado | Revogação imediata de todos os tokens |
| **Rate Limiting (login)** | ✅ Implementado | 5 tentativas por 15 minutos |
| **Rate Limiting (geral)** | ✅ Implementado | 100 reqs por 15 minutos |
| **Mensagens genéricas** | ✅ Implementado | Sem enumeração de usuários |

### 2.2 Proteção de API

| Controle | Status | Detalhes |
|----------|--------|----------|
| **Helmet.js** | ✅ Implementado | Headers de segurança |
| **CORS restritivo** | ✅ Implementado | Origem do frontend apenas |
| **Validação Zod** | ✅ Implementado | Todas as entradas validadas |
| **Limite de payload** | ✅ Implementado | 10MB máximo |
| **Webhook Signing** | ✅ Implementado | HMAC SHA256 para n8n |

### 2.3 Storage (AWS S3)

| Controle | Status | Detalhes |
|----------|--------|----------|
| **Upload via Presigned URL** | ✅ Implementado | Upload direto, sem passar pelo servidor |
| **Validação de tipo** | ✅ Implementado | Apenas imagens (JPEG, PNG, WebP, GIF) |
| **Limite de tamanho** | ✅ Implementado | 10MB máximo |
| **ACL** | ✅ Configurado | public-read para imagens do catálogo |

---

## 3. Confiabilidade e Zero Perda de Dados

### 3.1 Banco de Dados

| Controle | Status | Detalhes |
|----------|--------|----------|
| **Volume persistente** | ✅ Configurado | `postgres_data` no Docker |
| **Backups automáticos** | ✅ Configurado | Cron container a cada execução |
| **Retenção** | Configurável | Padrão: 30 dias |
| **Script de restore** | ✅ Documentado | `infra/scripts/restore.sh` |
| **Migrations** | ✅ Prisma | `prisma migrate deploy` no startup |

### 3.2 Upload de Imagens

| Controle | Status | Detalhes |
|----------|--------|----------|
| **Presigned URLs** | ✅ Implementado | Upload direto para S3 |
| **Confirmação** | ✅ Implementado | Endpoint POST `/confirm` valida |
| **Rollback** | ✅ Lógica preparada | Se confirmação falhar, imagem órfã pode ser limpa por cron |

### 3.3 Webhooks (n8n)

| Controle | Status | Detalhes |
|----------|--------|----------|
| **Retry com backoff** | ✅ Implementado | 3 tentativas (2s, 4s, 8s) |
| **Idempotência** | ✅ Implementado | Campo `webhookSent` no DB |
| **Timeout** | ✅ Configurado | 10 segundos |
| **Fila interna** | ✅ Implementado | Processamento assíncrono |
| **Fallback** | ⚠️ Parcial | Logs de erro para retry manual |

---

## 4. Monitoramento

### 4.1 Health Checks

| Endpoint | Descrição | Frequência |
|----------|-----------|------------|
| `/health` | Status básico do servidor | A cada 30s (Docker) |
| `/health/deep` | Verifica PostgreSQL, Redis, S3, n8n | Sob demanda |

### 4.2 Logs

| Tipo | Arquivo | Rotação |
|------|---------|---------|
| **Todos** | `logs/combined.log` | Diária |
| **Erros** | `logs/error.log` | Diária |
| **HTTP** | Console (Morgan) | — |

### 4.3 Alertas (via n8n)

| Condição | Ação |
|----------|------|
| Servidor offline | Webhook para n8n → WhatsApp para admin |
| Erros 500 em massa | Webhook para n8n → WhatsApp para admin |
| Falha no upload S3 | Log de erro → Verificação manual |
| Falha no webhook n8n | Retry automático → Log persistente |

---

## 5. Performance

### 5.1 Otimizações Implementadas

| Técnica | Onde |
|---------|------|
| **Multi-stage builds** | Dockerfiles (alpine) |
| **Imagens standalone** | Next.js output |
| **Índices no DB** | Foreign keys, campos de busca |
| **Paginação** | Listas de usuários, produtos, reservas |
| **Redis para rate limiting** | Middleware global |
| **Presigned URLs** | Upload S3 sem passar pelo servidor |

### 5.2 Metas de Performance

| Métrica | Meta | Como medir |
|---------|------|------------|
| **Tempo de resposta API** | < 200ms (p95) | Logs de Morgan |
| **Tempo de carregamento** | < 3s (FCP) | Lighthouse |
| **Uptime** | 99.9% | Health check monitoring |

---

## 6. Disaster Recovery

### 6.1 Cenários

| Cenário | Recuperação |
|---------|-------------|
| **Banco de dados corrompido** | Restore do último backup (`restore.sh`) |
| **Servidor caiu** | Docker Compose reinicia automaticamente (`restart: unless-stopped`) |
| **S3 indisponível** | URLs de imagens quebram temporariamente; uploads na fila |
| **n8n fora do ar** | Webhooks em fila com retry; processados quando voltar |
| **Imagem corrompida** | Deletar e re-upload via painel admin |

### 6.2 Procedimento de Restore Completo

```bash
# 1. Parar aplicação
docker compose down

# 2. Verificar backup disponível
ls -lh backups/

# 3. Restaurar banco
./infra/scripts/restore.sh backups/backup_20260412_140000.sql.gz

# 4. Reaplicar migrations
docker compose exec backend npx prisma migrate deploy

# 5. Reiniciar
docker compose up -d
```

---

## 7. Checklist de Deploy

- [ ] `docker compose up -d` — todos os containers rodando
- [ ] `docker compose exec backend npx prisma migrate deploy`
- [ ] `curl http://localhost:3001/health/deep` — todos os checks "ok"
- [ ] Testar login com admin e client
- [ ] Verificar webhook n8n: `/api/v1/webhooks/status`
- [ ] Testar criação de reserva e verificar webhook

---

## 8. Contatos de Emergência

| Função | Contato |
|--------|---------|
| **Suporte Técnico** | WhatsApp do Gabriel (admin do sistema) |
| **Infraestrutura** | Administrador do servidor |
| **AWS** | Console AWS → Support |

---

*Última atualização: 12 de abril de 2026*
