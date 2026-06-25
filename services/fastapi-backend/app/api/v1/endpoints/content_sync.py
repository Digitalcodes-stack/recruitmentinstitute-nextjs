from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, require_principal_types
from app.api.responses import success_response
from app.repositories.content_repository import ContentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.services.ai.sync_service import ContentSyncService
from app.workers.celery_app import celery_app
from app.workers.tasks import sync_course_embeddings

router = APIRouter()


@router.post("/sync")
async def trigger_content_sync(_principal=Depends(require_principal_types("admin"))):
    result = sync_course_embeddings.delay()
    return success_response({"task_id": result.id})


@router.get("/sync/status/{task_id}")
async def get_content_sync_status(task_id: str, _principal=Depends(require_principal_types("admin"))):
    result = celery_app.AsyncResult(task_id)
    return success_response({"state": result.state, "result": result.result if result.ready() else None})


@router.post("/sync/run-now")
async def run_content_sync_now(
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin")),
):
    stats = await ContentSyncService(ContentRepository(db), EmbeddingRepository(db)).sync_all()
    return success_response(jsonable_encoder(stats))
