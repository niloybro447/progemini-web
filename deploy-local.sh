#!/usr/bin/env bash
#
# ProGemini — local / test Docker deployment (service: progemini-app-test)
#
# Prerequisites:
#   - Docker + Docker Compose
#   - .env  (runtime; copy from .env.example)
#   - .env.test (build-time for Next.js; Dockerfile BUILD_ENV=test sources this file)
#
# Default mode uses ONLY docker-compose.yml → http://localhost:30001 (production-like image).
# Use --dev to merge docker-compose.override.yml → http://localhost:3000 (bind mounts + dev env).
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo root: this file may live at project root or under scripts/
ROOT_DIR="$SCRIPT_DIR"
if [[ "$(basename "$SCRIPT_DIR")" == "scripts" ]]; then
  ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
fi
cd "$ROOT_DIR"

SERVICE="progemini-app-test"
USE_DEV=false
DETACHED=false

usage() {
  cat <<'EOF'
ProGemini — local / test Docker deployment (progemini-app-test)

Usage:
  deploy-local.sh <command> [options]

Commands:
  build       Build the test image (BUILD_ENV=test)
  up          Build (if needed) and start the container
  down        Stop and remove the container
  logs        Follow container logs (Ctrl+C to exit)
  restart     down, then up
  ps          Show compose status

Options:
  --dev       Use docker-compose.override.yml (port 3000, local bind mounts)
  -d          Detached background run (for up / restart)

Examples:
  ./deploy-local.sh build
  ./deploy-local.sh up              # http://localhost:30001
  ./deploy-local.sh up --dev        # http://localhost:3000
  ./deploy-local.sh up -d
  ./deploy-local.sh logs
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

compose_cmd() {
  if [[ "$USE_DEV" == true ]]; then
    echo docker compose
  else
    echo docker compose -f docker-compose.yml
  fi
}

run_compose() {
  # shellcheck disable=SC2046
  $(compose_cmd) "$@"
}

require_env_file() {
  [[ -f "$ROOT_DIR/progemini-frontend/.env" ]] || die "Missing progemini-frontend/.env — copy .env.example to .env and configure it."
  if [[ ! -f "$ROOT_DIR/progemini-frontend/.env.build" ]]; then
    echo "Warning: progemini-frontend/.env.build not found. Dockerfile will build with defaults; create .env.build for correct NEXT_PUBLIC_* at build time." >&2
  fi
}

parse_args() {
  local -a pos=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dev) USE_DEV=true ;;
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
      require_env_file
      run_compose build "$SERVICE"
      ;;
    up)
      require_env_file
      up_flags
      if [[ "$USE_DEV" == true ]]; then
        echo "Started (dev override). Open http://localhost:3000"
      else
        echo "Started (prod-like test). Open http://localhost:30001 — set NEXTAUTH_URL / NEXT_PUBLIC_APP_URL to match in .env"
      fi
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
      require_env_file
      run_compose stop "$SERVICE" 2>/dev/null || true
      run_compose rm -f "$SERVICE" 2>/dev/null || true
      up_flags
      ;;
    ps)
      run_compose ps -a
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      die "unknown command: $CMD (use: build, up, down, logs, restart, ps)"
      ;;
  esac
}

main "$@"
