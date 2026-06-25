@echo off
setlocal
cd /d %~dp0\..
if exist .venv\Scripts\activate.bat (
  call .venv\Scripts\activate.bat
)
celery -A app.workers.celery_app.celery_app worker --loglevel=info --pool=solo
