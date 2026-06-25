# Recruitment Institute FastAPI Backend

This directory contains the new microservice scaffold for platform domains that are intentionally
separate from the existing Next.js app:

- LMS delivery
- Placement management
- Resume builder
- Interview preparation
- Meeting orchestration
- Background jobs and reminders
- Notification dispatch

## Scope

The Next.js app remains the system of record for:

- Auth entry points
- Admin panel
- Student portal
- Trainer portal
- Shared course/catalog data

This FastAPI service is intended to own new domain APIs only, while integrating with the existing
platform through the shared PostgreSQL database and JWT-based service-to-service auth.

## Layout

- `app/main.py` - FastAPI application factory
- `app/core/` - config, security, logging
- `app/db/` - SQLAlchemy session and base
- `app/models/` - service-owned domain models
- `app/schemas/` - Pydantic request/response models
- `app/repositories/` - database access layer
- `app/services/` - business logic
- `app/api/` - routers grouped by domain
- `app/workers/` - reminder and notification jobs

## Getting started

1. Create a Python virtual environment.
2. Install dependencies from `requirements.txt`.
3. Set environment variables from `.env.example`.
4. Run `uvicorn app.main:app --reload`.

## Implemented API surface

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `GET /api/v1/courses`
- `GET /api/v1/courses/{id}`
- `POST /api/v1/courses`
- `PUT /api/v1/courses/{id}`
- `DELETE /api/v1/courses/{id}`
- `POST /api/v1/enrollments`
- `GET /api/v1/enrollments/student/{student_id}`
- `GET /api/v1/enrollments/pending`
- `POST /api/v1/resumes`
- `GET /api/v1/resumes`
- `POST /api/v1/trainers/assign`
- `GET /api/v1/trainers/{trainer_id}/students`
- `GET /api/v1/trainers/me/assigned`
- `POST /api/v1/meetings`
- `PUT /api/v1/meetings/{meeting_id}`
- `DELETE /api/v1/meetings/{meeting_id}`
- `GET /api/v1/meetings/upcoming`
- `POST /api/v1/auth/logout`
- `POST /api/v1/enrollments/{enrollment_id}/approve`
- `POST /api/v1/enrollments/{enrollment_id}/reject`
- `GET /api/v1/resumes/{resume_id}`

## Migration summary

- Alembic revision: `0001_initial`
- Tables created:
  - `users`
  - `courses`
  - `trainers`
  - `enrollments`
  - `student_trainer_mapping`
  - `meetings`
  - `meeting_attendees`
  - `student_resumes`
  - `placement_tracking`
  - `notifications`
  - `email_logs`
  - `refresh_tokens`
  - `audit_logs`

## Runtime hardening

- Celery workers with Redis broker/backend.
- Redis blacklist for revoked JWT access tokens.
- Persistent refresh-token table with revocation support.
- SMTP email delivery with HTML templates.
- Google Calendar / Meet integration when credentials are configured.

## Environment variables

See `.env.example` for required runtime settings:

- `DATABASE_URL`
- `REDIS_URL` or `REDIS_BROKER_URL`
- `REDIS_BACKEND_URL`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

## Next.js integration

- Keep the existing Next.js app as the frontend and current content/auth surface.
- Call the FastAPI service from Next.js using `Authorization: Bearer <access_token>`.
- Route only new LMS, placement, resume, meeting, and notification workloads to FastAPI.
- Do not migrate or duplicate existing Next.js database tables or UI.
