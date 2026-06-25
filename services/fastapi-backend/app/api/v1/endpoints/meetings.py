from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, require_principal_types
from app.api.responses import success_response
from app.schemas.meeting import MeetingCreate, MeetingRead, MeetingUpdate
from app.schemas.common import ResponseEnvelope
from app.repositories.meeting_repository import MeetingRepository
from app.services.meeting_service import MeetingService

router = APIRouter()


@router.post("", response_model=ResponseEnvelope[MeetingRead], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_principal_types("admin", "trainer"))])
async def create_meeting(payload: MeetingCreate, db: AsyncSession = Depends(get_db_session)):
    return success_response(jsonable_encoder(await MeetingService(MeetingRepository(db)).create(payload)), "Meeting scheduled successfully", status_code=status.HTTP_201_CREATED)


@router.put("/{meeting_id}", response_model=ResponseEnvelope[MeetingRead], dependencies=[Depends(require_principal_types("admin", "trainer"))])
async def update_meeting(meeting_id: int, payload: MeetingUpdate, db: AsyncSession = Depends(get_db_session)):
    return success_response(jsonable_encoder(await MeetingService(MeetingRepository(db)).update(meeting_id, payload)), "Meeting updated successfully")


@router.delete("/{meeting_id}", response_model=ResponseEnvelope[MeetingRead], dependencies=[Depends(require_principal_types("admin", "trainer"))])
async def cancel_meeting(meeting_id: int, db: AsyncSession = Depends(get_db_session)):
    return success_response(jsonable_encoder(await MeetingService(MeetingRepository(db)).cancel(meeting_id)), "Meeting cancelled successfully")


@router.get("/upcoming", response_model=ResponseEnvelope[list[MeetingRead]])
async def upcoming_meetings(db: AsyncSession = Depends(get_db_session)):
    return success_response(jsonable_encoder(await MeetingService(MeetingRepository(db)).upcoming()))
