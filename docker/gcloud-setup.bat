@echo off
echo ============================================
echo  Google Cloud Setup for Recruitment Institute
echo ============================================
echo.

echo Step 1: Login to Google Cloud...
gcloud auth login

echo.
echo Step 2: Set project...
gcloud config set project recruitmentinstitute

echo.
echo Step 3: Configure Docker to use Google Container Registry...
gcloud auth configure-docker --quiet

echo.
echo Step 4: Enable required APIs...
gcloud services enable run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com

echo.
echo Step 5: Verify setup...
gcloud config list
echo.
echo ============================================
echo  Setup complete! Press any key to close.
echo ============================================
pause
