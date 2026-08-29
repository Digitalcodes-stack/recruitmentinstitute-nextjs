"""WebSocket route the admin panel's browser mic connects to for a live voice chat with an executive."""
from fastapi import APIRouter, WebSocket

from app.services.voice_chat_orchestrator import handle_voice_chat

router = APIRouter()


@router.websocket("/ws/voice-chat/{executive_id}")
async def voice_chat(
    websocket: WebSocket,
    executive_id: str,
    caller_name: str = "Unknown caller",
    caller_phone: str | None = None,
    caller_email: str | None = None,
):
    """Caller identity comes in as query params (?caller_name=...), captured by the
    admin panel's Talk modal before opening the mic connection."""
    await handle_voice_chat(websocket, executive_id, caller_name, caller_phone, caller_email)
