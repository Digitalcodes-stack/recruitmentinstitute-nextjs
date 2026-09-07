"""
Plivo integration service for outbound calling and AudioStream XML generation.
"""
import logging
import re
from urllib.parse import urlencode

import plivo
from app.config import settings

logger = logging.getLogger("aidesk.plivo")


def format_e164(phone: str, default_country_code: str = "+91") -> str:
    """Sanitizes user input phone numbers into E.164 format (e.g. +919876543210)."""
    clean = re.sub(r"[^\d+]", "", phone.strip())
    if clean.startswith("+"):
        return clean
    if clean.startswith("00"):
        return "+" + clean[2:]
    if clean.startswith("0") and len(clean) == 11:
        return default_country_code + clean[1:]
    if len(clean) == 10:
        return default_country_code + clean
    if len(clean) == 12 and clean.startswith("91"):
        return "+" + clean
    return "+" + clean if not clean.startswith("+") else clean


def get_plivo_client() -> plivo.RestClient:
    """Returns an authenticated Plivo REST client."""
    if not settings.PLIVO_AUTH_ID or not settings.PLIVO_AUTH_TOKEN:
        raise ValueError(
            "PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN are not configured. Please set them in AI-Desk/.env."
        )
    return plivo.RestClient(settings.PLIVO_AUTH_ID, settings.PLIVO_AUTH_TOKEN)


def generate_stream_xml(websocket_stream_url: str, content_type: str = "audio/x-mulaw;rate=8000") -> str:
    """
    Generates exact Plivo XML instructing Plivo to open a bidirectional AudioStream
    WebSocket connection to our server.
    """
    clean_url = websocket_stream_url.strip()
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Stream bidirectional="true" keepCallAlive="true" contentType="{content_type}">
    {clean_url}
  </Stream>
</Response>"""


def trigger_outbound_call(
    to_phone: str,
    caller_name: str,
    executive_id: str,
    call_id: str,
    base_url: str | None = None,
    preferred_course: str = "",
) -> dict:
    """
    Initiates an outbound phone call to the candidate's mobile phone via Plivo.
    When the candidate picks up, Plivo triggers the answer_url which returns the
    AudioStream XML to bridge the call to Gemini Live.
    """
    client = get_plivo_client()
    formatted_to = format_e164(to_phone)
    from_number = settings.PLIVO_PHONE_NUMBER or "+912269851989"

    root_url = (base_url or settings.PUBLIC_BASE_URL or "http://localhost:8000").rstrip("/")
    query_params = {
        "call_id": call_id,
        "executive_id": executive_id,
        "name": caller_name,
        "phone": formatted_to,
        "course": preferred_course,
    }
    answer_url = f"{root_url}/api/plivo/answer?{urlencode(query_params)}"
    hangup_url = f"{root_url}/api/plivo/hangup?{urlencode(query_params)}"

    logger.info(
        "Initiating Plivo outbound call to %s (Caller: %s, From: %s, AnswerURL: %s)",
        formatted_to,
        caller_name,
        from_number,
        answer_url,
    )

    try:
        response = client.calls.create(
            from_=from_number,
            to_=formatted_to,
            answer_url=answer_url,
            answer_method="POST",
            hangup_url=hangup_url,
            hangup_method="POST",
        )
        logger.info("Plivo call initiated successfully: %s", response)
        return {
            "success": True,
            "message": "Call initiated",
            "plivo_response": response,
            "to": formatted_to,
            "from": from_number,
            "call_id": call_id,
        }
    except Exception as exc:
        logger.exception("Failed to create Plivo outbound call to %s: %s", formatted_to, exc)
        raise exc
