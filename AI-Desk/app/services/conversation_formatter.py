"""Formats a Conversation's transcript + extracted data into a plain-text email — shared by the manual send-email endpoint and the automatic admin-copy send."""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import Conversation


def format_conversation_email(conversation: "Conversation") -> tuple[str, str]:
    """Returns (subject, body) plain-text email content for a conversation."""
    subject = f"Conversation with {conversation.caller_name} — CallMate"
    lines = [
        f"Caller: {conversation.caller_name}",
        f"Phone: {conversation.caller_phone or '-'}",
        f"Email: {conversation.caller_email or '-'}",
        f"Started: {conversation.started_at}",
        "",
        "--- Transcript ---",
    ]
    if conversation.transcript:
        for turn in conversation.transcript:
            role = "Executive" if turn.get("role") == "assistant" else "Caller"
            lines.append(f"{role}: {turn.get('text', '')}")
    else:
        lines.append("(no transcript captured)")
    lines += ["", "--- Extracted Data ---"]
    if conversation.extracted_data:
        for key, value in conversation.extracted_data.items():
            if value not in (None, ""):
                lines.append(f"{key}: {value}")
    else:
        lines.append("(none)")
    return subject, "\n".join(lines)
