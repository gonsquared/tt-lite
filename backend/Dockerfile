# Stage 1: Builder
FROM oven/bun:1-alpine AS builder

WORKDIR /app

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
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["bun", "dist/index.js"]
