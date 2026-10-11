# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install build essentials & OpenSSL
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy dependency definitions
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for tsc
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build
COPY src ./src
RUN npm run build

# ─── Stage 2: Production Runner ────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime dependencies, Chromium for PDF generation, and standard vector fonts
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates curl chromium fonts-liberation fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=5000
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy generated Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Copy static assets (signatures, badges, logos for PDF rendering)
COPY assets ./assets

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
