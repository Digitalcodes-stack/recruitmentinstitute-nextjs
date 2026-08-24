import logging
from dataclasses import dataclass
from dataclasses import field
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings
from app.core.exceptions import ServiceError
from app.services.templates import TemplateRenderer

logger = logging.getLogger(__name__)


@dataclass
class EmailService:
    renderer: TemplateRenderer = field(default_factory=TemplateRenderer)

    async def send(self, to_email: str, subject: str, template_name: str, context: dict) -> None:
        if not settings.email_enabled:
            logger.info("Email disabled (EMAIL_ENABLED=false); skipping send to=%s subject=%s", to_email, subject)
            return

        if not settings.smtp_host or not settings.smtp_from_email:
            raise ServiceError("SMTP is not configured", 503)

        msg = EmailMessage()
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = to_email
        if settings.smtp_cc_email:
            msg["Cc"] = settings.smtp_cc_email
        msg["Subject"] = subject
        html = self.renderer.render(template_name, context)
        msg.set_content("This message requires an HTML-capable email client.")
        msg.add_alternative(html, subtype="html")

        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            start_tls=settings.smtp_use_tls,
        )
