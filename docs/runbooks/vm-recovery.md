# Runbook: VM Disaster Recovery & Rebuild (< 20 Minutes)

## Scenario: Oracle Reclaimed or Shrank Instance
If Oracle terminates an idle Always Free instance or hardware failure occurs, execute this disaster recovery procedure to rebuild the entire backend from scratch in under 20 minutes.

### Step 1: Re-provision Compute via Terraform (3 minutes)
```bash
cd infrastructure/terraform
terraform taint oci_core_instance.converter_instance
terraform apply -auto-approve
```
Note the new public IP from output: `instance_public_ip`.

### Step 2: Update DNS A-Record in Cloudflare (1 minute)
1. Go to Cloudflare Dashboard → DNS.
2. Edit the `api` A-record to point to the new IP address.
3. Ensure **Proxy status: DNS only (grey cloud)** remains active.

### Step 3: Wait for Cloud-Init Completion & Deploy Stack (5 minutes)
SSH into the new instance:
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<NEW_INSTANCE_IP>
cloud-init status --wait

sudo mkdir -p /opt/universal-media
sudo chown -R $USER:$USER /opt/universal-media
cd /opt/universal-media

git clone https://github.com/muhammedasadn/Mediaconverterapp.git .
cp .env.production.example .env
chmod 600 .env
nano .env # Paste in your domain & secrets

./scripts/deploy.sh latest
```

### Step 4: Restore Redis Queue Data (Optional)
If restoring from an off-host backup:
```bash
scp -i ~/.ssh/id_ed25519 backup_latest.tar.gz ubuntu@<NEW_INSTANCE_IP>:/tmp/
./scripts/restore.sh /tmp/backup_latest.tar.gz
```

### Step 5: Update GitHub Actions Secrets
In GitHub Settings → Secrets, update `VM_HOST` to the new IP address.

### Step 6: Verify Smoke Tests
```bash
./scripts/smoke-test.sh "https://your-app.pages.dev" "https://api.yourdomain.com"
```
Recovery is complete. The site will resume full cloud-accelerated operations.
