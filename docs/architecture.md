# System Architecture Overview

Universal Media Converter is architected as a high-throughput, privacy-first media processing monorepo.

## Monorepo Layout
- `apps/web`: Next.js 15 App Router, React 19, Motion, Tailwind CSS v4, PWA shell.
- `apps/api`: Fastify Node.js server with Zod contract validation and streaming file pipes.
- `apps/worker`: BullMQ queue worker executing native hardware-accelerated Dockerized FFmpeg.
- `packages/ui`: Modular iOS Cupertino glassmorphism component primitives.
- `packages/format-registry`: Audio/video format definitions, codec matrices, quality presets.
- `packages/job-contracts`: Strongly-typed Zod schemas and SSE events.
- `infrastructure`: Docker Compose with Redis and MinIO S3 storage.
