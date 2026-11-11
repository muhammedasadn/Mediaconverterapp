# ----------------------------------------------------------------------------
# Universal Media Converter — Production FFmpeg Native Worker Dockerfile (ARM64 / AMD64)
# Multi-stage build with native hardware-accelerated FFmpeg & non-root isolation
# ----------------------------------------------------------------------------

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

RUN pnpm install --filter @universal/worker...
RUN pnpm --filter @universal/worker build

FROM node:22-alpine AS runner

# Install native FFmpeg with x264, lame, opus, and hardware acceleration libraries
RUN apk add --no-cache \
    ffmpeg \
    libva \
    libvdpau

WORKDIR /app

ENV NODE_ENV=production

# Create dedicated non-root service user and group
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Create media working storage with non-root ownership
RUN mkdir -p /var/lib/media-storage/uploads /var/lib/media-storage/output && \
    chown -R appuser:appgroup /var/lib/media-storage /app

COPY --from=builder --chown=appuser:appgroup /app/apps/worker/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/packages ./packages
COPY --from=builder --chown=appuser:appgroup /app/apps/worker/package.json ./package.json

USER appuser

CMD ["node", "dist/worker.js"]
