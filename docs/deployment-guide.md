# Universal Media Converter: Production Setup & Deployment Guide

## 1. System Architecture Overview

Universal Media Converter uses a **Hybrid Edge/Cloud Architecture**:
- **Frontend (`apps/web`)**: Next.js 15 (React 19) client-side application executing WebAssembly transcoding (`@ffmpeg/ffmpeg`) in the browser with SharedArrayBuffer multi-threading.
- **Admin Dashboard (`apps/admin`)**: Next.js dashboard monitoring system queues, throughput, and error rates.
- **API Server (`apps/api`)**: High-throughput Fastify server orchestrating SSRF security, remote link analysis, job queuing, and SSE progress delivery.
- **Cloud Turbo Worker (`apps/worker`)**: BullMQ consumer running native FFmpeg with multi-threading (`-threads 0 -preset fast -movflags +faststart`) for heavy 4K / AV1 / ProRes workloads.
- **Redis**: Persistent queue backend and pub/sub message broker.

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in the root and configure:

```env
# Node Environment
NODE_ENV=production
PORT=4000

# Client Configuration (apps/web)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Redis Backend (BullMQ Queue)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

# Scratch Directory for Temporary Transcodes
UPLOAD_DIR=/tmp/universal-media/uploads

# Security & Limits
MAX_IMPORT_SIZE_MB=500
LINK_IMPORT_ENABLED=true
```

---

## 3. Local Development Setup

### Prerequisites
- Node.js `v20.0.0` or higher (Node 24 LTS recommended)
- `pnpm` `v9.0.0` or higher
- Optional: Native `ffmpeg` installed on your PATH for worker execution

### Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Run TypeScript typecheck across all monorepo packages
npm run typecheck

# 3. Execute automated test suite (55+ tests)
npm test

# 4. Start all applications concurrently in development mode
pnpm dev
```

Local services will start on:
- Web App: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3001`
- Fastify API: `http://localhost:4000`

---

## 4. Production Deployment with Docker Compose

A production-ready `docker-compose.yml` is provided at the repository root:

```bash
# Build and launch all services in detached mode
docker compose up -d --build

# View real-time aggregated logs
docker compose logs -f

# Check health of services
docker compose ps
```

### Docker Compose Architecture:
```yaml
services:
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: always
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - UPLOAD_DIR=/data/uploads
    volumes:
      - shared_media:/data/uploads
    ports:
      - "4000:4000"

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
    restart: always
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - WORKING_DIR=/data/uploads
    volumes:
      - shared_media:/data/uploads

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: always
    ports:
      - "3000:3000"
```

---

## 5. Security & Browser Headers Requirement

To enable client-side WebAssembly multi-threading with `SharedArrayBuffer`, your reverse proxy (Nginx, Cloudflare, Traefik, or Vercel) **MUST** serve the following HTTP headers on the web frontend:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

*Note: These headers are pre-configured in `apps/web/next.config.ts`.*

---

## 6. Maintenance & Automated Cleanups

- **Temporary Storage Garbage Collection**: The worker cleaner runs hourly to purge files older than 60 minutes from `/data/uploads`.
- **Health Checks**: Fastify exposes `GET /api/health` returning system memory, Redis connectivity, and active queue counts.
