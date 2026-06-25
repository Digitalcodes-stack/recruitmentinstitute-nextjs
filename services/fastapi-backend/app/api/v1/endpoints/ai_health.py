from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder

from app.api.deps import require_principal_types
from app.api.responses import success_response
from app.services.ai.ai_service import check_provider_health

router = APIRouter()


@router.get("/health")
async def get_ai_health(_principal=Depends(require_principal_types("admin"))):
    result = await check_provider_health()
    return success_response(jsonable_encoder(result))
