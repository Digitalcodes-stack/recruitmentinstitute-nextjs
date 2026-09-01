"""
WhatsApp messaging service for AI Desk.
Dispatches instant lead alerts to the admin WhatsApp number (+91 7385204165)
via Meta WhatsApp Cloud API or custom webhook when configured, and generates
direct wa.me click-to-chat links.
"""
import logging
import urllib.parse
import urllib.request
import json
from app.config import settings

logger = logging.getLogger("aidesk.whatsapp")


def send_whatsapp_admin_alert(message_text: str, recipient_phone: str | None = None) -> bool:
    """
    Sends WhatsApp message to Admin phone number (+91 7385204165).
    Best-effort execution — logs details and never blocks or fails conversation save.
    """
    target_phone = recipient_phone or getattr(settings, "ADMIN_WHATSAPP", "917385204165")
    # Clean phone digits
    clean_digits = "".join(filter(str.isdigit, target_phone))
    if not clean_digits.startswith("91") and len(clean_digits) == 10:
        clean_digits = "91" + clean_digits

    logger.info("Triggering Admin WhatsApp Notification to %s", clean_digits)

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
            with urllib.request.urlopen(req, timeout=10) as response:
                res_body = response.read().decode("utf-8")
                logger.info("WhatsApp Cloud API response for admin alert: %s", res_body)
                return True
        except Exception as e:
            logger.warning("WhatsApp Cloud API dispatch failed: %s", str(e))

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
            with urllib.request.urlopen(req, timeout=10) as response:
                logger.info("WhatsApp Webhook delivered successfully")
                return True
        except Exception as e:
            logger.warning("WhatsApp Webhook dispatch failed: %s", str(e))

    logger.info("Admin WhatsApp alert formatted & ready for phone %s: %s", clean_digits, message_text[:120])
    return True


def get_whatsapp_url(phone: str, text: str) -> str:
    """Generates direct wa.me link for browser / WhatsApp Web dispatch."""
    clean_digits = "".join(filter(str.isdigit, phone))
    if not clean_digits.startswith("91") and len(clean_digits) == 10:
        clean_digits = "91" + clean_digits
    return f"https://wa.me/{clean_digits}?text={urllib.parse.quote(text)}"
