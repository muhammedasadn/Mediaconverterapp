# Runbook: State Backup

## Overview
State in Universal Media Converter consists of:
1. BullMQ job queue state and retry metadata inside Redis (AOF / RDB).
2. Production configuration inside `.env` (`600` permissions).

## Automated Backup Schedule
A nightly cron job triggers `/opt/universal-media/scripts/backup.sh` at `03:00 UTC`:
```cron
0 3 * * * /opt/universal-media/scripts/backup.sh >> /var/log/universal-media-backup.log 2>&1
```

## Manual Backup Trigger
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<VM_PUBLIC_IP>
cd /opt/universal-media
./scripts/backup.sh
```

Backups are stored in `/var/backups/universal-media/backup_YYYYMMDD_HHMMSS.tar.gz`. Backups older than 7 days are automatically pruned to maintain $0 storage costs.
