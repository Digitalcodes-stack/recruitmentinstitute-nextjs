# Windows/XAMPP Deployment

## Prerequisites

- Python 3.11 or 3.12
- PostgreSQL 15+
- Redis 6+
- Existing XAMPP stack for the Next.js app

## Install Python

1. Install Python from python.org.
2. Enable `Add python.exe to PATH`.
3. Verify:

```bat
python --version
```

## Create the virtual environment

```bat
cd D:\xampp\htdocs\recruitmentinstitute-nextjs\services\fastapi-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Configure environment

Copy `.env.example` to `.env` and set production values for:

- `DATABASE_URL`
- `REDIS_URL`
- `REDIS_BROKER_URL`
- `REDIS_BACKEND_URL`
- `JWT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

## Database migration

```bat
alembic upgrade head
```

## Start services

FastAPI:

```bat
scripts\start_fastapi.bat
```

Celery worker:

```bat
scripts\start_celery_worker.bat
```

Celery beat:

```bat
scripts\start_celery_beat.bat
```

## Redis installation

Use one of:

- Memurai on Windows
- Redis through WSL2
- Redis Docker container

Point `REDIS_BROKER_URL`, `REDIS_BACKEND_URL`, and `REDIS_URL` at the running instance.

## Restart procedure

1. Stop FastAPI, Celery worker, and Celery beat.
2. Apply config changes.
3. Run `alembic upgrade head` if migrations changed.
4. Restart `scripts\start_fastapi.bat`.
5. Restart worker and beat.

