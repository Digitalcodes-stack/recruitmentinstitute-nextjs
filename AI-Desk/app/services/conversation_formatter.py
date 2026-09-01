"""
Formats a Conversation's transcript + extracted data into:
1. High-priority Admin Email Alert with candidate details, key notes, booked slots, and turn-by-turn dialogue.
2. Formatted WhatsApp Message for Admin phone (+91 7385204165).
"""
from typing import TYPE_CHECKING
from app.config import settings

if TYPE_CHECKING:
    from app.models import Conversation


def format_conversation_email(conversation: "Conversation") -> tuple[str, str]:
    """Returns (subject, body) formatted email content for admin notifications."""
    caller = conversation.caller_name or "Candidate"
    disp = ""
    slot = ""
    notes = ""
    pref_course = ""
    
    if isinstance(conversation.extracted_data, dict):
        disp = conversation.extracted_data.get("disposition") or conversation.extracted_data.get("interest_level") or ""
        slot = conversation.extracted_data.get("interview_slot_booked") or conversation.extracted_data.get("slot") or ""
        notes = conversation.extracted_data.get("key_notes_for_office") or conversation.extracted_data.get("notes") or ""
        pref_course = conversation.extracted_data.get("preferred_course") or conversation.extracted_data.get("course") or ""

    status_tag = f"[{disp.upper()}]" if disp else "[NEW LEAD]"
    subject = f"🎯 {status_tag} Voice AI Lead Alert: {caller} — Recruitment Institute"

    clean_phone = "".join(filter(str.isdigit, conversation.caller_phone or ""))
    if clean_phone and not clean_phone.startswith("91") and len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
    wa_link = f"https://wa.me/{clean_phone}" if clean_phone else "N/A"

    lines = [
        "============================================================",
        "  RECRUITMENT INSTITUTE — VOICE AI ADMISSIONS LEAD REPORT",
        "============================================================",
        "",
        f"👤 Candidate Name:     {caller}",
        f"📞 Phone / WhatsApp:   {conversation.caller_phone or '-'}",
        f"✉️ Email Address:      {conversation.caller_email or '-'}",
        f"🤖 AI Counsellor:      Priya (Senior Career Counsellor)",
        f"⏱️ Call Started:       {conversation.started_at.strftime('%Y-%m-%d %H:%M:%S UTC') if conversation.started_at else '-'}",
        f"🏁 Call Ended:         {conversation.ended_at.strftime('%Y-%m-%d %H:%M:%S UTC') if conversation.ended_at else '-'}",
        "",
        "------------------------------------------------------------",
        "  EXECUTIVE ADMISSIONS SUMMARY",
        "------------------------------------------------------------",
        f"🎯 Disposition:        {disp or 'Recorded'}",
        f"📅 Demo / Slot Booked: {slot or 'None'}",
        f"🎓 Preferred Program:  {pref_course or 'General Enquiry'}",
        f"📝 Admissions Notes:   {notes or 'None'}",
        f"💬 1-Click WhatsApp:   {wa_link}",
        f"🔗 Admin Portal:       https://recruitmentinstitute.in/admin/contacts",
        "",
        "------------------------------------------------------------",
        "  FULL CALL TRANSCRIPT (VERBATIM DIALOGUE)",
        "------------------------------------------------------------",
    ]

    if conversation.transcript:
        for idx, turn in enumerate(conversation.transcript, 1):
            role = "Priya (Counsellor)" if turn.get("role") == "assistant" else f"{caller} (Candidate)"
            lines.append(f"[{idx}] {role}:")
            lines.append(f"    {turn.get('text', '')}")
            lines.append("")
    else:
        lines.append("(No transcript dialogue captured)")
        lines.append("")

    lines += [
        "------------------------------------------------------------",
        "  STRUCTURED TELEMETRY DATA",
        "------------------------------------------------------------",
    ]
    if conversation.extracted_data:
        for key, value in conversation.extracted_data.items():
            if value not in (None, ""):
                lines.append(f"  • {key}: {value}")
    else:
        lines.append("  (None)")

    lines += [
        "",
        "============================================================",
        "Recruitment Institute Enterprise Portal • Automated AI Desk",
        "Admin Recipients: sesasiba.es@gmail.com | Helpline: +91 7385204165",
        "============================================================",
    ]

    return subject, "\n".join(lines)


def format_conversation_whatsapp(conversation: "Conversation") -> str:
    """Returns formatted WhatsApp message for Admin phone (+91 7385204165)."""
    caller = conversation.caller_name or "Candidate"
    phone = conversation.caller_phone or "Not provided"
    email = conversation.caller_email or "Not provided"
    
    disp = "Recorded"
    slot = "None"
    notes = "None"
    
    if isinstance(conversation.extracted_data, dict):
        disp = conversation.extracted_data.get("disposition") or conversation.extracted_data.get("interest_level") or "Recorded"
        slot = conversation.extracted_data.get("interview_slot_booked") or conversation.extracted_data.get("slot") or "None"
        notes = conversation.extracted_data.get("key_notes_for_office") or conversation.extracted_data.get("notes") or "None"

    clean_candidate_phone = "".join(filter(str.isdigit, conversation.caller_phone or ""))
    if clean_candidate_phone and not clean_candidate_phone.startswith("91") and len(clean_candidate_phone) == 10:
        clean_candidate_phone = "91" + clean_candidate_phone
    wa_direct = f"https://wa.me/{clean_candidate_phone}" if clean_candidate_phone else ""

    # Build last 3 turns snippet
    transcript_snippet = ""
    if conversation.transcript:
        turns = conversation.transcript[-4:]
        snippet_lines = []
        for t in turns:
            r = "Priya" if t.get("role") == "assistant" else "Candidate"
            txt = t.get("text", "")[:80]
            snippet_lines.append(f"• *{r}:* {txt}")
        transcript_snippet = "\n".join(snippet_lines)

    msg = f"""🎓 *VOICE AI LEAD ALERT — Recruitment Institute*
━━━━━━━━━━━━━━━━━━━━
👤 *Candidate:* {caller}
📞 *Phone:* {phone}
✉️ *Email:* {email}
🤖 *Counsellor:* Priya (Voice AI)
🎯 *Interest:* {disp.upper()}
📅 *Booked Slot:* {slot}
📝 *Key Notes:* {notes}

{f'💬 *Direct WhatsApp Candidate:* {wa_direct}' if wa_direct else ''}
🔗 *Admin Dashboard:* https://recruitmentinstitute.in/admin/contacts
━━━━━━━━━━━━━━━━━━━━
*Transcript Snippet:*
{transcript_snippet if transcript_snippet else '(Dialogue logged in admin dashboard)'}"""

    return msg.strip()
