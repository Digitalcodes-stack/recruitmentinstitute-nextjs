from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.deps import get_db_session, get_current_principal, require_principal_types
from app.models.placement import PlacementTracking
from app.repositories.placement_repository import PlacementRepository
from app.services.placement_service import PlacementService
from app.schemas.placement import PlacementTrackingCreate
from app.repositories.identity_repository import IdentityRepository
from app.services.email_service import EmailService
from app.schemas.placement_tracking import PlacementTrackingRead
from app.api.responses import success_response
from app.schemas.common import ResponseEnvelope

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/tracking/me", response_model=ResponseEnvelope[list[PlacementTrackingRead]])
async def my_tracking(db: AsyncSession = Depends(get_db_session), principal=Depends(get_current_principal)):
    return success_response(jsonable_encoder(await PlacementService(PlacementRepository(db)).list_tracking(principal.user_id)))


@router.post("/tracking", response_model=ResponseEnvelope[PlacementTrackingRead], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_principal_types("admin", "trainer"))])
async def create_tracking(payload: PlacementTrackingCreate, db: AsyncSession = Depends(get_db_session)):
    row = PlacementTracking(student_id=payload.student_id, job_title=payload.job_title, company_name=payload.company_name)
    created = await PlacementService(PlacementRepository(db)).create_tracking(row)
    student = await IdentityRepository(db).get_student(payload.student_id)
    if student:
        try:
            await EmailService().send(
                student["email"],
                "Placement Status Updated",
                "placement_status_updated.html",
                {"name": student["email"].split("@")[0], "job_title": payload.job_title, "company_name": payload.company_name, "stage": created.stage},
            )
        except Exception:
            logger.exception("Placement notification email failed for student_id=%s", payload.student_id)
    return success_response(jsonable_encoder(created), "Placement tracking created successfully", status_code=status.HTTP_201_CREATED)
