 #!/usr/bin/env bash
#
# ProGemini — production Docker deployment (service: progemini-app-prod)
#
# Prerequisites:
#   - Docker + Docker Compose
#   - .env.prod  (runtime + build; Dockerfile BUILD_ENV=prod sources this file during image build)
#
# Published port: 3010 → container 3000 → http://localhost:3010
# Set NEXTAUTH_URL and NEXT_PUBLIC_APP_URL in .env.prod to your real public URL on the server.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo root: this file may live at project root or under scripts/
ROOT_DIR="$SCRIPT_DIR"
if [[ "$(basename "$SCRIPT_DIR")" == "scripts" ]]; then
  ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi
cd "$ROOT_DIR"

SERVICE="progemini-app-prod"
DETACHED=false

usage() {
  cat <<'EOF'
ProGemini — production Docker deployment (progemini-app-prod)

Usage:
  deploy-prod.sh <command> [options]

Commands:
  build       Build the production image (BUILD_ENV=prod)
  up          Build (if needed) and start the container
  down        Stop and remove the container
  logs        Follow container logs (Ctrl+C to exit)
  restart     down, then up
  redeploy    Remove container + image, rebuild from scratch, and start
  ps          Show compose status

Options:
  -d          Detached background run (for up / restart / redeploy)

Examples:
  ./deploy-prod.sh build
  ./deploy-prod.sh up -d
  ./deploy-prod.sh redeploy -d
  ./deploy-prod.sh logs
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

ensure_docker() {
  command -v docker >/dev/null 2>&1 || die "docker is not installed or not in PATH"
  docker compose version >/dev/null 2>&1 || die "docker compose is not available"
}

# Production service lives in base compose only (ignore dev override for port/bind mounts)
run_compose() {
  docker compose -f docker-compose.yml "$@"
}

require_prod_env() {
  [[ -f "$ROOT_DIR/progemini-frontend/.env.prod" ]] || die "Missing progemini-frontend/.env.prod — create it (see .env.example) with production DATABASE_URL, NEXTAUTH_*, NEXT_PUBLIC_*, MinIO, Stripe, etc."
}

parse_args() {
  local -a pos=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -d) DETACHED=true ;;
      -h|--help) usage; exit 0 ;;
      *)
        if [[ ${#pos[@]} -eq 0 ]]; then
          pos+=("$1")
        else
          die "unknown argument: $1"
        fi
        ;;
    esac
    shift
  done
  set -- "${pos[@]:-}"
  CMD="${1:-}"
}

up_flags() {
  local -a flags=(up --build "$SERVICE")
  [[ "$DETACHED" == true ]] && flags+=(-d)
  run_compose "${flags[@]}"
}

main() {
  parse_args "$@"
  ensure_docker

  case "${CMD:-}" in
    "")
      usage
      exit 1
      ;;
    build)
      require_prod_env
      run_compose build "$SERVICE"
      ;;
    up)
      require_prod_env
      up_flags
      echo "Started production stack. Open http://localhost:3010 (or put a reverse proxy in front)."
      ;;
    down)
      run_compose stop "$SERVICE" 2>/dev/null || true
      run_compose rm -f "$SERVICE" 2>/dev/null || true
      echo "Stopped $SERVICE"
      ;;
    logs)
      run_compose logs -f "$SERVICE"
      ;;
    restart)
      require_prod_env
      run_compose stop "$SERVICE" 2>/dev/null || true
      run_compose rm -f "$SERVICE" 2>/dev/null || true
      up_flags
      ;;
    ps)
      run_compose ps -a
      ;;
    redeploy)
      require_prod_env
      echo "==> Stopping and removing container..."
      run_compose stop "$SERVICE" 2>/dev/null || true
      run_compose rm -f "$SERVICE" 2>/dev/null || true
      echo "==> Removing old image (if any)..."
      docker compose -f docker-compose.yml images -q "$SERVICE" 2>/dev/null \
        | xargs -r docker rmi -f 2>/dev/null || true
      echo "==> Rebuilding image from scratch..."
      run_compose build --no-cache "$SERVICE"
      echo "==> Starting container..."
      up_flags
      echo "==> Redeploy complete. Open http://localhost:3010"
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      die "unknown command: $CMD (use: build, up, down, logs, restart, redeploy, ps)"
      ;;
  esac
}

main "$@"
