# Deployment Assumptions & Verified Free-Tier Constraints

> **Verification Timestamp:** November 2026  
> **Target Production Cost:** **$0.00 / month** strictly.

---

## 1. Provider Limit Verification Matrix

| Layer / Provider | Free Resource Allocation | Hard Quotas & Ceilings | Verification Source / Link |
|---|---|---|---|
| **Oracle Cloud Infrastructure (OCI)** | `VM.Standard.A1.Flex` (Ampere A1 ARM64) | **2 OCPU** & **12 GB RAM** total (1,500 OCPU hours, 9,000 GB hours / month). Must reside in tenancy **Home Region**. | [OCI Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) |
| **OCI Block Storage** | Always Free Boot + Block Storage | **200 GB total**. Our configuration: 180 GB boot volume + shared media directory (leaves 20 GB buffer). | [OCI Block Storage Limits](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm#storage) |
| **Cloudflare Pages** | Static Web Hosting (`output: 'export'`) | **Unlimited static bandwidth**, free SSL/TLS, 500 builds/month, 1 concurrent build, **25 MiB individual asset file size cap**. | [Cloudflare Pages Limits](https://developers.cloudflare.com/pages/platform/limits/) |
| **Cloudflare DNS** | Managed DNS Service | Unlimited queries, free DNSSEC. API subdomain configured as **DNS-only (grey cloud)** to bypass 100MB body limit. | [Cloudflare Plans](https://www.cloudflare.com/plans/) |
| **GitHub Container Registry (GHCR)** | OCI Container Registry | **Unlimited storage & egress** for public repositories (`muhammedasadn/Mediaconverterapp`). | [GitHub Packages Pricing](https://docs.github.com/en/billing/managing-billing-for-github-packages) |
| **GitHub Actions** | Automation & CI/CD | **Unlimited minutes** for public repositories on standard Linux runners. | [GitHub Actions Billing](https://docs.github.com/en/billing/managing-billing-for-github-actions) |
| **UptimeRobot** | External Health Probes | 50 monitors at 5-minute intervals free. | [UptimeRobot Free Plan](https://uptimerobot.com/pricing/) |

---

## 2. Rejection Rationale for Alternative Services

1. **Render Free Tier**:
   - Web services sleep after 15 minutes of inactivity, resulting in a 50+ second cold start penalty.
   - Strict 100 GB/month bandwidth limit.
   - Zero persistent storage support on free instances.
2. **Fly.io**:
   - Discontinued always-free compute for new accounts; requires credit card and charges monthly minimums for dedicated IPv4 and shared CPU.
3. **Koyeb**:
   - Provides only 512 MB RAM on free tier (will immediately OOM-crash during native 1080p FFmpeg transcoding).
4. **Heroku**:
   - Terminated all free dynos and free Postgres/Redis plans in November 2022.
5. **Upstash Redis**:
   - Free tier caps commands at 10,000 commands/day (~300k/month).
   - BullMQ workers continuously poll Redis (`brpoplpush` / `xread`), which consumes > 500,000 commands within days even when the queue is idle.
6. **Cloudflare Workers for Backend Processing**:
   - 128 MB RAM ceiling and 10–50 ms CPU time limit cannot execute native FFmpeg encoding binaries.

---

## 3. Capacity & Sizing Commitments (2 OCPU / 12 GB RAM Envelope)

- **Worker Concurrency**:
  - Heavy transcode queue (1080p, x264/libvpx): Concurrency = **1**.
  - Light processing queue (Audio extraction, remux, lossless stream-copy trim): Concurrency = **2**.
- **Memory Allocation**:
  - Caddy: 128 MB
  - Redis: 512 MB (`maxmemory 512mb`, `maxmemory-policy noeviction`)
  - Fastify API: 1,536 MB (1.5 GB)
  - Native Worker: 6,144 MB (6.0 GB)
  - Reserved for Host OS, buffers, & I/O cache: 3,820 MB (~3.8 GB)
  - Swap: 4 GB swapfile configured with `vm.swappiness=10`
- **Disk Watchdog**:
  - Minimum free disk threshold: **15%**.
  - If free space < 15%, the API returns HTTP 503 "Engine Busy" with automatic fallback to client-side browser conversion.
