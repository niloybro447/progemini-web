#!/bin/sh
set -e

# Strip surrounding quotes from DATABASE_URL if present (Docker --env-file passes quotes literally)
if [ -n "$DATABASE_URL" ]; then
  DATABASE_URL=$(echo "$DATABASE_URL" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  export DATABASE_URL
fi

# If a specific command was passed to docker run (e.g. npx prisma db push), execute it directly!
if [ $# -gt 0 ]; then
  echo "==> Executing custom command: $@"
  exec "$@"
fi

echo "========================================================"
echo " Starting ProGemini Express Backend API..."
echo " Node Version: $(node -v)"
echo " Environment: ${NODE_ENV:-production}"
echo " Port: ${PORT:-5000}"
echo "========================================================"

# Auto-sync Prisma database schema on startup
if [ -n "$DATABASE_URL" ]; then
  echo "==> Syncing Prisma schema with production database..."
  npx prisma db push --skip-generate || echo "⚠ Warning: Prisma db push encountered an issue, proceeding..."
else
  echo "⚠ Warning: DATABASE_URL not set in environment."
fi

echo "==> Launching Express server..."
exec node dist/server.js
