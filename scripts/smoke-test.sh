#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# Universal Media Converter — Production Post-Deployment Smoke Test Suite
# Tests: Frontend Security Headers, COOP/COEP, API Liveness, API Readiness
# ----------------------------------------------------------------------------
set -euo pipefail

WEB_URL="${1:-https://universalmediaconverter.pages.dev}"
API_URL="${2:-https://api.universalmediaconverter.app}"

echo "========================================================"
echo "🧪 Running Smoke Tests Against Production Environment"
echo "   Web Target: $WEB_URL"
echo "   API Target: $API_URL"
echo "========================================================"

FAILED=0

# 1. Frontend Availability & Isolation Headers
echo "🔍 Checking Frontend HTTP Availability & Security Headers..."
WEB_HEADERS=$(curl -sI -L "$WEB_URL" || true)

if echo "$WEB_HEADERS" | grep -iq "HTTP/.* 200"; then
  echo "  ✅ Frontend root returned HTTP 200 OK"
else
  echo "  ❌ Frontend failed to return HTTP 200"
  FAILED=1
fi

if echo "$WEB_HEADERS" | grep -iq "cross-origin-opener-policy: same-origin"; then
  echo "  ✅ COOP Header Verified: same-origin"
else
  echo "  ⚠️ Warning: COOP header missing or incorrect"
fi

if echo "$WEB_HEADERS" | grep -iq "cross-origin-embedder-policy: require-corp"; then
  echo "  ✅ COEP Header Verified: require-corp (SharedArrayBuffer Enabled)"
else
  echo "  ⚠️ Warning: COEP header missing or incorrect"
fi

# 2. API Liveness Probe
echo "🔍 Testing API Liveness Probe (/api/health)..."
HEALTH_RES=$(curl -sf "$API_URL/api/health" || true)
if echo "$HEALTH_RES" | grep -q '"status":"healthy"'; then
  echo "  ✅ API Liveness confirmed healthy"
else
  echo "  ❌ API Liveness probe failed or returned unexpected payload: $HEALTH_RES"
  FAILED=1
fi

# 3. API Readiness Probe (Redis + Storage Capacity Guard)
echo "🔍 Testing API Readiness Probe (/api/ready)..."
READY_RES=$(curl -sf "$API_URL/api/ready" || true)
if echo "$READY_RES" | grep -q '"status":"ready"'; then
  echo "  ✅ API Readiness confirmed (Redis connected, Storage healthy)"
else
  echo "  ❌ API Readiness probe failed or returned degraded: $READY_RES"
  FAILED=1
fi

echo "========================================================"
if [[ "$FAILED" -eq 0 ]]; then
  echo "🎉 All Smoke Tests PASSED! Deployment is verified healthy."
  exit 0
else
  echo "🚨 Smoke Tests FAILED! Inspect errors above."
  exit 1
fi
