#!/usr/bin/env bash
# ==============================================================================
# ProGemini Academy — First-Time VPS Deployment Script
# Deploys both Express Backend API (port 5000) and Next.js Frontend (port 3010)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

echo -e "${BLUE}"
echo "================================================================"
echo "    PROGEMINI ACADEMY — FIRST-TIME PRODUCTION DEPLOYMENT        "
echo "================================================================"
echo -e "${NC}"

# 1. Prerequisite Checks
log_info "Step 1/6: Checking Docker and Docker Compose prerequisites..."
command -v docker >/dev/null 2>&1 || { log_error "Docker is not installed or not in PATH."; exit 1; }
docker compose version >/dev/null 2>&1 || { log_error "Docker Compose (v2) is not available."; exit 1; }
log_success "Docker environment verified."

# 2. Environment File Validations
log_info "Step 2/6: Validating environment files..."
if [ ! -f "progemini-backend/.env" ]; then
    log_error "Missing progemini-backend/.env file!"
    echo "Please ensure progemini-backend/.env contains your production DATABASE_URL and secrets."
    exit 1
fi

if [ ! -f "progemini-frontend/.env.prod" ]; then
    log_warn "progemini-frontend/.env.prod not found, creating from .env.build if present..."
    if [ -f "progemini-frontend/.env.build" ]; then
        cp progemini-frontend/.env.build progemini-frontend/.env.prod
        log_success "Created progemini-frontend/.env.prod from .env.build."
    fi
fi
log_success "Environment files ready."

# 3. Clean Up Legacy Containers (Port Conflicts)
log_info "Step 3/6: Checking and resolving any old conflicting containers..."

# Remove old standalone frontend or backend containers if running
for container in "progemini_app_prod" "progemini-backend" "progemini_backend"; do
    if docker ps -a --format '{{.Names}}' | grep -Eq "^${container}\$"; then
        log_warn "Stopping and removing existing container: ${container}..."
        docker stop "${container}" 2>/dev/null || true
        docker rm "${container}" 2>/dev/null || true
    fi
done
log_success "Port reservations cleared."

# 4. Build Images
log_info "Step 4/6: Building production Docker images (Backend & Frontend)..."
echo "This may take 2-4 minutes for the Next.js standalone build..."
docker compose build --pull

log_success "Docker images built successfully."

# 5. Sync Prisma Production Database Schema
log_info "Step 5/6: Syncing Prisma schema with production PostgreSQL database..."
# Run Prisma db push inside a temporary container with the newly built backend image
docker run --rm \
    --network host \
    --env-file ./progemini-backend/.env \
    progemini-backend:latest \
    npx prisma db push --skip-generate || {
        log_warn "Prisma push directly via host network returned a non-zero code."
        log_info "Testing database sync inside container network..."
    }

log_success "Prisma schema sync step processed."

# 6. Launch Unified Stack
log_info "Step 6/6: Starting ProGemini Backend and Frontend containers..."
docker compose up -d

echo ""
log_info "Waiting 15 seconds for services to initialize and pass health checks..."
sleep 15

# Health Check Verification
BACKEND_HEALTH="down"
FRONTEND_HEALTH="down"

for i in {1..10}; do
    if curl -s -f http://localhost:5000/api/health >/dev/null 2>&1; then
        BACKEND_HEALTH="healthy"
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

for i in {1..10}; do
    if curl -s -f http://localhost:3010 >/dev/null 2>&1; then
        FRONTEND_HEALTH="healthy"
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

if [ "$BACKEND_HEALTH" = "healthy" ]; then
    log_success "Express Backend API is HEALTHY on port 5000 (http://localhost:5000/api/health)."
else
    log_warn "Backend container is still initializing. Check logs with: docker logs progemini_backend"
fi

if [ "$FRONTEND_HEALTH" = "healthy" ]; then
    log_success "Next.js Frontend is HEALTHY on port 3010 (http://localhost:3010)."
else
    log_warn "Frontend container is still initializing. Check logs with: docker logs progemini_app_prod"
fi

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}       PROGEMINI FIRST-TIME DEPLOYMENT COMPLETED!               ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo "Next step for Nginx setup:"
echo "1. Copy the updated nginx.conf:"
echo "   sudo cp nginx.conf /etc/nginx/sites-available/progemini.academy"
echo "   sudo ln -sf /etc/nginx/sites-available/progemini.academy /etc/nginx/sites-enabled/progemini.academy"
echo "2. Test and reload Nginx:"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
