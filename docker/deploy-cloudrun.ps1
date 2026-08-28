# ─────────────────────────────────────────────────────────────────
# Deploy Next.js & FastAPI to Google Cloud Run (PowerShell for Windows)
# Run from repository root: .\docker\deploy-cloudrun.ps1
# ─────────────────────────────────────────────────────────────────

$PROJECT_ID = "recruitmentinstitute-501106"
$REGION = "asia-south1" # Mumbai
$NEXTJS_SERVICE = "recruitmentinstitute-web"
$FASTAPI_SERVICE = "recruitmentinstitute-api"
$IMAGE_REGISTRY = "gcr.io/$PROJECT_ID"

$NEXTJS_IMAGE = "$IMAGE_REGISTRY/${NEXTJS_SERVICE}:latest"
$FASTAPI_IMAGE = "$IMAGE_REGISTRY/${FASTAPI_SERVICE}:latest"

Write-Host ""
Write-Host "=== Setting active Google Cloud Project: $PROJECT_ID ===" -ForegroundColor Green
gcloud config set project $PROJECT_ID

Write-Host ""
Write-Host "=== Step 1: Building & pushing Next.js image via Google Cloud Build ===" -ForegroundColor Cyan
gcloud builds submit --config=cloudbuild.yaml .

Write-Host ""
Write-Host "=== Step 2: Building & pushing FastAPI image via Google Cloud Build ===" -ForegroundColor Cyan
gcloud builds submit --config=cloudbuild-fastapi.yaml .

Write-Host ""
Write-Host "=== Step 3: Deploying FastAPI to Google Cloud Run ===" -ForegroundColor Cyan
gcloud run deploy $FASTAPI_SERVICE `
  --image $FASTAPI_IMAGE `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --port 8000 `
  --memory 4Gi `
  --cpu 2 `
  --min-instances 1 `
  --max-instances 5 `
  --timeout 120 `
  --set-env-vars "APP_ENV=production,APP_DEBUG=false,AI_PROVIDER=gemini,AI_PROVIDER_FALLBACK_ORDER=gemini:local_ai:claude:openai,GEMINI_MODEL_PRIMARY=gemini-2.5-flash,GEMINI_MODEL_OVERFLOW=gemini-2.5-flash-lite,GEMINI_TEMPERATURE=0.2,EMAIL_ENABLED=true,SMTP_HOST=mail.recruitmentinstitute.in,SMTP_PORT=587,SMTP_USERNAME=support@recruitmentinstitute.in,SMTP_FROM_EMAIL=support@recruitmentinstitute.in,SMTP_FROM_NAME=Recruitment Institute,SMTP_USE_TLS=true,SMTP_CC_EMAIL=sesasiba.es@gmail.com" `
  --set-secrets "DATABASE_URL=FASTAPI_DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,SERVICE_API_KEY=SERVICE_API_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,SMTP_PASSWORD=SMTP_PASSWORD:latest"

# Fetch FastAPI public URL
$FASTAPI_URL = (gcloud run services describe $FASTAPI_SERVICE --region $REGION --format "value(status.url)")
Write-Host "FastAPI deployed at: $FASTAPI_URL" -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 4: Deploying Next.js to Google Cloud Run ===" -ForegroundColor Cyan
gcloud run deploy $NEXTJS_SERVICE `
  --image $NEXTJS_IMAGE `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --port 3000 `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 1 `
  --max-instances 10 `
  --timeout 60 `
  --set-env-vars "NODE_ENV=production,FASTAPI_SERVICE_URL=$FASTAPI_URL,SMTP_HOST=mail.recruitmentinstitute.in,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=support@recruitmentinstitute.in,EMAIL_FROM=support@recruitmentinstitute.in,EMAIL_FROM_NAME=Recruitment Institute,ADMIN_EMAIL=patilrupalib@gmail.com,EMAIL_CC=patilrupalib@gmail.com,GOOGLE_IMPERSONATE_EMAIL=digitalaimlsystem@gmail.com" `
  --set-secrets "DATABASE_URL=NEXTJS_DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,CRON_SECRET=CRON_SECRET:latest,GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=GOOGLE_SERVICE_ACCOUNT_KEY_BASE64:latest,SMTP_PASS=SMTP_PASSWORD:latest"

$NEXTJS_URL = (gcloud run services describe $NEXTJS_SERVICE --region $REGION --format "value(status.url)")

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Deployment complete!" -ForegroundColor Green
Write-Host "  Next.js URL:  $NEXTJS_URL" -ForegroundColor Cyan
Write-Host "  FastAPI URL:  $FASTAPI_URL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green
