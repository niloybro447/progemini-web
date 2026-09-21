#!/bin/sh
set -e

echo "========================================================"
echo " Starting ProGemini Express Backend API..."
echo " Node Version: $(node -v)"
echo " Environment: ${NODE_ENV:-production}"
echo " Port: ${PORT:-5000}"
echo "========================================================"

# Auto-sync Prisma database schema if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing Prisma schema with production database..."
  npx prisma db push --skip-generate || echo "⚠ Warning: Prisma db push encountered an issue, proceeding..."
else
  echo "⚠ Warning: DATABASE_URL not set in environment."
fi

echo "==> Launching Express server..."
exec node dist/server.js
