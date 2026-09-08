"""WebSocket route the admin panel's browser mic connects to for a live voice chat with an executive."""
from fastapi import APIRouter, WebSocket

from app.services.voice_chat_orchestrator import handle_voice_chat

router = APIRouter()


@router.websocket("/ws/voice-chat/{executive_id}")
async def voice_chat(
    websocket: WebSocket,
    executive_id: str,
    caller_name: str = "Candidate",
    caller_phone: str | None = None,
    caller_email: str | None = None,
    agent_name: str | None = None,
    language: str | None = "English",
    state: str | None = None,
):
    """Caller identity, language, and agent persona name come in as query params (?caller_name=...&agent_name=...)."""
    await handle_voice_chat(
        websocket=websocket,
        executive_id=executive_id,
        caller_name=caller_name,
        caller_phone=caller_phone,
        caller_email=caller_email,
        agent_name=agent_name,
        language=language,
        state=state,
    )
