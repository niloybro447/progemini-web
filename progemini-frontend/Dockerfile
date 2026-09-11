# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app
# Install build tools needed for native addons (sharp, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*
# Copy package files
COPY package*.json ./
# Install all dependencies WITH scripts enabled so sharp downloads its
# Linux x64 native binaries.
RUN if [ -f package-lock.json ]; then \
    npm ci --legacy-peer-deps; \
    else \
    echo "Warning: package-lock.json not found, using npm install" && \
    npm install --legacy-peer-deps; \
    fi && \
    # Verify sharp native binary is present for linux-x64
    node -e "require('sharp'); console.log('✓ sharp native OK')" || \
    (echo '⚠ sharp native failed, rebuilding...' && npm rebuild sharp)

# Stage 2: Builder
FROM node:20-slim AS builder
# Install tools needed for build (dos2unix for .env)
RUN apt-get update && apt-get install -y --no-install-recommends dos2unix && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Copy dependencies from deps stage (includes sharp native binaries for linux)
COPY --from=deps /app/node_modules ./node_modules
# Copy package files
COPY package*.json ./
# Copy source code
COPY . .
# Accept build argument to specify environment (default: prod)
ARG BUILD_ENV=prod
# Load environment variables from build-specific file
RUN ENV_FILE=".env.build"; \
    if [ ! -f "$ENV_FILE" ]; then \
    echo "Warning: .env.build not found, using defaults"; \
    else \
    echo "Loading build environment variables from $ENV_FILE"; \
    dos2unix "$ENV_FILE" 2>/dev/null || true; \
    set -a && \
    . "./$ENV_FILE" && \
    set +a; \
    fi && \
    echo "Building Next.js application..." && \
    npm run build

# Stage 3: Runtime — uses Next.js standalone output for minimal footprint
FROM node:20-slim AS runtime
# Install dumb-init for proper signal handling + curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Standalone output structure ---
# next.config.js output:'standalone' creates .next/standalone with everything
# needed to run the server — no need to copy full node_modules.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Retain server-side native modules (sharp)
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

# Create a non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check — curl against root (more reliable than inline node)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -sf http://localhost:3000 > /dev/null || exit 1

# Use dumb-init to handle signals properly
# standalone output uses server.js directly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
