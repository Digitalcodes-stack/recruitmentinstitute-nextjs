from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "recruitment_institute_fastapi",
    broker=settings.redis_broker_url or settings.redis_url or "redis://localhost:6379/0",
    backend=settings.redis_backend_url or settings.redis_broker_url or settings.redis_url or "redis://localhost:6379/1",
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "meeting-reminders-15m": {
        "task": "reminders.dispatch_meeting_reminders",
        "schedule": 300.0,
    },
    "placement-notifications": {
        "task": "placements.dispatch_placement_notifications",
        "schedule": 300.0,
    },
    "content-embedding-sync-daily": {
        "task": "content.sync_course_embeddings",
        "schedule": 86400.0,
    },
}
