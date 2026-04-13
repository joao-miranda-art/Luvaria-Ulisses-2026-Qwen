#!/bin/bash
# ============================================================
# Script de Restore — Luvaria Ulisses 2026
# Uso: ./restore.sh <backup_file.sql.gz>
# ============================================================

set -e

if [ -z "$1" ]; then
  echo "Uso: $0 <backup_file.sql.gz>"
  echo ""
  echo "Backups disponíveis:"
  ls -lh ./backups/backup_*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado."
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  # Tentar no diretório de backups
  BACKUP_FILE="./backups/$(basename $1)"
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Arquivo não encontrado: ${BACKUP_FILE}"
  exit 1
fi

echo "⚠️  ATENÇÃO: Este processo irá SUBSTITUIR todos os dados atuais do banco."
echo "📦 Arquivo de restore: ${BACKUP_FILE}"
read -p "Tem certeza? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Restore cancelado."
  exit 1
fi

# Drop e recriar banco
echo "🔄 Preparando banco de dados..."
docker compose exec -T postgres psql -U luvaria -c "DROP DATABASE IF EXISTS luvaria_db;"
docker compose exec -T postgres psql -U luvaria -c "CREATE DATABASE luvaria_db;"

# Restaurar
echo "🔄 Restaurando backup..."
gunzip -c "${BACKUP_FILE}" | docker compose exec -T postgres psql -U luvaria luvaria_db

echo "✅ Restore concluído com sucesso!"
echo "📋 Execute 'docker compose exec backend npx prisma migrate deploy' para aplicar migrations."
