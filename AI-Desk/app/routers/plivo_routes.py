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
from app.services.whatsapp_service import send_whatsapp_admin_alert, send_candidate_whatsapp, normalize_whatsapp_phone

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
    email: Optional[str] = Field(None, max_length=150, description="Caller's email address")
    language: Optional[str] = Field("English", max_length=50, description="Preferred language")
    state: Optional[str] = Field(None, max_length=100, description="State / Location")
    preferred_course: Optional[str] = Field(None, max_length=150, description="Course or role of interest")
    counselor_name: Optional[str] = Field("Pooja Kulkarni", max_length=100, description="Assigned counselor name")
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
    counselor_assigned = payload.counselor_name or "Pooja Kulkarni"
    _CALL_STORE[call_id] = {
        "call_id": call_id,
        "caller_name": clean_name,
        "caller_phone": formatted_phone,
        "caller_email": payload.email.strip() if payload.email else "",
        "language": payload.language or "English",
        "state": payload.state or "",
        "counselor_name": counselor_assigned,
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
            language=payload.language or "English",
        )
        _send_call_request_alert(clean_name, formatted_phone, payload.preferred_course or "", exec_name, call_id)
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
    if query_params.get("language"):
        meta["language"] = query_params.get("language")
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
        _send_hangup_alert(call_id, hangup_cause, str(call_duration), str(call_status))
        _send_candidate_post_call_details(_CALL_STORE[call_id])
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
        counselor_assigned = meta.get("counselor_name") or "Pooja Kulkarni"
        company = target_exec.company or "Recruitment Institute"
        effective_language = meta.get("language", "English")
        effective_email = meta.get("caller_email", "")
        effective_state = meta.get("state", "")
        system_prompt = build_system_prompt(
            target_exec,
            agent_name=counselor_assigned,
            language=effective_language,
            caller_name=effective_name,
            caller_phone=effective_phone,
            caller_email=effective_email,
            caller_state=effective_state,
        )

    transcoder = PlivoAudioTranscoder(plivo_content_type="audio/x-mulaw", plivo_sample_rate=8000)
    session = VoiceChatSession(
        browser_ws=websocket,
        system_prompt=system_prompt,
        is_plivo=True,
        transcoder=transcoder,
        caller_name=effective_name,
        caller_phone=effective_phone,
        preferred_course=effective_course,
        agent_name=counselor_assigned,
        company=company,
        call_id=call_id,
        plivo_call_uuid=meta.get("plivo_call_uuid"),
        language=effective_language,
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
        _send_candidate_post_call_details(meta, conversation)
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


def _send_call_request_alert(caller_name: str, caller_phone: str, course: str, exec_name: str, call_id: str) -> None:
    admin_email = getattr(settings, "ADMIN_EMAIL", "sesasiba.es@gmail.com") or "sesasiba.es@gmail.com"
    time_str = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    subject = f"📞 Urgent Call Request: {caller_name} ({caller_phone})"
    body = (
        f"A candidate has requested an immediate call via the website widget.\n\n"
        f"Candidate Name: {caller_name}\n"
        f"Mobile Number: {caller_phone}\n"
        f"Interested Course: {course or 'HR & Recruitment Training'}\n"
        f"Assigned Executive: {exec_name}\n"
        f"Plivo Caller ID: {settings.PLIVO_PHONE_NUMBER}\n"
        f"Call ID: {call_id}\n"
        f"Time: {time_str} UTC\n\n"
        f"Call directly: tel:{caller_phone}\n"
        f"WhatsApp: https://wa.me/{caller_phone.replace('+', '')}\n"
    )
    try:
        send_email(admin_email, subject, body)
        logger.info("Immediate call request email dispatched for %s (%s)", caller_name, caller_phone)
    except Exception as exc:
        logger.warning("Could not dispatch call request alert email: %s", exc)


def _send_hangup_alert(call_id: str, hangup_cause: str, call_duration: str, call_status: str) -> None:
    meta = _CALL_STORE.get(call_id, {})
    caller_name = meta.get("caller_name", "Candidate")
    caller_phone = meta.get("caller_phone", "Unknown")
    course = meta.get("preferred_course", "HR Training")
    admin_email = getattr(settings, "ADMIN_EMAIL", "sesasiba.es@gmail.com") or "sesasiba.es@gmail.com"
    time_str = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    subject = f"📴 Call Ended: {caller_name} ({caller_phone}) — Duration: {call_duration}s ({hangup_cause})"
    body = (
        f"Phone Call Status Summary:\n\n"
        f"Candidate Name: {caller_name}\n"
        f"Mobile Number: {caller_phone}\n"
        f"Interested Course: {course}\n"
        f"Call Duration: {call_duration} seconds\n"
        f"Hangup Cause: {hangup_cause}\n"
        f"Call Status: {call_status}\n"
        f"Call ID: {call_id}\n"
        f"Time: {time_str} UTC\n\n"
        f"Follow up directly: tel:{caller_phone}\n"
        f"WhatsApp: https://wa.me/{caller_phone.replace('+', '')}\n"
    )
    try:
        send_email(admin_email, subject, body)
        logger.info("Call hangup alert email dispatched for %s (%s)", caller_name, caller_phone)
    except Exception as exc:
        logger.warning("Could not dispatch hangup alert email: %s", exc)


def render_candidate_post_call_html(
    caller_name: str,
    counselor_name: str,
    recipient_email: str,
    program_title: str = "End-to-End Practical Recruitment & HR Operations Program",
    slot_booked: Optional[str] = None,
    notes: Optional[str] = None,
) -> str:
    clean_name = (caller_name or "Candidate").strip()
    counselor = counselor_name or "Pooja Kulkarni"

    slot_html = ""
    if slot_booked:
        slot_html = f"""
        <div style="margin-top: 14px; padding: 12px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #065f46; margin-bottom: 2px;">
            📅 Confirmed Demo / Consultation Session
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #047857;">
            {slot_booked}
          </div>
          <div style="font-size: 12px; color: #065f46; margin-top: 2px;">
            Meeting invitation and link will be sent prior to the session.
          </div>
        </div>
        """

    notes_html = ""
    if notes:
        notes_html = f"""
        <div style="margin-top: 12px; padding: 12px 16px; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 2px;">
            📝 Discussion Notes
          </div>
          <div style="font-size: 13px; color: #334155; line-height: 1.5;">
            {notes}
          </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Details & Next Steps — Recruitment Institute</title>
  <style>
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
    body {{ margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    @media only screen and (max-width: 600px) {{
      .email-wrapper {{ padding: 12px !important; }}
      .email-card {{ width: 100% !important; border-radius: 8px !important; }}
      .header-cell {{ padding: 24px 20px !important; }}
      .content-cell {{ padding: 24px 18px !important; }}
      .btn-stack {{ display: block !important; width: 100% !important; margin-bottom: 10px !important; margin-right: 0 !important; box-sizing: border-box !important; text-align: center !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" class="email-wrapper" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="email-card" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);">
          <tr>
            <td align="center" bgcolor="#0b192c" class="header-cell" style="background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%); background-color: #0b192c; padding: 36px 32px 30px 32px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">
                      RECRUITMENT INSTITUTE
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.3; margin-bottom: 10px;">
                      Career Counselling &amp; Next Steps
                    </div>
                    <div style="display: inline-block; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background-color: rgba(255, 255, 255, 0.12); color: #f0fdf4; border: 1px solid rgba(255, 255, 255, 0.25);">
                      Official Admissions Desk • Pune Academy
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content-cell" style="padding: 32px 32px 24px 32px; background-color: #ffffff;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                Dear {clean_name},
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                Thank you for speaking with me today. It was a pleasure discussing your background and learning more about your career goals in Talent Acquisition and Human Resources.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #334155;">
                As promised during our consultation call, here is your comprehensive consultation summary, core curriculum highlights, and actionable next steps for the <strong>{program_title}</strong>.
              </p>

              <!-- Program Snapshot Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 22px; border-left: 4px solid #1e40af; border-radius: 10px 0 0 10px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #1e40af; margin-bottom: 4px;">
                      CONSULTATION SNAPSHOT
                    </div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.2px;">
                      {program_title}
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; width: 36%; font-weight: 600; color: #64748b;">Assigned Counsellor:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{counselor} (Senior Career Counsellor)</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Training Format:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">Live Interactive Online &amp; Pune Classroom</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Batch Schedules:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">Flexible Weekday Evening &amp; Weekend Batches</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-weight: 600; color: #64748b;">Placement Support:</td>
                        <td style="padding: 4px 0; font-weight: 700; color: #059669;">100% Dedicated Assistance with 500+ Hiring Partners</td>
                      </tr>
                    </table>
                    {slot_html}
                    {notes_html}
                  </td>
                </tr>
              </table>

              <!-- Section: Curriculum Highlights -->
              <div style="margin-bottom: 28px;">
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.3px;">
                  📚 Core Curriculum Highlights
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        🔍 Live Portal Mastery (LinkedIn Recruiter &amp; Naukri)
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Hands-on candidate sourcing on live job portals. Master keyword search, advanced filters, candidate outreach messaging, and recruitment analytics.
                      </div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        ⚡ Advanced Boolean Sourcing &amp; Talent Mapping
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Formulate high-precision search strings (AND, OR, NOT, X-Ray) to uncover hidden, passive candidate pools across Google and GitHub.
                      </div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        📋 Full ATS Lifecycle &amp; Salary Negotiation
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        End-to-end recruitment management: resume screening, structured interview coordination, CTC benchmarking, and counter-offer handling.
                      </div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        ⚖️ HR Operations, Compliance &amp; Payroll Basics
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        Core operational HR skills: statutory compliances (PF, ESIC, Gratuity, Bonus), payroll structures, and standard onboarding documentation.
                      </div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                        🎯 100% Dedicated Placement Assistance
                      </div>
                      <div style="font-size: 13px; line-height: 1.5; color: #475569;">
                        One-on-one resume overhaul, LinkedIn profile makeover, rigorous mock interviews with Senior HR Directors, and direct hiring partner referrals.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Section: Recommended Next Steps -->
              <div style="margin-bottom: 30px;">
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.3px;">
                  🚀 Recommended Next Steps
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">1</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Review the Full Curriculum &amp; Batch Schedules</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Explore week-by-week practical projects, module breakdowns, and real recruiter case studies.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">2</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Select Your Preferred Batch Timing</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Choose Weekday evening sessions (Mon–Fri 1 hr) or intensive Weekend batches (Sat–Sun 2 hrs).
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 26px; vertical-align: top;">
                            <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #1e40af; color: #ffffff; font-size: 12px; font-weight: 800; text-align: center; line-height: 22px;">3</div>
                          </td>
                          <td style="padding-left: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: #1e3a8a;">Attend Your Free Live Demo Session</div>
                            <div style="font-size: 13px; color: #2563eb; margin-top: 2px;">
                              Join our practical walkthrough session, interact with our mentor, and get your questions answered.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Interactive CTA Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="https://recruitmentinstitute.in/courses" target="_blank" class="btn-stack" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); background-color: #1e40af; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25); margin-right: 10px; margin-bottom: 8px;">
                      📚 Explore Full Syllabus &amp; Curriculum →
                    </a>
                    <a href="tel:917385204165" class="btn-stack" style="display: inline-block; background-color: #f8fafc; color: #0f172a; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 22px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 8px;">
                      📞 Call Helpline: +91 7385204165
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Counsellor Sign-off Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 12px;">
                <tr>
                  <td>
                    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
                      If you have any questions regarding batch timings, fee installments, or career transitions, feel free to reply directly to this email or reach out to our team anytime.
                    </div>
                    <div style="font-size: 14px; color: #475569;">Warm regards,</div>
                    <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">{counselor}</div>
                    <div style="font-size: 13px; font-weight: 600; color: #1e40af;">Senior Career Counsellor &amp; Admissions Advisor</div>
                    <div style="font-size: 13px; color: #64748b;">Recruitment Institute, Pune, India</div>

                    <div style="margin-top: 16px; padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #475569;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding: 3px 0; width: 34%; font-weight: 600; color: #64748b;">Direct Helpline:</td>
                          <td style="padding: 3px 0;"><a href="tel:917385204165" style="color: #1e40af; text-decoration: none; font-weight: 700;">+91 7385204165</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; font-weight: 600; color: #64748b;">Admissions Email:</td>
                          <td style="padding: 3px 0;"><a href="mailto:support@recruitmentinstitute.in" style="color: #1e40af; text-decoration: none; font-weight: 700;">support@recruitmentinstitute.in</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; font-weight: 600; color: #64748b;">Official Portal:</td>
                          <td style="padding: 3px 0;"><a href="https://recruitmentinstitute.in" target="_blank" style="color: #1e40af; text-decoration: none; font-weight: 700;">recruitmentinstitute.in</a></td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; border-radius: 0 0 12px 12px; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
                RECRUITMENT INSTITUTE • PUNE, MAHARASHTRA, INDIA
              </div>
              <div style="font-size: 11px; line-height: 1.6; color: #94a3b8; max-width: 520px; margin: 0 auto;">
                This official consultation summary was sent to <strong>{recipient_email}</strong> following your career counselling phone session. 
                Please save this email for your batch registration and enrollment records.
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 12px;">
                © 2026 Recruitment Institute. All rights reserved.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


_DISPATCHED_POST_CALL = set()


def _send_candidate_post_call_details(meta: dict, conversation: Optional[Conversation] = None) -> None:
    call_id = meta.get("call_id") or (str(conversation.id) if conversation else None)
    if call_id and call_id in _DISPATCHED_POST_CALL:
        return
    if call_id:
        _DISPATCHED_POST_CALL.add(call_id)

    caller_name = (conversation.caller_name if conversation and conversation.caller_name else meta.get("caller_name")) or "Candidate"
    caller_phone = (conversation.caller_phone if conversation and conversation.caller_phone else meta.get("caller_phone")) or ""
    caller_email = (conversation.caller_email if conversation and conversation.caller_email else meta.get("caller_email")) or ""
    counselor_name = meta.get("counselor_name") or "Pooja Kulkarni"
    program_title = meta.get("preferred_course") or "End-to-End Practical Recruitment & HR Operations Training Program"

    if not caller_phone:
        return

    slot_booked = None
    notes = None
    if conversation and isinstance(conversation.extracted_data, dict):
        slot_booked = conversation.extracted_data.get("interview_slot_booked") or conversation.extracted_data.get("slot")
        notes = conversation.extracted_data.get("key_notes_for_office") or conversation.extracted_data.get("notes_for_office")

    logger.info("🚀 Triggering Post-Call Candidate Dispatch (Email only) for %s (%s)", caller_name, caller_phone)

    # 1. WhatsApp dispatch is disabled as per policy — details sent strictly via Email
    logger.info("Candidate WhatsApp dispatch skipped as per policy. Course details sent strictly via Email.")

    # 2. Candidate Email
    if caller_email and "@" in caller_email and not caller_email.endswith("@call-lead.recruitmentinstitute.in"):
        try:
            slot_email_section = f"\nCONFIRMED DEMO / INTERVIEW SESSION:\nYour session has been tentatively marked for: {slot_booked}\n" if slot_booked else ""
            subject = f"🎓 Course Details & Next Steps — {counselor_name} | Recruitment Institute"
            plain_body = (
                f"Dear {caller_name},\n\n"
                f"Thank you for speaking with {counselor_name} (Senior Career Counsellor) at Recruitment Institute.\n\n"
                f"As promised during your consultation call, here is the complete course information and next steps:\n"
                f"{slot_email_section}\n"
                f"PROGRAM: {program_title}\n\n"
                f"CORE CURRICULUM HIGHLIGHTS:\n"
                f"- Live Sourcing & Boolean search mastery on LinkedIn Recruiter and Naukri\n"
                f"- Candidate mapping, headhunting, and talent pipelining\n"
                f"- End-to-end ATS workflow, screening, interview scheduling, and salary negotiation\n"
                f"- 100% Dedicated Placement Assistance with 500+ Hiring Partners\n\n"
                f"RECOMMENDED NEXT STEPS:\n"
                f"1. Explore the complete curriculum and modules: https://recruitmentinstitute.in/courses\n"
                f"2. Access free HR knowledge guides and templates: https://recruitmentinstitute.in/knowledge\n"
                f"3. Reserve your live demo session: https://recruitmentinstitute.in/contact\n\n"
                f"If you have any questions, feel free to contact our admissions desk anytime:\n"
                f"• Counsellor: {counselor_name}\n"
                f"• Admissions Helpline: +91 7385204165\n"
                f"• Email: support@recruitmentinstitute.in\n"
                f"• Website: https://recruitmentinstitute.in\n\n"
                f"Warm regards,\n"
                f"{counselor_name}\n"
                f"Senior Career Counsellor | Recruitment Institute\n"
            )

            html_body = render_candidate_post_call_html(
                caller_name=caller_name,
                counselor_name=counselor_name,
                recipient_email=caller_email,
                program_title=program_title,
                slot_booked=slot_booked,
                notes=notes,
            )

            send_email(caller_email, subject, plain_body, html_body=html_body)
            logger.info("Candidate executive post-call HTML email dispatched to %s", caller_email)
        except Exception as exc:
            logger.warning("Failed to dispatch candidate post-call email: %s", exc)


