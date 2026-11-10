# Runbook: Emergency Rollback

## When to Execute
- `smoke-test.sh` reports failing status codes or missing security headers.
- Container logs show repeated crashloops or unhandled exceptions.
- FFmpeg worker fails to process conversion jobs.

## Automatic Rollback
If the deploy script (`scripts/deploy.sh`) detects that `/api/health` does not respond within 45 seconds of recreating containers, it automatically triggers `scripts/rollback.sh` with the previous image tag.

## Manual Rollback Procedure
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<VM_PUBLIC_IP>
cd /opt/universal-media

# Rollback to the previous stable release tag
./scripts/rollback.sh <PREVIOUS_COMMIT_SHA_OR_TAG>

# Verify system logs
docker compose -f docker-compose.prod.yml logs --tail=50 api
docker compose -f docker-compose.prod.yml logs --tail=50 worker
```
