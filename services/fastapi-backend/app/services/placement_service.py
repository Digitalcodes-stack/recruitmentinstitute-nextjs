from dataclasses import dataclass
from app.models.placement import PlacementTracking
from app.repositories.placement_repository import PlacementRepository


@dataclass
class PlacementService:
    repo: PlacementRepository

    async def list_tracking(self, student_id: int):
        return await self.repo.list_tracking(student_id)

    async def create_tracking(self, row: PlacementTracking):
        return await self.repo.create_tracking(row)

