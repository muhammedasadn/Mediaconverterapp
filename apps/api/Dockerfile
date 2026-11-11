# ----------------------------------------------------------------------------
# Universal Media Converter — Production API Dockerfile (ARM64 / AMD64)
# Multi-stage build with non-root security isolation
# ----------------------------------------------------------------------------

FROM node:22-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

COPY package.json pnpm-workspace.yaml turbo.json pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --filter @universal/api...
RUN pnpm --filter @universal/api build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Create dedicated non-root service user and group
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Create storage mounts with non-root ownership
RUN mkdir -p /var/lib/media-storage/uploads /var/lib/media-storage/output && \
    chown -R appuser:appgroup /var/lib/media-storage /app

COPY --from=builder --chown=appuser:appgroup /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/packages ./packages
COPY --from=builder --chown=appuser:appgroup /app/apps/api/package.json ./package.json

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

CMD ["node", "dist/apps/api/src/server.js"]
