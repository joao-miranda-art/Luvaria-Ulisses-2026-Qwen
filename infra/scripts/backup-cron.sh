#!/bin/sh
# ============================================================
# Backup Automático do PostgreSQL — Luvaria Ulisses 2026
# Executado via cron dentro do container de backup
# ============================================================

set -e

BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
until pg_isready -h postgres -U luvaria -d luvaria_db > /dev/null 2>&1; do
  sleep 5
done

echo "🔄 Iniciando backup: ${BACKUP_FILE}"

# Executar backup
pg_dump -h postgres -U luvaria -d luvaria_db | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "✅ Backup concluído: ${BACKUP_SIZE}"
else
  echo "❌ Falha no backup!"
  exit 1
fi

# Limpar backups antigos
echo "🧹 Limpando backups com mais de ${RETENTION_DAYS} dias..."
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# Listar backups disponíveis
echo "📦 Backups disponíveis:"
ls -lh "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado."

echo "✅ Processo de backup finalizado."
