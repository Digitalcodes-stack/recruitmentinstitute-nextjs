"""
Sends plain-text email over SMTP (e.g. Gmail with an App Password — see
README). Uses stdlib smtplib/email only; no third-party mail SDK needed for
a single-recipient plain-text send.

Note on "receiving": Gmail SMTP is send-only — there is no inbound webhook
here. EMAIL_CC exists so an admin inbox (e.g. ADMIN_EMAIL) gets a copy of
every outgoing email and can reply-all from their own mail client; it is
not a receive/inbox integration.
"""
import logging
import smtplib
from email.message import EmailMessage

from app.config import settings

logger = logging.getLogger("aidesk.email")


class EmailNotConfigured(Exception):
    """Raised when SMTP_USER/SMTP_PASS aren't set — caller should surface a clear error, not a stack trace."""


def send_email(to_address: str, subject: str, body: str) -> None:
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        raise EmailNotConfigured("SMTP_USER/SMTP_PASS are not configured in .env")

    from_address = settings.EMAIL_FROM or settings.SMTP_USER
    cc_addresses = [a.strip() for a in settings.EMAIL_CC.replace(";", ",").split(",") if a.strip()]

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{from_address}>"
    message["To"] = to_address
    if cc_addresses:
        message["Cc"] = ", ".join(cc_addresses)
    message.set_content(body)

    all_recipients = [to_address] + cc_addresses

    # SMTP_SECURE=true (typically port 465) is implicit SSL from connection
    # start — SMTP_SSL, not SMTP+starttls(). Using the wrong one for the
    # port silently fails or hangs, so this branches on it explicitly
    # rather than always calling starttls().
    smtp_cls = smtplib.SMTP_SSL if settings.SMTP_SECURE else smtplib.SMTP
    with smtp_cls(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
        if not settings.SMTP_SECURE:
            smtp.starttls()
        smtp.login(settings.SMTP_USER, settings.SMTP_PASS)
        smtp.send_message(message, from_addr=from_address, to_addrs=all_recipients)

    logger.info("Sent email to %s (cc: %s): %s", to_address, cc_addresses or "-", subject)
