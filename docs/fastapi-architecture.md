# FastAPI Microservice Architecture

This repository now includes a dedicated FastAPI scaffold under `services/fastapi-backend`.

## Boundaries

- Next.js remains the frontend and current shared backend for auth, CMS, and existing training pages.
- FastAPI is reserved for new domain-heavy workflows:
  - LMS APIs
  - placement portal
  - resume builder
  - interview prep
  - meeting orchestration
  - notification dispatch
  - background jobs

## Service layout

```text
services/fastapi-backend/
  app/
    api/
      v1/
        endpoints/
    core/
    db/
    models/
    repositories/
    schemas/
    services/
    workers/
```

## Implementation order

1. Add real SQLAlchemy models for new FastAPI-owned tables.
2. Connect JWT auth for service-to-service and portal access.
3. Implement LMS read APIs.
4. Implement placement and employer APIs.
5. Add reminder scheduler and job queue worker.
6. Add Google Calendar / Meet adapter.
7. Add notification dispatch and delivery logging.

## Delivered Scaffold

- Async FastAPI app with health check and versioned routers
- JWT login, refresh, and current-user endpoints
- SQLAlchemy models for service-owned tables
- Alembic initial migration
- Repository and service layers
- Resume upload validation and storage
- Meeting provider abstraction for future Zoom/Google/Teams support
- Celery worker scaffold for reminders and notifications
