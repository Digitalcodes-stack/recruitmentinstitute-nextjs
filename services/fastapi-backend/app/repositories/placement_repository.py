from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.placement import PlacementTracking


class PlacementRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_tracking(self, student_id: int) -> Sequence[PlacementTracking]:
        res = await self.db.execute(select(PlacementTracking).where(PlacementTracking.student_id == student_id).order_by(PlacementTracking.applied_at.desc()))
        return res.scalars().all()

    async def create_tracking(self, row: PlacementTracking) -> PlacementTracking:
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return row

