# ─────────────────────────────────────────────────────────────────
# Setup Google Cloud Secrets (PowerShell for Windows)
# Run from repository root: .\docker\setup-secrets.ps1
# ─────────────────────────────────────────────────────────────────

$PROJECT_ID = "recruitmentinstitute-501106"

function Create-Or-Update-Secret {
    param (
        [string]$Name,
        [string]$Value
    )
    Write-Host "Checking secret: $Name ..." -ForegroundColor Cyan
    $exists = gcloud secrets describe $Name --project $PROJECT_ID 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Updating secret: $Name" -ForegroundColor Yellow
        $Value | gcloud secrets versions add $Name --data-file=- --project $PROJECT_ID
    } else {
        Write-Host "  Creating secret: $Name" -ForegroundColor Green
        $Value | gcloud secrets create $Name --data-file=- --replication-policy=automatic --project $PROJECT_ID
    }
}

Write-Host ""
Write-Host "=== Setting up Google Cloud Secret Manager ($PROJECT_ID) ===" -ForegroundColor Green
Write-Host ""

# Default values (read from environment or use placeholders)
$NEXTJS_DB = $env:NEXTJS_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/recruitmentinstitute"
$FASTAPI_DB = $env:FASTAPI_DATABASE_URL ?? "postgresql+asyncpg://postgres:postgres@localhost:5432/recruitmentinstitute"
$JWT_SECRET = $env:JWT_SECRET ?? "dev-secret-key-for-local-development-only-change-in-prod"
$CRON_SECRET = $env:CRON_SECRET ?? "local-dev-cron-secret-for-manual-tick-testing"
$SERVICE_API_KEY = $env:SERVICE_API_KEY ?? "dev-service-key-for-internal-api-only"
$GEMINI_API_KEY = $env:GEMINI_API_KEY ?? "PLACEHOLDER_GEMINI_API_KEY"
$GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 = $env:GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 ?? "PLACEHOLDER_BASE64_KEY"
$SMTP_PASSWORD = $env:SMTP_PASSWORD ?? "PLACEHOLDER_SMTP_PASSWORD"

Create-Or-Update-Secret -Name "NEXTJS_DATABASE_URL" -Value $NEXTJS_DB
Create-Or-Update-Secret -Name "FASTAPI_DATABASE_URL" -Value $FASTAPI_DB
Create-Or-Update-Secret -Name "JWT_SECRET" -Value $JWT_SECRET
Create-Or-Update-Secret -Name "CRON_SECRET" -Value $CRON_SECRET
Create-Or-Update-Secret -Name "SERVICE_API_KEY" -Value $SERVICE_API_KEY
Create-Or-Update-Secret -Name "GEMINI_API_KEY" -Value $GEMINI_API_KEY
Create-Or-Update-Secret -Name "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" -Value $GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
Create-Or-Update-Secret -Name "SMTP_PASSWORD" -Value $SMTP_PASSWORD

Write-Host ""
Write-Host "=== All Secrets Configured Successfully in Google Cloud! ===" -ForegroundColor Green
Write-Host ""
