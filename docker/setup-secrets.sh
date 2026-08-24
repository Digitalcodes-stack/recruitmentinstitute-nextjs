#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Create Google Cloud Secret Manager secrets
# Run ONCE before deploying: bash docker/setup-secrets.sh
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="recruitmentinstitute"

create_secret() {
  local NAME="$1"
  local VALUE="$2"
  if gcloud secrets describe "${NAME}" --project "${PROJECT_ID}" &>/dev/null; then
    echo "  Updating secret: ${NAME}"
    echo -n "${VALUE}" | gcloud secrets versions add "${NAME}" --data-file=- --project "${PROJECT_ID}"
  else
    echo "  Creating secret: ${NAME}"
    echo -n "${VALUE}" | gcloud secrets create "${NAME}" --data-file=- --replication-policy=automatic --project "${PROJECT_ID}"
  fi
}

echo ""
echo "=== Enter your secret values ==="
echo "(These are stored securely in Google Secret Manager)"
echo ""

read -rp "PostgreSQL DATABASE_URL for Next.js (postgresql://...): " NEXTJS_DB
read -rp "PostgreSQL DATABASE_URL for FastAPI (postgresql+asyncpg://...): " FASTAPI_DB
read -rsp "JWT_SECRET (shared key, min 32 chars): " JWT_SECRET; echo
read -rsp "CRON_SECRET (cron tick auth token): " CRON_SECRET; echo
read -rsp "SERVICE_API_KEY (internal API key): " SERVICE_API_KEY; echo
read -rsp "GEMINI_API_KEY: " GEMINI_API_KEY; echo
read -rsp "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: " GOOGLE_SERVICE_ACCOUNT_KEY_BASE64; echo
read -rsp "SMTP_PASSWORD: " SMTP_PASSWORD; echo

echo ""
echo "=== Creating secrets in project: ${PROJECT_ID} ==="

create_secret "NEXTJS_DATABASE_URL"               "${NEXTJS_DB}"
create_secret "FASTAPI_DATABASE_URL"              "${FASTAPI_DB}"
create_secret "JWT_SECRET"                        "${JWT_SECRET}"
create_secret "CRON_SECRET"                       "${CRON_SECRET}"
create_secret "SERVICE_API_KEY"                   "${SERVICE_API_KEY}"
create_secret "GEMINI_API_KEY"                    "${GEMINI_API_KEY}"
create_secret "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" "${GOOGLE_SERVICE_ACCOUNT_KEY_BASE64}"
create_secret "SMTP_PASSWORD"                     "${SMTP_PASSWORD}"

echo ""
echo "=== All secrets created. ==="
echo "    Grant Cloud Run access: the deploy script uses --set-secrets to bind them."
