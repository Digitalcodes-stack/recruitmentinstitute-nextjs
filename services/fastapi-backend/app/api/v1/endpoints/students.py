from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_principal
from app.api.responses import success_response
from app.schemas.common import ResponseEnvelope
from app.models.resume import StudentResume
from app.models.placement import PlacementTracking

router = APIRouter()


@router.get("/dashboard", response_model=ResponseEnvelope[dict[str, int]])
async def dashboard(db: AsyncSession = Depends(get_db_session), principal=Depends(get_current_principal)):
    resumes = await db.execute(select(func.count(StudentResume.id)).where(StudentResume.student_id == principal.user_id))
    placements = await db.execute(select(func.count(PlacementTracking.id)).where(PlacementTracking.student_id == principal.user_id))
    return success_response({
        "resumes": resumes.scalar_one(),
        "placements": placements.scalar_one(),
    })
