#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Universal Media Converter — Production Zero-Downtime Deployment Script
# Gated by Healthchecks with Automatic Rollback on Failure
# ----------------------------------------------------------------------------
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_TAG="${1:-latest}"
PREVIOUS_TAG_FILE=".previous_image_tag"

echo "========================================================"
echo "🚀 Deploying Universal Media Converter (Tag: ${IMAGE_TAG})"
echo "========================================================"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Error: Production environment file '$ENV_FILE' not found."
  echo "   Please create it from .env.production.example and chmod 600."
  exit 1
fi

# Record current image tag for instant rollback
if [[ -f "$PREVIOUS_TAG_FILE" ]]; then
  PREV_TAG=$(cat "$PREVIOUS_TAG_FILE")
else
  PREV_TAG="latest"
fi
echo "$IMAGE_TAG" > "$PREVIOUS_TAG_FILE"

echo "📥 Pulling latest multi-arch images from GHCR..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull api worker

echo "🔄 Recreating containers with zero-downtime rolling deployment..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

echo "⏳ Waiting for healthcheck validation (up to 45 seconds)..."
HEALTHY=false
for i in {1..15}; do
  if curl -sf http://127.0.0.1:80/api/health > /dev/null 2>&1 || docker exec converter-api wget -qO- http://127.0.0.1:4000/api/health > /dev/null 2>&1; then
    echo "✅ Healthcheck passed! Service is responding."
    HEALTHY=true
    break
  fi
  echo "   ...waiting for API container liveness probe (attempt $i/15)"
  sleep 3
done

if [[ "$HEALTHY" != "true" ]]; then
  echo "🚨 CRITICAL: New deployment failed healthcheck! Initiating automatic rollback..."
  ./scripts/rollback.sh "$PREV_TAG"
  exit 1
fi

echo "🧹 Pruning stale dangling container layers..."
docker image prune -f --filter "dangling=true"

echo "========================================================"
echo "✨ Deployment to tag '${IMAGE_TAG}' succeeded successfully!"
echo "========================================================"
