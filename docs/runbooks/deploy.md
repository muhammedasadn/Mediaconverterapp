# Runbook: Production Deployment

## Automated Deploy via CI/CD
1. Merge your approved PR into branch `main`.
2. GitHub Actions triggers the `CI/CD & Zero-Cost Production Deployment` workflow.
3. The workflow builds multi-arch `linux/arm64` and `linux/amd64` images and pushes them to GHCR.
4. When prompted in the GitHub Actions `production` environment approval gate, click **Review deployments** → **Approve and deploy**.
5. The deployment runner connects over SSH, runs `scripts/deploy.sh <commit_sha>`, verifies healthchecks, runs `scripts/smoke-test.sh`, and auto-rolls back if an anomaly is detected.

## Manual Deploy via SSH (Break-Glass Procedure)
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<VM_PUBLIC_IP>
cd /opt/universal-media
git pull origin main
./scripts/deploy.sh latest
```
