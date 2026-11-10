#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Universal Media Converter — Emergency Automated Rollback Script
# ----------------------------------------------------------------------------
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="docker-compose.prod.yml"
TARGET_TAG="${1:-latest}"

echo "========================================================"
echo "⚠️  EMERGENCY ROLLBACK INITIATED"
echo "    Reverting stack to tag: ${TARGET_TAG}"
echo "========================================================"

export IMAGE_TAG="$TARGET_TAG"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate api worker

echo "⏳ Verifying rollback container liveness..."
sleep 5

if docker exec converter-api wget -qO- http://127.0.0.1:4000/api/health > /dev/null 2>&1; then
  echo "✅ Stack successfully restored to stable state (${TARGET_TAG})."
else
  echo "❌ CRITICAL: Stack remains unstable after rollback. Manual inspection required:"
  echo "   docker compose -f ${COMPOSE_FILE} logs --tail=100"
  exit 1
fi
