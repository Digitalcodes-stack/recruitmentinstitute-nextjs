"""
Orchestrates one browser voice-chat session: build the system prompt from
the executive profile, run the Gemini Live bridge until the browser
disconnects, then persist the conversation (caller identity, transcript,
structured extraction) to the database.
"""
import logging
import uuid
from datetime import datetime, timezone

from fastapi import WebSocket

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Conversation, VirtualExecutive
from app.services.conversation_formatter import format_conversation_email, format_conversation_whatsapp
from app.services.email_service import EmailNotConfigured, send_email
from app.services.whatsapp_service import send_whatsapp_admin_alert
from app.services.gemini_bridge import VoiceChatSession
from app.services.jd_formatter import format_jd_text
from app.services.prompt_builder import build_system_prompt
from app.services.slot_booking import find_matching_slot

# Dispositions that count as "real interest" for the automatic JD email —
# matches app/services/gemini_bridge.py's extraction prompt's disposition enum.
_INTERESTED_DISPOSITIONS = {"interested", "slot_booked"}

logger = logging.getLogger("aidesk.voice_chat")

_EXTRACTION_INSTRUCTIONS = """\
The conversation has ended. Based on everything discussed, output ONLY a raw \
JSON object (no markdown, no prose) with these exact keys: interest_level \
("interested"|"not_interested"|"undecided"), disposition \
("interested"|"not_interested"|"callback_requested"|"slot_booked"|"wrong_number"|"voicemail"|"undetermined"), \
interview_slot_booked (string or null), best_callback_number (string or \
null), candidate_email (string or null), key_notes_for_office (short string), \
and any additional fields relevant to the extraction schema you were given \
in your instructions.
"""


async def handle_voice_chat(
    websocket: WebSocket,
    executive_id: str,
    caller_name: str,
    caller_phone: str | None,
    caller_email: str | None,
    agent_name: str | None = None,
):
    """Entry point for the /ws/voice-chat/{executive_id} WebSocket route."""
    await websocket.accept()

    async with AsyncSessionLocal() as db:
        try:
            executive = await db.get(VirtualExecutive, uuid.UUID(executive_id))
        except ValueError:
            executive = None
        if not executive:
            logger.error("Voice chat opened for unknown executive_id=%s", executive_id)
            await websocket.close(code=4004, reason="Executive not found")
            return
        effective_name = agent_name or executive.name
        system_prompt = build_system_prompt(executive, agent_name=effective_name)

    started_at = datetime.now(timezone.utc)
    session = VoiceChatSession(websocket, system_prompt, agent_name=effective_name, company=executive.company)
    transcript: list[dict] = []
    extraction: dict = {}
    try:
        transcript, extraction = await session.run(_EXTRACTION_INSTRUCTIONS)
    except Exception:
        logger.exception("Voice chat bridge failed for executive_id=%s", executive_id)
    finally:
        extracted_name = ""
        extracted_phone = ""
        extracted_email = ""
        if isinstance(extraction, dict):
            extracted_name = (extraction.get("candidate_name") or extraction.get("caller_name") or extraction.get("name") or "").strip()
            extracted_phone = (extraction.get("candidate_phone") or extraction.get("best_callback_number") or extraction.get("phone") or extraction.get("caller_phone") or "").strip()
            extracted_email = (extraction.get("candidate_email") or extraction.get("email") or extraction.get("caller_email") or "").strip()

        final_name = caller_name
        if not final_name or final_name in ("Candidate", "Caller", "Visitor", "User", ""):
            final_name = extracted_name if extracted_name else "Candidate"

        final_phone = caller_phone or (extracted_phone if extracted_phone else None)
        final_email = caller_email or (extracted_email if extracted_email else None)

        async with AsyncSessionLocal() as db:
            conversation = Conversation(
                executive_id=uuid.UUID(executive_id),
                caller_name=final_name,
                caller_phone=final_phone,
                caller_email=final_email,
                transcript=transcript,
                extracted_data=extraction,
                started_at=started_at,
                ended_at=datetime.now(timezone.utc),
            )
            db.add(conversation)

            # Re-fetch the executive fresh (not the copy loaded at the top of
            # this function, which may be stale) — needed below for both the
            # slot-booking update and the automatic JD email.
            executive = await db.get(VirtualExecutive, uuid.UUID(executive_id))

            # If the model reported a booked slot, mark the matching slot on
            # the executive's profile as booked with candidate details so it isn't offered to the
            # next caller.
            slot_text = None
            if isinstance(extraction, dict):
                slot_text = extraction.get("interview_slot_booked") or extraction.get("slot") or extraction.get("booked_slot")

            if slot_text and executive:
                match = find_matching_slot(executive.action_slots, str(slot_text))
                if match:
                    updated_slots = []
                    for s in (executive.action_slots or []):
                        if s is match or (s.get("label") == match.get("label") and s.get("date") == match.get("date")):
                            updated_slots.append({
                                **s,
                                "is_booked": True,
                                "booked_by_name": final_name,
                                "booked_by_phone": final_phone or "",
                                "booked_by_email": final_email or "",
                                "booked_at": datetime.now(timezone.utc).isoformat(),
                                "conversation_id": str(conversation.id),
                            })
                        else:
                            updated_slots.append(s)
                    executive.action_slots = updated_slots
                    logger.info(
                        "Marked slot booked for executive_id=%s: %s (caller=%s, matched from %r)",
                        executive_id, match.get("label"), final_name, slot_text,
                    )

            await db.commit()
            await db.refresh(conversation)

        logger.info(
            "Voice chat saved for executive_id=%s caller=%r: %d transcript entries",
            executive_id, caller_name, len(transcript),
        )

        _send_admin_copy(conversation)
        _send_admin_whatsapp(conversation)
        if executive:
            _maybe_send_jd_to_caller(conversation, executive, extraction)


def _send_admin_copy(conversation: Conversation) -> None:
    """Auto-emails every conversation's transcript + extracted data to ADMIN_EMAIL. Best-effort — never blocks or breaks the save."""
    admin_email = getattr(settings, "ADMIN_EMAIL", "sesasiba.es@gmail.com") or "sesasiba.es@gmail.com"
    try:
        subject, body = format_conversation_email(conversation)
        send_email(admin_email, subject, body)
        logger.info("Admin copy email dispatched successfully to %s for conversation %s", admin_email, conversation.id)
    except EmailNotConfigured:
        logger.warning("ADMIN_EMAIL is set but SMTP is not configured — skipping admin copy")
    except Exception:
        logger.exception("Failed to send admin copy for conversation %s", conversation.id)


def _send_admin_whatsapp(conversation: Conversation) -> None:
    """Dispatches real-time WhatsApp alert with full lead details & transcript summary to Admin (+91 7385204165)."""
    admin_whatsapp = getattr(settings, "ADMIN_WHATSAPP", "917385204165") or "917385204165"
    try:
        message_text = format_conversation_whatsapp(conversation)
        send_whatsapp_admin_alert(message_text, recipient_phone=admin_whatsapp)
        logger.info("Admin WhatsApp alert sent to %s for conversation %s", admin_whatsapp, conversation.id)
    except Exception:
        logger.exception("Failed to send admin WhatsApp alert for conversation %s", conversation.id)


def _maybe_send_jd_to_caller(conversation: Conversation, executive: VirtualExecutive, extraction: dict) -> None:
    """
    Auto-emails the executive's JD to the caller when the extraction shows
    real interest (interested / slot_booked) and an email is on file.
    Best-effort — never blocks or breaks the save.
    """
    if not isinstance(extraction, dict):
        return
    disposition = extraction.get("disposition")
    if disposition not in _INTERESTED_DISPOSITIONS:
        return
    if not conversation.caller_email:
        logger.info("Caller %s showed interest but gave no email — skipping auto JD send", conversation.caller_name)
        return
    try:
        subject = f"Job Description — {executive.company}"
        body = format_jd_text(executive)
        send_email(conversation.caller_email, subject, body)
        logger.info("Auto-sent JD to interested caller %s <%s>", conversation.caller_name, conversation.caller_email)
    except EmailNotConfigured:
        logger.warning("Caller %s showed interest but SMTP is not configured — skipping auto JD send", conversation.caller_name)
    except Exception:
        logger.exception("Failed to auto-send JD to caller for conversation %s", conversation.id)
