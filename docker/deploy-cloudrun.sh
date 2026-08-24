#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# Deploy both services to Google Cloud Run
# Run from the repo ROOT: bash docker/deploy-cloudrun.sh
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

# ── CONFIG — edit these ──────────────────────────────────────────
PROJECT_ID="recruitmentinstitute"
REGION="asia-south1"          # Mumbai — closest to India
NEXTJS_SERVICE="recruitmentinstitute-web"
FASTAPI_SERVICE="recruitmentinstitute-api"
IMAGE_REGISTRY="gcr.io/${PROJECT_ID}"
# ────────────────────────────────────────────────────────────────

NEXTJS_IMAGE="${IMAGE_REGISTRY}/${NEXTJS_SERVICE}:latest"
FASTAPI_IMAGE="${IMAGE_REGISTRY}/${FASTAPI_SERVICE}:latest"

echo ""
echo "=== Building & pushing Next.js image ==="
docker build \
  -f docker/Dockerfile.nextjs \
  -t "${NEXTJS_IMAGE}" \
  .

docker push "${NEXTJS_IMAGE}"

echo ""
echo "=== Building & pushing FastAPI image ==="
docker build \
  -f docker/Dockerfile.fastapi \
  -t "${FASTAPI_IMAGE}" \
  .

docker push "${FASTAPI_IMAGE}"

echo ""
echo "=== Deploying FastAPI to Cloud Run ==="
gcloud run deploy "${FASTAPI_SERVICE}" \
  --image "${FASTAPI_IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8000 \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 5 \
  --timeout 120 \
  --set-env-vars "APP_ENV=production,APP_DEBUG=false,AI_PROVIDER=gemini,AI_PROVIDER_FALLBACK_ORDER=gemini,local_ai,claude,openai,GEMINI_MODEL_PRIMARY=gemini-2.5-flash,GEMINI_MODEL_OVERFLOW=gemini-2.5-flash-lite,GEMINI_TEMPERATURE=0.2,EMAIL_ENABLED=true,SMTP_HOST=mail.recruitmentinstitute.in,SMTP_PORT=587,SMTP_USERNAME=support@recruitmentinstitute.in,SMTP_FROM_EMAIL=support@recruitmentinstitute.in,SMTP_FROM_NAME=Recruitment Institute,SMTP_USE_TLS=true,SMTP_CC_EMAIL=sesasiba.es@gmail.com" \
  --set-secrets "DATABASE_URL=FASTAPI_DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SERVICE_API_KEY=SERVICE_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,SMTP_PASSWORD=SMTP_PASSWORD:latest"

# Get the FastAPI URL to pass to Next.js
FASTAPI_URL=$(gcloud run services describe "${FASTAPI_SERVICE}" \
  --region "${REGION}" --format "value(status.url)")

echo ""
echo "=== Deploying Next.js to Cloud Run ==="
gcloud run deploy "${NEXTJS_SERVICE}" \
  --image "${NEXTJS_IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --timeout 60 \
  --set-env-vars "NODE_ENV=production,FASTAPI_SERVICE_URL=${FASTAPI_URL},SMTP_HOST=mail.recruitmentinstitute.in,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=support@recruitmentinstitute.in,EMAIL_FROM=support@recruitmentinstitute.in,EMAIL_FROM_NAME=Recruitment Institute,ADMIN_EMAIL=support@recruitmentinstitute.in,EMAIL_CC=sesasiba.es@gmail.com,GOOGLE_IMPERSONATE_EMAIL=digitalaimlsystem@gmail.com" \
  --set-secrets "DATABASE_URL=NEXTJS_DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,CRON_SECRET=CRON_SECRET:latest,GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=GOOGLE_SERVICE_ACCOUNT_KEY_BASE64:latest,SMTP_PASS=SMTP_PASSWORD:latest"

NEXTJS_URL=$(gcloud run services describe "${NEXTJS_SERVICE}" \
  --region "${REGION}" --format "value(status.url)")

echo ""
echo "================================================"
echo "  Deployment complete!"
echo "  Next.js:  ${NEXTJS_URL}"
echo "  FastAPI:  ${FASTAPI_URL}"
echo "================================================"
