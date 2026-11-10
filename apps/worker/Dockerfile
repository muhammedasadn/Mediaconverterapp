FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

WORKDIR /app/apps/worker

RUN corepack enable && pnpm install --filter @universal/worker...
RUN pnpm build

FROM node:22-alpine AS runner

RUN apk add --no-cache \
    ffmpeg \
    libva \
    libvdpau

WORKDIR /app

ENV NODE_ENV=production
ENV WORKING_DIR=/data/temp_uploads

RUN mkdir -p /data/temp_uploads

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./package.json

VOLUME ["/data/temp_uploads"]

CMD ["node", "dist/worker.js"]
