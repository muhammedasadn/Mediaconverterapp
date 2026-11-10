#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Universal Media Converter — State Restoration Script
# Restores Redis queue and database from a backup archive
# ----------------------------------------------------------------------------
set -euo pipefail

BACKUP_ARCHIVE="${1:-}"

if [[ -z "$BACKUP_ARCHIVE" || ! -f "$BACKUP_ARCHIVE" ]]; then
  echo "❌ Error: Backup archive path required."
  echo "   Usage: $0 /var/backups/universal-media/backup_YYYYMMDD_HHMMSS.tar.gz"
  exit 1
fi

echo "========================================================"
echo "⚠️  RESTORING SYSTEM STATE FROM: $BACKUP_ARCHIVE"
echo "========================================================"

echo "🛑 Stopping Redis service..."
docker compose -f docker-compose.prod.yml stop redis

echo "📥 Extracting archive into Redis volume..."
tar -xzf "$BACKUP_ARCHIVE" -C /var/lib/docker/volumes/mediaconverterapp_redis_data/_data/ || true

echo "🚀 Restarting Redis with restored state..."
docker compose -f docker-compose.prod.yml up -d redis

echo "⏳ Verifying Redis health..."
sleep 3
docker exec converter-redis redis-cli -a "${REDIS_PASSWORD}" ping

echo "✅ Restoration completed successfully!"
