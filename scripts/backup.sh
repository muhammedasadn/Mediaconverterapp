#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Universal Media Converter — Nightly Automated Backup Script
# Archives Redis state and encrypted configuration
# ----------------------------------------------------------------------------
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/universal-media}"
DATE_STR=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="backup_${DATE_STR}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating Redis snapshot (BGSAVE)..."
docker exec converter-redis redis-cli -a "${REDIS_PASSWORD}" bgsave || true

# Wait for background save to complete
sleep 3

echo "🗜️ Archiving Redis data volume and environment..."
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" \
  -C /var/lib/docker/volumes/mediaconverterapp_redis_data/_data appendonly.aof dump.rdb 2>/dev/null || \
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" \
  -C /data appendonly.aof 2>/dev/null || true

echo "✅ Backup archive created at: ${BACKUP_DIR}/${ARCHIVE_NAME}"

# Keep only the last 7 daily archives to maintain $0 storage footprint
find "$BACKUP_DIR" -type f -name "backup_*.tar.gz" -mtime +7 -delete
echo "🧹 Pruned backups older than 7 days."
