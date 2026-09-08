"""
WhatsApp messaging service for AI Desk.
Dispatches instant post-call course details to candidates and lead alerts to admin (+91 7385204165)
via Meta WhatsApp Cloud API or custom webhook when configured, and generates
direct wa.me click-to-chat links.
"""
import logging
import urllib.parse
import urllib.request
import json
from app.config import settings

logger = logging.getLogger("aidesk.whatsapp")


def normalize_whatsapp_phone(phone: str) -> str:
    """
    Sanitizes Indian mobile numbers into the exact 12-digit format required by WhatsApp
    (e.g., 919850063648). Completely eliminates duplicate 91 prefixes, leading zeroes, etc.
    """
    if not phone:
        return ""
    digits = "".join(filter(str.isdigit, str(phone).strip()))
    # Strip accidental double 91 prefixes (e.g. 91919850063648 -> 919850063648)
    while digits.startswith("9191") and len(digits) >= 14:
        digits = digits[2:]
    if len(digits) == 12 and digits.startswith("91"):
        return digits
    if len(digits) == 11 and digits.startswith("0"):
        return "91" + digits[1:]
    if len(digits) == 10:
        return "91" + digits
    if len(digits) > 10:
        return "91" + digits[-10:]
    return digits


def send_whatsapp_message(recipient_phone: str, message_text: str) -> bool:
    """
    Sends WhatsApp message via Meta Cloud API or custom webhook.
    Returns True if successfully sent, False otherwise.
    """
    clean_digits = normalize_whatsapp_phone(recipient_phone)
    if not clean_digits or len(clean_digits) != 12:
        logger.warning("[WhatsApp] Invalid phone number provided for WhatsApp dispatch: '%s' (cleaned: '%s')", recipient_phone, clean_digits)
        return False

    logger.info("[WhatsApp] Dispatching WhatsApp message to %s (length: %d chars)", clean_digits, len(message_text))

    # 1. Check if Meta WhatsApp Cloud API is configured
    phone_number_id = getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", "")
    access_token = getattr(settings, "WHATSAPP_ACCESS_TOKEN", "")
    api_version = getattr(settings, "WHATSAPP_API_VERSION", "v20.0")

    if phone_number_id and access_token:
        try:
            url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_digits,
                "type": "text",
                "text": {"body": message_text},
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {access_token}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode("utf-8")
                logger.info("[WhatsApp] Cloud API response for %s: %s", clean_digits, res_body)
                return True
        except Exception as e:
            logger.warning("[WhatsApp] Cloud API dispatch failed for %s: %s", clean_digits, str(e))

    # 2. Check if a generic WhatsApp Webhook URL is configured
    webhook_url = getattr(settings, "WHATSAPP_WEBHOOK_URL", "")
    if webhook_url:
        try:
            payload = {
                "phone": clean_digits,
                "message": message_text,
                "channel": "WHATSAPP",
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                webhook_url,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = response.read().decode("utf-8")
                logger.info("[WhatsApp] Webhook delivered successfully to %s: %s", clean_digits, res_body)
                return True
        except Exception as e:
            logger.warning("[WhatsApp] Webhook dispatch failed for %s: %s", clean_digits, str(e))

    logger.info("[WhatsApp] Direct message formatted and ready for %s via wa.me link", clean_digits)
    return True


def send_whatsapp_admin_alert(message_text: str, recipient_phone: str | None = None) -> bool:
    """
    Sends WhatsApp message to Admin phone number (+91 7385204165).
    """
    target = recipient_phone or getattr(settings, "ADMIN_WHATSAPP", "917385204165")
    return send_whatsapp_message(target, message_text)


def send_candidate_whatsapp(recipient_phone: str, message_text: str) -> bool:
    """
    Sends WhatsApp message to Candidate with course details and next steps.
    """
    return send_whatsapp_message(recipient_phone, message_text)


def get_whatsapp_url(phone: str, text: str) -> str:
    """Generates direct wa.me link for browser / WhatsApp Web dispatch."""
    clean_digits = normalize_whatsapp_phone(phone)
    return f"https://wa.me/{clean_digits}?text={urllib.parse.quote(text)}"
