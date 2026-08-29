"""Virtual Executive profile CRUD + copy + live prompt preview."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, VirtualExecutive
from app.schemas import ExecutiveCreate, ExecutiveOut, ExecutiveUpdate, JDTextOut, SendEmailRequest
from app.services.email_service import EmailNotConfigured, send_email
from app.services.jd_formatter import format_jd_text
from app.services.prompt_builder import build_system_prompt
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/executives", tags=["executives"])


async def _get_owned_executive(exec_id: uuid.UUID, user: User, db: AsyncSession) -> VirtualExecutive:
    executive = await db.get(VirtualExecutive, exec_id)
    if not executive or executive.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Virtual executive not found")
    return executive


@router.get("", response_model=list[ExecutiveOut])
async def list_executives(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.scalars(
        select(VirtualExecutive).where(VirtualExecutive.owner_id == user.id).order_by(VirtualExecutive.created_at.desc())
    )
    return result.all()


@router.post("", response_model=ExecutiveOut, status_code=status.HTTP_201_CREATED)
async def create_executive(
    payload: ExecutiveCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    # model_dump() recursively converts nested pydantic models (FAQItem, ActionSlot, ...) to plain dicts for JSONB
    executive = VirtualExecutive(owner_id=user.id, **payload.model_dump())
    db.add(executive)
    await db.flush()
    await db.refresh(executive)
    return executive


@router.get("/{exec_id}", response_model=ExecutiveOut)
async def get_executive(exec_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _get_owned_executive(exec_id, user, db)


@router.patch("/{exec_id}", response_model=ExecutiveOut)
async def update_executive(
    exec_id: uuid.UUID,
    payload: ExecutiveUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    executive = await _get_owned_executive(exec_id, user, db)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(executive, field, value)
    await db.flush()
    await db.refresh(executive)
    return executive


@router.delete("/{exec_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_executive(exec_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    executive = await _get_owned_executive(exec_id, user, db)
    await db.delete(executive)


@router.post("/{exec_id}/copy", response_model=ExecutiveOut, status_code=status.HTTP_201_CREATED)
async def copy_executive(exec_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    original = await _get_owned_executive(exec_id, user, db)
    clone = VirtualExecutive(
        owner_id=user.id,
        name=f"{original.name} (Copy)",
        role=original.role,
        company=original.company,
        address=original.address,
        avatar_url=original.avatar_url,
        introduction=original.introduction,
        goals=list(original.goals),
        scopes=list(original.scopes),
        donts=list(original.donts),
        languages=list(original.languages),
        speech_style=original.speech_style,
        products_services=list(original.products_services),
        faqs=list(original.faqs),
        action_slots=list(original.action_slots),
        business_hours=dict(original.business_hours),
        timezone=original.timezone,
        extraction_schema=list(original.extraction_schema),
    )
    db.add(clone)
    await db.flush()
    await db.refresh(clone)
    return clone


@router.get("/{exec_id}/prompt-preview")
async def preview_prompt(exec_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Returns the exact system prompt that will be sent to the realtime voice model for this executive."""
    executive = await _get_owned_executive(exec_id, user, db)
    return {"system_prompt": build_system_prompt(executive)}


@router.get("/{exec_id}/jd-text", response_model=JDTextOut)
async def get_jd_text(exec_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Plain-text job description formatted from this executive's products/services — used for email and WhatsApp send."""
    executive = await _get_owned_executive(exec_id, user, db)
    return JDTextOut(text=format_jd_text(executive))


@router.post("/{exec_id}/send-jd-email", status_code=status.HTTP_204_NO_CONTENT)
async def send_jd_email(
    exec_id: uuid.UUID,
    payload: SendEmailRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    executive = await _get_owned_executive(exec_id, user, db)
    subject = f"Job Description — {executive.company}"
    body = format_jd_text(executive)
    try:
        send_email(payload.to_email, subject, body)
    except EmailNotConfigured as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    except Exception as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Failed to send email: {e}")
