from sqlalchemy import bindparam, text
from sqlalchemy.ext.asyncio import AsyncSession

_ACTIVE_ENROLLMENT_STATUSES = ("APPROVED", "ACTIVE", "ENROLLED")


class TrainerAnalyticsRepository:
    """Read-only lookups against Prisma-owned trainer/batch/enrollment tables.
    FastAPI does not own these tables and must never write to them.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_batches_for_trainer(self, trainer_id: int) -> list[dict]:
        result = await self.db.execute(
            text("SELECT id, name, course_id, status FROM batches WHERE trainer_id = :trainer_id"),
            {"trainer_id": trainer_id},
        )
        return [dict(row) for row in result.mappings().all()]

    async def get_students_in_batch(self, batch_id: int) -> list[dict]:
        query = text(
            """
            SELECT s.id AS id, s.name AS name, s.email AS email
            FROM login_student s
            JOIN enrollments e ON e.student_id = s.id
            WHERE e.batch_id = :batch_id AND e.status IN :statuses
            """
        ).bindparams(bindparam("statuses", expanding=True))
        result = await self.db.execute(query, {"batch_id": batch_id, "statuses": _ACTIVE_ENROLLMENT_STATUSES})
        return [dict(row) for row in result.mappings().all()]

    async def get_course_for_batch(self, batch_id: int) -> dict | None:
        result = await self.db.execute(
            text("SELECT c.id AS id, c.title AS title FROM courses c JOIN batches b ON b.course_id = c.id WHERE b.id = :batch_id"),
            {"batch_id": batch_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None

    async def verify_batch_belongs_to_trainer(self, batch_id: int, trainer_id: int) -> bool:
        result = await self.db.execute(
            text("SELECT 1 FROM batches WHERE id = :batch_id AND trainer_id = :trainer_id"),
            {"batch_id": batch_id, "trainer_id": trainer_id},
        )
        return result.first() is not None
