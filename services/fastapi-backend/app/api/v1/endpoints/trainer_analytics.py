from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_principal, get_db_session
from app.api.responses import success_response
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.trainer_analytics_repository import TrainerAnalyticsRepository
from app.services.trainer_analytics_service import TrainerAnalyticsService

router = APIRouter()


def _service(db: AsyncSession) -> TrainerAnalyticsService:
    return TrainerAnalyticsService(TrainerAnalyticsRepository(db), AssessmentRepository(db))


@router.get("/{trainer_id}/batch-performance")
async def get_batch_performance(
    trainer_id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    result = await _service(db).batch_performance_for_trainer(trainer_id, principal)
    return success_response(jsonable_encoder(result))


@router.get("/{trainer_id}/weak-topics")
async def get_weak_topic_trends(
    trainer_id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    result = await _service(db).weak_topic_trends_for_trainer(trainer_id, principal)
    return success_response(jsonable_encoder(result))


@router.get("/{trainer_id}/courses/{course_id}/effectiveness")
async def get_course_effectiveness(
    trainer_id: int,
    course_id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    result = await _service(db).course_effectiveness_for_trainer(trainer_id, course_id, principal)
    return success_response(jsonable_encoder(result))


@router.get("/{trainer_id}/batches/{batch_id}/ranking")
async def get_student_ranking(
    trainer_id: int,
    batch_id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    result = await _service(db).student_ranking_for_batch(trainer_id, batch_id, principal)
    return success_response(jsonable_encoder(result))


@router.get("/{trainer_id}/batches/{batch_id}/recommendations")
async def get_trainer_recommendations(
    trainer_id: int,
    batch_id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    result = await _service(db).generate_recommendations(trainer_id, batch_id, principal)
    return success_response({"recommendations": result})
