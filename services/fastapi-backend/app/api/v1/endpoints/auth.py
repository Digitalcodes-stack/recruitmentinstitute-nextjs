from fastapi import APIRouter, Depends

from app.api.deps import get_current_principal
from app.api.responses import success_response
from app.schemas.common import ResponseEnvelope

router = APIRouter()


@router.get("/me", response_model=ResponseEnvelope[dict])
async def me(principal=Depends(get_current_principal)):
    return success_response({
        "userId": principal.user_id,
        "email": principal.email,
        "name": principal.name,
        "role": principal.role,
        "type": principal.type,
    })
