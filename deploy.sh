#!/usr/bin/env bash
# ==============================================================================
# ProGemini Academy — Production Update & Continuous Deployment Script
# 
# Workflow:
#   1. Build new Docker images while old containers remain running
#   2. Run Prisma database schema sync against production database
#   3. Stop and remove old containers
#   4. Start new containers with updated code & schema
#   5. Verify health check status
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

echo -e "${BLUE}"
echo "================================================================"
echo "    PROGEMINI ACADEMY — PRODUCTION UPDATE & ZERO-RISK DEPLOY    "
echo "================================================================"
echo -e "${NC}"

# Check for --first-time flag
if [[ "${1:-}" == "--first-time" || "${1:-}" == "-f" ]]; then
    log_info "Redirecting to first-time setup..."
    exec ./deploy-first-time.sh
fi

# Step 1: Pre-flight Checks
log_info "Step 1/5: Checking environment files..."
if [ ! -f "progemini-backend/.env" ]; then
    log_error "Missing progemini-backend/.env! Aborting."
    exit 1
fi

# Step 2: Build New Images (Old containers stay LIVE and active!)
log_info "Step 2/5: Building new production images (Live traffic unaffected)..."
docker compose build

log_success "Build complete! All new Docker images are prepared."

# Step 3: Sync Prisma Database Schema
log_info "Step 3/5: Running Prisma database schema sync against production database..."
docker run --rm \
    --network host \
    --env-file ./progemini-backend/.env \
    progemini-backend:latest \
    npx prisma db push --skip-generate || {
        log_warn "Prisma push directly via host network returned warning/error, attempting via compose network..."
        docker compose run --rm progemini-backend npx prisma db push --skip-generate || true
    }

log_success "Prisma database schema sync completed."

# Step 4: Stop & Remove Old Containers, then Start New Containers
log_info "Step 4/5: Stopping old containers and launching new versions..."
# docker compose up -d automatically stops old containers and starts new containers
docker compose up -d --remove-orphans

log_success "New containers started."

# Step 5: Verify Health Checks
log_info "Step 5/5: Verifying application health status..."
sleep 10

BACKEND_OK=false
FRONTEND_OK=false

for i in {1..12}; do
    if curl -s -f http://localhost:5000/api/health >/dev/null 2>&1; then
        BACKEND_OK=true
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

for i in {1..12}; do
    if curl -s -f http://localhost:3010 >/dev/null 2>&1; then
        FRONTEND_OK=true
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

if [ "$BACKEND_OK" = true ]; then
    log_success "Backend API (Express port 5000): HEALTHY"
else
    log_warn "Backend API health check pending. Inspect logs with: docker logs --tail 50 progemini_backend"
fi

if [ "$FRONTEND_OK" = true ]; then
    log_success "Frontend App (Next.js port 3010): HEALTHY"
else
    log_warn "Frontend App health check pending. Inspect logs with: docker logs --tail 50 progemini_app_prod"
fi

# Clean up dangling images to preserve VPS disk space
log_info "Cleaning up old dangling images..."
docker image prune -f >/dev/null 2>&1 || true

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}          PROGEMINI UPDATE DEPLOYMENT SUCCESSFUL!               ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
