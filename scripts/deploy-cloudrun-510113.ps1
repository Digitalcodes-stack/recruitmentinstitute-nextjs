$PROJECT_ID = "recruitmentinstitute-510113"
$REGION = "asia-south1"
$SERVICE = "recruitmentinstitute-web"
$IMAGE = "asia-south1-docker.pkg.dev/$PROJECT_ID/recruitmentinstitute/${SERVICE}:latest"

Write-Host "Deploying $SERVICE to Google Cloud Run ($REGION) in $PROJECT_ID..." -ForegroundColor Cyan

gcloud run deploy $SERVICE `
  --image $IMAGE `
  --region $REGION `
  --project $PROJECT_ID `
  --platform managed `
  --allow-unauthenticated `
  --port 3000 `
  --memory 2Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 10 `
  --timeout 120 `
  --env-vars-file production.env.yaml `
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,CRON_SECRET=CRON_SECRET:latest,SMTP_PASS=SMTP_PASS:latest,RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest,RAZORPAY_WEBHOOK_SECRET=RAZORPAY_WEBHOOK_SECRET:latest,GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=GOOGLE_SERVICE_ACCOUNT_KEY_BASE64:latest"

$SERVICE_URL = (gcloud run services describe $SERVICE --region $REGION --project $PROJECT_ID --format "value(status.url)")
Write-Host "Service deployed successfully! URL: $SERVICE_URL" -ForegroundColor Green
