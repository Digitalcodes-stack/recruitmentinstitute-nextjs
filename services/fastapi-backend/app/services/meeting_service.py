from dataclasses import dataclass
import logging
from app.core.exceptions import ServiceError
from app.integrations.meetings.factory import get_meeting_provider
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.identity_repository import IdentityRepository
from app.services.email_service import EmailService
from app.schemas.meeting import MeetingCreate, MeetingUpdate


@dataclass
class MeetingService:
    repo: MeetingRepository
    logger = logging.getLogger(__name__)

    async def create(self, payload: MeetingCreate):
        provider = get_meeting_provider()
        provider_result = await provider.create(payload.title, payload.start_time, payload.end_time, payload.description)
        payload.external_meeting_id = provider_result.external_meeting_id
        payload.meeting_url = payload.meeting_url or provider_result.meeting_url
        meeting = await self.repo.create(payload)
        if payload.trainer_id:
            trainer = await IdentityRepository(self.repo.db).get_trainer(payload.trainer_id)
            if trainer:
                try:
                    await EmailService().send(
                        trainer["email"],
                        "Meeting Scheduled",
                        "meeting_scheduled.html",
                        {"name": trainer["name"], "title": meeting.title, "start_time": meeting.start_time, "meeting_url": meeting.meeting_url},
                    )
                except Exception:
                    self.logger.exception("Meeting scheduled email failed for meeting_id=%s", meeting.id)
        return meeting

    async def update(self, meeting_id: int, payload: MeetingUpdate):
        meeting = await self.repo.get(meeting_id)
        if not meeting:
            raise ServiceError("Meeting not found", 404)
        provider = get_meeting_provider()
        if meeting.external_meeting_id and any(v is not None for v in payload.model_dump(exclude_unset=True).values()):
            provider_result = await provider.update(
                meeting.external_meeting_id,
                payload.title or meeting.title,
                payload.start_time or meeting.start_time,
                payload.end_time or meeting.end_time,
                payload.description if payload.description is not None else meeting.description,
            )
            if provider_result.meeting_url:
                payload.meeting_url = provider_result.meeting_url
            if provider_result.external_meeting_id:
                payload.external_meeting_id = provider_result.external_meeting_id
        return await self.repo.update(meeting, payload)

    async def cancel(self, meeting_id: int):
        meeting = await self.repo.get(meeting_id)
        if not meeting:
            raise ServiceError("Meeting not found", 404)
        provider = get_meeting_provider()
        if meeting.external_meeting_id:
            await provider.cancel(meeting.external_meeting_id)
        return await self.repo.update(meeting, MeetingUpdate(is_cancelled=True))

    async def upcoming(self):
        return await self.repo.upcoming()
