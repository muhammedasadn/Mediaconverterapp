FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api

RUN corepack enable && pnpm install --filter @universal/api...
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

RUN mkdir -p /tmp/universal-media/uploads /tmp/universal-media/output

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/server.js"]
