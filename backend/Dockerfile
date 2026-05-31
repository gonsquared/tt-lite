# Stage 1: Builder
FROM oven/bun:1-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY tsconfig.json ./
COPY src/ ./src/

RUN bun run build

# Stage 2: Runtime
FROM oven/bun:1-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    mkdir -p /data && chown appuser:appgroup /data

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

CMD ["bun", "dist/index.js"]
