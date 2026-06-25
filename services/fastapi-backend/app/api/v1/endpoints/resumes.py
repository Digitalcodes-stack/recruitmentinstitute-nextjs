from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_principal
from app.api.responses import success_response
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import ResumeRead
from app.schemas.common import ResponseEnvelope
from app.services.resume_service import ResumeService

router = APIRouter()

STORAGE_ROOT = Path(__file__).resolve().parents[4] / "storage" / "resumes"


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db_session), principal=Depends(get_current_principal)):
    return success_response(jsonable_encoder(await ResumeService(ResumeRepository(db), STORAGE_ROOT).upload(principal.user_id, file)), "Resume uploaded successfully", status_code=status.HTTP_201_CREATED)


@router.get("")
async def list_resumes(db: AsyncSession = Depends(get_db_session), principal=Depends(get_current_principal)):
    return success_response(jsonable_encoder(await ResumeRepository(db).list_for_student(principal.user_id)))


@router.get("/{resume_id}", response_model=ResponseEnvelope[ResumeRead])
async def get_resume(resume_id: int, db: AsyncSession = Depends(get_db_session), principal=Depends(get_current_principal)):
    return success_response(jsonable_encoder(await ResumeService(ResumeRepository(db), STORAGE_ROOT).get_resume(principal.user_id, resume_id)))
