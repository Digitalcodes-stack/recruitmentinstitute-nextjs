$PROJECT_ID = "recruitmentinstitute-510113"

function Set-GcpSecret {
    param (
        [string]$Name,
        [string]$Value
    )
    Write-Host "Configuring secret: $Name ..." -ForegroundColor Cyan
    $describe = gcloud secrets describe $Name --project $PROJECT_ID 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Adding new version to $Name"
        $Value | gcloud secrets versions add $Name --data-file=- --project $PROJECT_ID
    } else {
        Write-Host "  Creating secret $Name"
        $Value | gcloud secrets create $Name --data-file=- --replication-policy=automatic --project $PROJECT_ID
    }
}

Set-GcpSecret -Name "DATABASE_URL" -Value "postgresql://postgres:RI_CloudSql_2026_Pass!@35.200.228.49:5432/recruitmentinstitute"
Set-GcpSecret -Name "JWT_SECRET" -Value "c8f1e58288da4a1993f41249b672728f323a6344585e5b61"
Set-GcpSecret -Name "CRON_SECRET" -Value "ri_cron_secret_2026"
Set-GcpSecret -Name "SMTP_PASS" -Value "ledemkmjiesdqfpk"
Set-GcpSecret -Name "RAZORPAY_KEY_SECRET" -Value "hvO4iBLPhZGoDQ8LxzmPNdOc"
Set-GcpSecret -Name "RAZORPAY_WEBHOOK_SECRET" -Value "ri_razorpay_webhook_secret_2026"
Set-GcpSecret -Name "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" -Value "24e5ab1fb0cff39d5804531740901bb22c8391b4"

Write-Host "Secrets setup complete for $PROJECT_ID!" -ForegroundColor Green
