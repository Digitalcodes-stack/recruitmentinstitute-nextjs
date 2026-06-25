from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resume import StudentResume


class ResumeRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, resume: StudentResume) -> StudentResume:
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def list_for_student(self, student_id: int) -> Sequence[StudentResume]:
        res = await self.db.execute(select(StudentResume).where(StudentResume.student_id == student_id).order_by(StudentResume.created_at.desc()))
        return res.scalars().all()

    async def get(self, resume_id: int) -> StudentResume | None:
        return await self.db.get(StudentResume, resume_id)

    async def get_for_student(self, student_id: int, resume_id: int) -> StudentResume | None:
        resume = await self.db.get(StudentResume, resume_id)
        if resume and resume.student_id == student_id:
            return resume
        return None
