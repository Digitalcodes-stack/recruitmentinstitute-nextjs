from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class IdentityRepository:
    """Read-only lookups against Prisma-owned identity tables.
    FastAPI does not own these tables and must never write to them.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_student(self, student_id: int) -> dict | None:
        result = await self.db.execute(
            text("SELECT id, name, email, contact FROM login_student WHERE id = :id"),
            {"id": student_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None

    async def get_trainer(self, trainer_id: int) -> dict | None:
        result = await self.db.execute(
            text("SELECT id, name, email, specialization FROM trainers WHERE id = :id"),
            {"id": trainer_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None

    async def get_candidate(self, candidate_id: int) -> dict | None:
        result = await self.db.execute(
            text("SELECT id, name, email FROM candidate_login WHERE id = :id"),
            {"id": candidate_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None

    async def get_admin(self, admin_id: int) -> dict | None:
        result = await self.db.execute(
            text('SELECT id, name, email, role FROM user_admin WHERE id = :id'),
            {"id": admin_id},
        )
        row = result.mappings().first()
        return dict(row) if row else None
