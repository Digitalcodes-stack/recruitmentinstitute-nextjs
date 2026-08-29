"""Conversation history: list + detail (transcript, extracted data), scoped to the caller's own executives."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Conversation, User, VirtualExecutive
from app.schemas import ConversationOut, ConversationSummary, SendEmailRequest
from app.services.conversation_formatter import format_conversation_email
from app.services.email_service import EmailNotConfigured, send_email
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


async def _get_owned_conversation(conversation_id: uuid.UUID, user: User, db: AsyncSession) -> Conversation:
    conversation = await db.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    executive = await db.get(VirtualExecutive, conversation.executive_id)
    if not executive or executive.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    return conversation


@router.get("", response_model=list[ConversationSummary])
async def list_conversations(
    executive_id: uuid.UUID | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Conversation)
        .join(VirtualExecutive, Conversation.executive_id == VirtualExecutive.id)
        .where(VirtualExecutive.owner_id == user.id)
        .order_by(Conversation.started_at.desc())
        .limit(500)
    )
    if executive_id:
        query = query.where(Conversation.executive_id == executive_id)
    result = await db.scalars(query)
    return result.all()


@router.get("/{conversation_id}", response_model=ConversationOut)
async def get_conversation(
    conversation_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    return await _get_owned_conversation(conversation_id, user, db)


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    conversation = await _get_owned_conversation(conversation_id, user, db)
    await db.delete(conversation)


@router.post("/{conversation_id}/send-email", status_code=status.HTTP_204_NO_CONTENT)
async def send_conversation_email(
    conversation_id: uuid.UUID,
    payload: SendEmailRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conversation = await _get_owned_conversation(conversation_id, user, db)
    subject, body = format_conversation_email(conversation)
    try:
        send_email(payload.to_email, subject, body)
    except EmailNotConfigured as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))
    except Exception as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Failed to send email: {e}")
