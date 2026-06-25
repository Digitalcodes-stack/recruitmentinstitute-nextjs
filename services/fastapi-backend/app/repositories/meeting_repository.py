from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting import Meeting, MeetingAttendee
from app.schemas.meeting import MeetingCreate, MeetingUpdate


class MeetingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(**payload.model_dump())
        self.db.add(meeting)
        await self.db.commit()
        await self.db.refresh(meeting)
        return meeting

    async def get(self, meeting_id: int) -> Meeting | None:
        return await self.db.get(Meeting, meeting_id)

    async def update(self, meeting: Meeting, payload: MeetingUpdate) -> Meeting:
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(meeting, key, value)
        await self.db.commit()
        await self.db.refresh(meeting)
        return meeting

    async def upcoming(self) -> Sequence[Meeting]:
        res = await self.db.execute(select(Meeting).where(Meeting.is_cancelled.is_(False)).order_by(Meeting.start_time.asc()))
        return res.scalars().all()

    async def add_attendee(self, meeting_id: int, email: str, user_id: int | None = None, student_id: int | None = None, trainer_id: int | None = None) -> MeetingAttendee:
        attendee = MeetingAttendee(meeting_id=meeting_id, email=email, user_id=user_id, student_id=student_id, trainer_id=trainer_id)
        self.db.add(attendee)
        await self.db.commit()
        await self.db.refresh(attendee)
        return attendee

