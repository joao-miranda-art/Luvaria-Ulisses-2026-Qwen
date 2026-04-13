#!/bin/bash
# ============================================================
# Gerador de Secrets — Luvaria Ulisses 2026
# Use este script para gerar as variáveis de ambiente
# necessárias para deploy em produção.
# ============================================================

echo "============================================"
echo "  Luvaria Ulisses 2026 — Gerador de Secrets"
echo "============================================"
echo ""

# Verificar se openssl está disponível
if ! command -v openssl &> /dev/null; then
  echo "❌ openssl não encontrado. Instale-o antes de continuar."
  exit 1
fi

# Gerar secrets
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 24)

echo "🔐 Secrets gerados com sucesso!"
echo ""
echo "----------------------------------------"
echo "  backend/.env (copie e cole):"
echo "----------------------------------------"
echo ""
echo "JWT_SECRET=${JWT_SECRET}"
echo "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}"
echo "WEBHOOK_SECRET_N8N=${WEBHOOK_SECRET}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo "REDIS_PASSWORD=${REDIS_PASSWORD}"
echo ""
echo "----------------------------------------"
echo "  docker-compose.yml (.env do projeto):"
echo "----------------------------------------"
echo ""
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo "REDIS_PASSWORD=${REDIS_PASSWORD}"
echo "JWT_SECRET=${JWT_SECRET}"
echo "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}"
echo "WEBHOOK_SECRET_N8N=${WEBHOOK_SECRET}"
echo ""
echo "----------------------------------------"
echo "  Variáveis adicionais para configurar:"
echo "----------------------------------------"
echo ""
echo "DATABASE_URL=postgresql://luvaria:${POSTGRES_PASSWORD}@postgres:5432/luvaria_db"
echo "REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379"
echo "AWS_ACCESS_KEY_ID=<sua_access_key_da_aws>"
echo "AWS_SECRET_ACCESS_KEY=<sua_secret_key_da_aws>"
echo "AWS_S3_BUCKET=luvaria-ulisses"
echo "AWS_REGION=us-east-1"
echo "N8N_WEBHOOK_URL=<url_do_seu_webhook_n8n>"
echo "FRONTEND_URL=http://localhost:3000"
echo ""
echo "⚠️  Salve estes valores em um local seguro!"
echo "⚠️  NUNCA commite secrets no repositório."
echo ""
