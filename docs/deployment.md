# Universal Media Converter — Production Zero-Cost Deployment Guide

This guide walks you step-by-step through deploying the Universal Media Converter platform to production at **$0/month** using Cloudflare Pages and an Oracle Cloud Always Free ARM64 VM.

---

## Architecture Overview

- **Frontend (`apps/web`)**: Hosted on **Cloudflare Pages** (static export `output: 'export'`), global edge CDN, unlimited bandwidth, free SSL, `SharedArrayBuffer` enabled via `_headers`.
- **Backend (`apps/api`, `apps/worker`, Redis)**: Containerized with Docker Compose on an **Oracle Cloud Always Free VM** (`VM.Standard.A1.Flex`, 2 OCPU, 12 GB RAM, 180 GB storage).
- **Edge Reverse Proxy**: **Caddy 2** with automatic Let's Encrypt TLS, HTTP/3, and gzip/zstd compression.
- **DNS**: Cloudflare DNS. API subdomain configured as **DNS-only (grey cloud)** to bypass Cloudflare's 100MB body limit.

---

## Step 1: Oracle Cloud Free Tier Signup & Region Selection

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com).
2. **Choose your Home Region carefully**: Choose a region with known Ampere A1 capacity (e.g. `us-ashburn-1`, `us-phoenix-1`, `eu-frankfurt-1`). **Your Home Region CANNOT be changed later.**
3. Complete card verification (a temporary ~$1 authorization hold is refunded immediately).
4. **CRITICAL GUARDRAIL**: **NEVER click "Upgrade to Pay As You Go"**. Stay on the Always Free tier.

---

## Step 2: Set Up Budget Alert at $1.00 (Bill Shock Prevention)

1. In the OCI Console, open the navigation menu and select **Billing & Cost Management** → **Budgets**.
2. Click **Create Budget**:
   - **Scope**: Tenancy
   - **Monthly Budget Amount**: `$1.00`
   - **Alert Rule**: Threshold `$1.00` (Actual Spend), recipient: your email address.
3. Click **Create**. You will receive an instant email alert if any service ever threatens to incur a charge.

---

## Step 3: Collect OCI Credentials & Provision with Terraform

### A. Generate OCI API Key
1. In the OCI Console, click your user profile (top right) → **User Settings**.
2. Under **Resources**, click **API Keys** → **Add API Key**.
3. Choose **Generate API Key Pair**, download the Private Key (`oci_api_key.pem`), and click **Add**.
4. Note down the displayed **Configuration File** snippet:
   - `tenancy_ocid`
   - `user_ocid`
   - `fingerprint`
   - `region`

### B. Execute Terraform
From your local terminal:
```bash
cd infrastructure/terraform

# Copy and edit the configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars # Fill in your OCIDs, fingerprint, and SSH public key

# Initialize and apply
terraform init
terraform plan
terraform apply
```
Terraform will provision the VCN, security list, and VM instance, outputting the public IP address:
```
instance_public_ip = "129.153.xx.xx"
```

---

## Step 4: Configure Cloudflare DNS

In your Cloudflare dashboard for your domain (e.g. `universalmediaconverter.app`):

1. **API A-Record**:
   - Type: `A`
   - Name: `api`
   - IPv4 address: `<instance_public_ip>`
   - **Proxy status: DNS only (Grey Cloud)** ⚠️ *Required to bypass the 100MB proxy upload limit and allow direct media streaming to Caddy.*
   - TTL: Auto

---

## Step 5: Connect Frontend to Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**.
2. Select repository: `muhammedasadn/Mediaconverterapp`.
3. Configure build settings:
   - **Framework preset**: `None`
   - **Build command**: `pnpm install && pnpm --filter @universal/web build`
   - **Build output directory**: `apps/web/out`
   - **Root directory**: `/`
4. Under **Environment variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com` (or your DDNS hostname)
   - `NEXT_PUBLIC_CLOUD_ENGINE_ENABLED`: `true`
5. Click **Save and Deploy**. Cloudflare Pages will build the site and deploy to `*.pages.dev`.

---

## Step 6: Initialize the Oracle VM

SSH into the newly created VM:
```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<instance_public_ip>
```

Verify that cloud-init has completed:
```bash
cloud-init status --wait
```

Clone the repository and set up environment:
```bash
sudo mkdir -p /opt/universal-media
sudo chown -R $USER:$USER /opt/universal-media
cd /opt/universal-media

git clone https://github.com/muhammedasadn/Mediaconverterapp.git .
cp .env.production.example .env
chmod 600 .env

# Edit environment variables
nano .env
# Set API_DOMAIN=api.yourdomain.com
# Set ALLOWED_ORIGIN=https://your-pages-url.pages.dev
# Set REDIS_PASSWORD=$(openssl rand -hex 32)
```

Launch the stack:
```bash
./scripts/deploy.sh latest
```

---

## Step 7: Configure GitHub Actions CI/CD Secrets

In GitHub (`Settings` → `Secrets and variables` → `Actions`):

Add the following repository secrets:
1. `VM_HOST`: The public IP address of your Oracle VM.
2. `VM_USER`: `ubuntu` (or `converter`).
3. `VM_SSH_KEY`: The private SSH key for accessing the VM.
4. `PRODUCTION_WEB_URL`: Your Cloudflare Pages URL (`https://your-app.pages.dev`).
5. `PRODUCTION_API_URL`: Your API URL (`https://api.yourdomain.com`).

Under **Environments**, create an environment named `production` with **Required reviewers** enabled to require manual approval before production deployment.

---

## Step 8: Verify Deployment Health

Run the post-deployment smoke test suite:
```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh "https://your-app.pages.dev" "https://api.yourdomain.com"
```

Verify endpoints:
- `https://api.yourdomain.com/api/health` → `{"status":"healthy",...}`
- `https://api.yourdomain.com/api/ready` → `{"status":"ready","checks":{"redis":"connected","storage":{"status":"healthy",...}}}`

---

## Step 9: Setup UptimeRobot Monitoring (Free Tier)

1. Create a free account at [uptimerobot.com](https://uptimerobot.com).
2. Add Monitor 1:
   - Type: `HTTP(s)`
   - Friendly Name: `Universal Media Web`
   - URL: `https://your-app.pages.dev`
   - Interval: `5 minutes`
3. Add Monitor 2:
   - Type: `HTTP(s)`
   - Friendly Name: `Universal Media API Liveness`
   - URL: `https://api.yourdomain.com/api/health`
   - Interval: `5 minutes`
4. Set alert notification: Email / Telegram.
