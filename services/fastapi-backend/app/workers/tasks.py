import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from pathlib import Path

from app.db.session import async_session_factory
from app.models.meeting import Meeting
from app.models.placement import PlacementTracking
from app.models.report import AssessmentReport
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.content_repository import ContentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.repositories.identity_repository import IdentityRepository
from app.services.ai.sync_service import ContentSyncService
from app.services.email_service import EmailService
from app.services.report_service import ReportService
from app.services.templates import TemplateRenderer
from app.workers.celery_app import celery_app

REPORTS_STORAGE_ROOT = Path(__file__).resolve().parents[2] / "storage" / "reports"


async def _send_email(to_email: str, subject: str, template: str, context: dict) -> None:
    await EmailService(TemplateRenderer()).send(to_email, subject, template, context)


@celery_app.task(name="reminders.dispatch_meeting_reminders")
def dispatch_meeting_reminders() -> dict[str, int]:
    return asyncio.run(_dispatch_meeting_reminders())


async def _dispatch_meeting_reminders() -> dict[str, int]:
    now = datetime.now(timezone.utc)
    count = 0
    async with async_session_factory() as db:
        meetings_24h = await db.execute(
            select(Meeting).where(
                Meeting.is_cancelled.is_(False),
                Meeting.reminder_24h_sent_at.is_(None),
                Meeting.start_time.between(now + timedelta(hours=23, minutes=55), now + timedelta(hours=24, minutes=5)),
            )
        )
        meetings_1h = await db.execute(
            select(Meeting).where(
                Meeting.is_cancelled.is_(False),
                Meeting.reminder_1h_sent_at.is_(None),
                Meeting.start_time.between(now + timedelta(minutes=55), now + timedelta(minutes=65)),
            )
        )
        for meeting in list(meetings_24h.scalars().all()) + list(meetings_1h.scalars().all()):
            recipient = None
            if meeting.trainer_id:
                trainer = await IdentityRepository(db).get_trainer(meeting.trainer_id)
                recipient = trainer["email"] if trainer else None
            if recipient:
                await _send_email(
                    recipient,
                    "Meeting Reminder",
                    "meeting_reminder.html",
                    {"name": recipient.split("@")[0], "title": meeting.title, "start_time": meeting.start_time, "meeting_url": meeting.meeting_url},
                )
                if meeting.start_time - now > timedelta(hours=2):
                    meeting.reminder_24h_sent_at = now
                else:
                    meeting.reminder_1h_sent_at = now
                count += 1
        await db.commit()
    return {"sent": count}


@celery_app.task(name="placements.dispatch_placement_notifications")
def dispatch_placement_notifications() -> dict[str, int]:
    return asyncio.run(_dispatch_placement_notifications())


async def _dispatch_placement_notifications() -> dict[str, int]:
    now = datetime.now(timezone.utc)
    count = 0
    async with async_session_factory() as db:
        res = await db.execute(select(PlacementTracking).where(PlacementTracking.notified_at.is_(None)))
        for row in res.scalars().all():
            student = await IdentityRepository(db).get_student(row.student_id)
            if student:
                await _send_email(
                    student["email"],
                    "Placement Status Updated",
                    "placement_status_updated.html",
                    {"name": student["email"].split("@")[0], "job_title": row.job_title, "company_name": row.company_name, "stage": row.stage},
                )
                row.notified_at = now
                count += 1
        await db.commit()
    return {"sent": count}


@celery_app.task(name="content.sync_course_embeddings")
def sync_course_embeddings() -> dict[str, int]:
    return asyncio.run(_sync_course_embeddings())


async def _sync_course_embeddings() -> dict[str, int]:
    async with async_session_factory() as db:
        stats = await ContentSyncService(ContentRepository(db), EmbeddingRepository(db)).sync_all()
        return stats


@celery_app.task(name="reports.generate_assessment_report")
def generate_assessment_report(student_assessment_id: int) -> dict:
    return asyncio.run(_generate_assessment_report(student_assessment_id))


async def _generate_assessment_report(student_assessment_id: int) -> dict:
    async with async_session_factory() as db:
        repo = AssessmentRepository(db)
        try:
            report = await ReportService(repo, REPORTS_STORAGE_ROOT).generate_pdf(student_assessment_id)
            await db.commit()
            return {"status": report.status, "file_path": report.file_path}
        except Exception as exc:
            existing = await repo.get_report(student_assessment_id)
            if existing:
                existing.status = "failed"
                existing.error_message = str(exc)
            else:
                await repo.upsert_report(
                    AssessmentReport(student_assessment_id=student_assessment_id, status="failed", error_message=str(exc))
                )
            await db.commit()
            raise
