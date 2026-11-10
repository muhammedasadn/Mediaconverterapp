# Runbook: State Restoration

## When to Execute
- Redis data corruption or accidental volume purge.
- Server migration to a fresh VM.

## Restoration Procedure
1. Identify the desired backup archive:
   ```bash
   ls -la /var/backups/universal-media/
   ```
2. Execute the restore script:
   ```bash
   cd /opt/universal-media
   ./scripts/restore.sh /var/backups/universal-media/backup_YYYYMMDD_HHMMSS.tar.gz
   ```
3. Verify Redis connection:
   ```bash
   docker exec converter-redis redis-cli -a "$REDIS_PASSWORD" ping
   ```
4. Verify API readiness:
   ```bash
   curl http://localhost:80/api/ready
   ```
