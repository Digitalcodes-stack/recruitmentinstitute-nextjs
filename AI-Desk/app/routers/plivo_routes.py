"""
Plivo routes for Instant Outbound AI Calling ("Request Call Me Now") and bidirectional AudioStream.
"""
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException, Request, Response, WebSocket, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Conversation, VirtualExecutive
from app.services.audio_transcoder import PlivoAudioTranscoder
from app.services.conversation_formatter import format_conversation_email, format_conversation_whatsapp
from app.services.email_service import EmailNotConfigured, send_email
from app.services.gemini_bridge import VoiceChatSession
from app.services.jd_formatter import format_jd_text
from app.services.plivo_service import format_e164, generate_stream_xml, trigger_outbound_call
from app.services.prompt_builder import build_system_prompt
from app.services.slot_booking import find_matching_slot
from app.services.whatsapp_service import send_whatsapp_admin_alert

logger = logging.getLogger("aidesk.plivo_routes")
# Router for HTTP webhook endpoints (/api/plivo/...)
router = APIRouter(prefix="/api/plivo", tags=["plivo"])

# Separate router mounted at root so /ws/plivo-stream/{call_id} is accessible both at root and with /api/plivo prefix
ws_router = APIRouter(tags=["plivo-stream"])

# Active in-flight call metadata store
_CALL_STORE: dict[str, dict] = {}

_EXTRACTION_INSTRUCTIONS = """\
The phone conversation has ended. Based on everything discussed, output ONLY a raw \
JSON object (no markdown, no prose) with these exact keys: interest_level \
("interested"|"not_interested"|"undecided"), disposition \
("interested"|"not_interested"|"callback_requested"|"slot_booked"|"wrong_number"|"voicemail"|"undetermined"), \
interview_slot_booked (string or null), best_callback_number (string or \
null), candidate_email (string or null), key_notes_for_office (short string), \
and any additional fields relevant to the extraction schema you were given \
in your instructions.
"""


class RequestCallbackPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Caller's full name")
    phone: str = Field(..., min_length=10, max_length=20, description="Caller's phone number")
    preferred_course: Optional[str] = Field(None, max_length=150, description="Course or role of interest")
    executive_id: Optional[str] = Field(None, description="Virtual executive ID to handle the call")


@router.post("/request-callback")
async def request_callback(payload: RequestCallbackPayload, request: Request):
    """
    Triggered when a website visitor clicks 'Call Me Now'.
    Validates input, determines the executive, and places an outbound call via Plivo.
    """
    clean_name = payload.name.strip()
    formatted_phone = format_e164(payload.phone)

    # Resolve virtual executive (use specified, or fallback to first active executive)
    async with AsyncSessionLocal() as db:
        target_exec = None
        if payload.executive_id:
            try:
                target_exec = await db.get(VirtualExecutive, uuid.UUID(payload.executive_id))
            except ValueError:
                target_exec = None

        if not target_exec:
            stmt = select(VirtualExecutive).where(VirtualExecutive.is_active == True).limit(1)
            target_exec = (await db.scalars(stmt)).first()

        if not target_exec:
            stmt_any = select(VirtualExecutive).limit(1)
            target_exec = (await db.scalars(stmt_any)).first()

        if not target_exec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No virtual executive is configured to handle calls.",
            )

        exec_id_str = str(target_exec.id)
        exec_name = target_exec.name

    call_id = str(uuid.uuid4())
    _CALL_STORE[call_id] = {
        "call_id": call_id,
        "caller_name": clean_name,
        "caller_phone": formatted_phone,
        "preferred_course": payload.preferred_course or "",
        "executive_id": exec_id_str,
        "executive_name": exec_name,
        "status": "ringing",
        "requested_at": datetime.now(timezone.utc).isoformat(),
    }

    # Determine public base URL for webhook callback
    host = request.headers.get("host", "localhost:8000")
    scheme = "https" if request.headers.get("x-forwarded-proto") == "https" or not host.startswith("localhost") else "http"
    base_url = settings.PUBLIC_BASE_URL or f"{scheme}://{host}"

    try:
        call_res = trigger_outbound_call(
            to_phone=formatted_phone,
            caller_name=clean_name,
            executive_id=exec_id_str,
            call_id=call_id,
            base_url=base_url,
            preferred_course=payload.preferred_course or "",
        )
        return {
            "success": True,
            "call_id": call_id,
            "message": f"Calling your phone ({formatted_phone}) from {settings.PLIVO_PHONE_NUMBER}... Please answer!",
            "details": call_res,
        }
    except Exception as exc:
        logger.exception("Error triggering Plivo outbound call: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to place outbound call: {str(exc)}",
        )


@router.post("/answer")
@router.get("/answer")
async def plivo_answer(request: Request):
    """
    Called by Plivo when the caller answers their phone.
    Returns Plivo XML with <Stream> pointing to our WebSocket audio bridge.
    """
    query_params = dict(request.query_params)
    form_data = {}
    try:
        form_data = dict(await request.form())
    except Exception:
        pass

    logger.info("📞 Plivo Answer Webhook invoked: query=%s, form=%s", query_params, form_data)

    call_id = query_params.get("call_id") or form_data.get("CallUUID") or str(uuid.uuid4())
    meta = _CALL_STORE.setdefault(call_id, {})

    if query_params.get("name"):
        meta["caller_name"] = query_params.get("name")
    if query_params.get("phone"):
        meta["caller_phone"] = query_params.get("phone")
    if query_params.get("course"):
        meta["preferred_course"] = query_params.get("course")
    if query_params.get("executive_id"):
        meta["executive_id"] = query_params.get("executive_id")
    if form_data.get("CallUUID"):
        meta["plivo_call_uuid"] = form_data.get("CallUUID")

    meta["status"] = "in_call"

    # Determine public host for WebSocket URL
    host = request.headers.get("host", "localhost:8000")
    if settings.PUBLIC_BASE_URL:
        clean_base = settings.PUBLIC_BASE_URL.replace("https://", "").replace("http://", "").rstrip("/")
        ws_host = clean_base
    else:
        ws_host = host

    # Public WSS URL - clean and without query params to avoid XML entity parse errors
    ws_url = f"wss://{ws_host}/ws/plivo-stream/{call_id}"

    xml_content = generate_stream_xml(ws_url, content_type="audio/x-mulaw;rate=8000")
    logger.info("✅ Returning Plivo AudioStream XML for call_id=%s:\n%s", call_id, xml_content)
    return Response(content=xml_content, media_type="application/xml")


@router.get("/call-status/{call_id}")
async def get_call_status(call_id: str):
    """
    Returns real-time call status for frontend widget polling.
    Possible status values: 'ringing', 'in_call', 'completed', 'failed'.
    """
    meta = _CALL_STORE.get(call_id)
    if not meta:
        return {"call_id": call_id, "status": "completed", "disconnected": True}

    status_val = meta.get("status", "ringing")
    disconnected = status_val in ("completed", "failed", "rejected", "hangup")
    return {
        "call_id": call_id,
        "status": status_val,
        "disconnected": disconnected,
        "duration": meta.get("duration", 0),
        "hangup_cause": meta.get("hangup_cause"),
    }


@router.post("/hangup")
@router.get("/hangup")
async def plivo_hangup(request: Request):
    """Called by Plivo when the call ends."""
    query_params = dict(request.query_params)
    form_data = {}
    try:
        form_data = dict(await request.form())
    except Exception:
        pass

    call_id = query_params.get("call_id") or form_data.get("CallUUID")
    hangup_cause = form_data.get("HangupCause") or form_data.get("hangup_cause") or "UNKNOWN"
    call_duration = form_data.get("CallDuration") or form_data.get("duration") or "0"
    call_status = form_data.get("CallStatus") or form_data.get("status") or "UNKNOWN"

    logger.info(
        "📴 Plivo Call Hangup: call_id=%s, CallUUID=%s, HangupCause=%s, Status=%s, Duration=%ss",
        call_id,
        form_data.get("CallUUID"),
        hangup_cause,
        call_status,
        call_duration,
    )
    if call_id and call_id in _CALL_STORE:
        _CALL_STORE[call_id]["status"] = "completed"
        _CALL_STORE[call_id]["hangup_cause"] = hangup_cause
        _CALL_STORE[call_id]["duration"] = call_duration
        _CALL_STORE[call_id]["ended_at"] = datetime.now(timezone.utc).isoformat()
    return Response(content='<?xml version="1.0" encoding="UTF-8"?><Response/>', media_type="application/xml")


async def handle_plivo_stream(websocket: WebSocket, call_id: str):
    """
    Core implementation of bidirectional AudioStream WebSocket opened by Plivo.
    Streams 8kHz μ-law audio to/from Gemini Live in real time.
    """
    # Accept immediately
    await websocket.accept()
    logger.info("🟢 Plivo AudioStream WebSocket ACCEPTED immediately for call_id=%s", call_id)

    meta = _CALL_STORE.get(call_id, {})
    effective_name = meta.get("caller_name", "Candidate")
    effective_phone = meta.get("caller_phone", "")
    effective_course = meta.get("preferred_course", "")
    effective_exec_id = meta.get("executive_id", "")

    logger.info(
        "Plivo AudioStream session starting: call_id=%s, caller='%s', phone='%s', course='%s'",
        call_id,
        effective_name,
        effective_phone,
        effective_course,
    )

    async with AsyncSessionLocal() as db:
        target_exec = None
        if effective_exec_id:
            try:
                target_exec = await db.get(VirtualExecutive, uuid.UUID(effective_exec_id))
            except ValueError:
                target_exec = None

        if not target_exec:
            stmt = select(VirtualExecutive).where(VirtualExecutive.is_active == True).limit(1)
            target_exec = (await db.scalars(stmt)).first()

        if not target_exec:
            logger.error("❌ No virtual executive found for Plivo stream %s", call_id)
            await websocket.close(code=1008, reason="Executive not found")
            return

        exec_uuid = target_exec.id
        exec_name = target_exec.name
        company = target_exec.company
        system_prompt = build_system_prompt(target_exec, agent_name=exec_name)

    transcoder = PlivoAudioTranscoder(plivo_content_type="audio/x-mulaw", plivo_sample_rate=8000)
    session = VoiceChatSession(
        browser_ws=websocket,
        system_prompt=system_prompt,
        is_plivo=True,
        transcoder=transcoder,
        caller_name=effective_name,
        caller_phone=effective_phone,
        preferred_course=effective_course,
        agent_name=exec_name,
        company=company,
    )

    started_at = datetime.now(timezone.utc)
    transcript: list[dict] = []
    extraction: dict = {}
    if call_id in _CALL_STORE:
        _CALL_STORE[call_id]["status"] = "in_call"

    try:
        logger.info("🎙️ Running VoiceChatSession with Gemini Live for call_id=%s...", call_id)
        transcript, extraction = await session.run(_EXTRACTION_INSTRUCTIONS)
        logger.info("✅ Plivo AudioStream session completed successfully for call_id=%s (%d turns)", call_id, len(transcript))
    except Exception as exc:
        logger.exception("❌ Plivo AudioStream session failed for call_id=%s: %s", call_id, exc)
    finally:
        if call_id in _CALL_STORE:
            _CALL_STORE[call_id]["status"] = "completed"
            _CALL_STORE[call_id]["ended_at"] = datetime.now(timezone.utc).isoformat()
        # Post-call processing & database persistence
        extracted_name = ""
        extracted_phone = ""
        extracted_email = ""
        if isinstance(extraction, dict):
            extracted_name = (extraction.get("candidate_name") or extraction.get("caller_name") or extraction.get("name") or "").strip()
            extracted_phone = (extraction.get("candidate_phone") or extraction.get("best_callback_number") or extraction.get("phone") or extraction.get("caller_phone") or "").strip()
            extracted_email = (extraction.get("candidate_email") or extraction.get("email") or extraction.get("caller_email") or "").strip()

        final_name = effective_name
        if not final_name or final_name in ("Candidate", "Caller", "Visitor", "User", ""):
            final_name = extracted_name if extracted_name else "Candidate"

        final_phone = effective_phone or (extracted_phone if extracted_phone else None)
        final_email = extracted_email if extracted_email else None

        async with AsyncSessionLocal() as db:
            conversation = Conversation(
                executive_id=exec_uuid,
                caller_name=final_name,
                caller_phone=final_phone,
                caller_email=final_email,
                transcript=transcript,
                extracted_data=extraction,
                started_at=started_at,
                ended_at=datetime.now(timezone.utc),
            )
            db.add(conversation)

            # Check and book slot if discussed
            fresh_exec = await db.get(VirtualExecutive, exec_uuid)
            slot_text = None
            if isinstance(extraction, dict):
                slot_text = extraction.get("interview_slot_booked") or extraction.get("slot") or extraction.get("booked_slot")

            if slot_text and fresh_exec:
                match = find_matching_slot(fresh_exec.action_slots, str(slot_text))
                if match:
                    updated_slots = []
                    for s in (fresh_exec.action_slots or []):
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
                    fresh_exec.action_slots = updated_slots
                    logger.info("Marked slot booked on phone call for caller %s: %s", final_name, match.get("label"))

            await db.commit()
            await db.refresh(conversation)

        logger.info("Plivo call saved for call_id=%s (%d transcript turns)", call_id, len(transcript))

        # Dispatches Admin alerts & followups
        _send_admin_copy(conversation)
        _send_admin_whatsapp(conversation)
        if fresh_exec:
            _maybe_send_jd_to_caller(conversation, fresh_exec, extraction)


@ws_router.websocket("/ws/plivo-stream/{call_id}")
async def plivo_stream_ws_root(websocket: WebSocket, call_id: str):
    """Primary WebSocket endpoint for Plivo AudioStream at /ws/plivo-stream/{call_id}."""
    await handle_plivo_stream(websocket, call_id)


@router.websocket("/ws/plivo-stream/{call_id}")
async def plivo_stream_ws_prefixed(websocket: WebSocket, call_id: str):
    """Fallback WebSocket endpoint at /api/plivo/ws/plivo-stream/{call_id}."""
    await handle_plivo_stream(websocket, call_id)


def _send_admin_copy(conversation: Conversation) -> None:
    admin_email = getattr(settings, "ADMIN_EMAIL", "sesasiba.es@gmail.com") or "sesasiba.es@gmail.com"
    try:
        subject, body = format_conversation_email(conversation)
        send_email(admin_email, f"[Phone Call] {subject}", body)
        logger.info("Admin copy email dispatched for phone conversation %s", conversation.id)
    except EmailNotConfigured:
        logger.warning("ADMIN_EMAIL is set but SMTP is not configured — skipping admin copy")
    except Exception:
        logger.exception("Failed to send admin copy for conversation %s", conversation.id)


def _send_admin_whatsapp(conversation: Conversation) -> None:
    admin_whatsapp = getattr(settings, "ADMIN_WHATSAPP", "917385204165") or "917385204165"
    try:
        message_text = f"📞 *New Inbound/Outbound Phone Call with AI Desk*\n\n" + format_conversation_whatsapp(conversation)
        send_whatsapp_admin_alert(message_text, recipient_phone=admin_whatsapp)
        logger.info("Admin WhatsApp alert sent for phone conversation %s", conversation.id)
    except Exception:
        logger.exception("Failed to send admin WhatsApp alert for conversation %s", conversation.id)


def _maybe_send_jd_to_caller(conversation: Conversation, executive: VirtualExecutive, extraction: dict) -> None:
    if not isinstance(extraction, dict):
        return
    disposition = extraction.get("disposition")
    if disposition not in {"interested", "slot_booked"}:
        return
    if not conversation.caller_email:
        return
    try:
        subject = f"Course Curriculum & Details — {executive.company}"
        body = format_jd_text(executive)
        send_email(conversation.caller_email, subject, body)
        logger.info("Auto-sent JD to phone caller %s <%s>", conversation.caller_name, conversation.caller_email)
    except Exception:
        logger.exception("Failed to auto-send JD to phone caller for conversation %s", conversation.id)
