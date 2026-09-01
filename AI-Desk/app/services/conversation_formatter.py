"""
Formats a Conversation's transcript + extracted data into:
1. High-priority Admin Email Alert with candidate details, key notes, booked slots, and turn-by-turn dialogue.
2. Formatted WhatsApp Message for Admin phone (+91 7385204165).
"""
from typing import TYPE_CHECKING
from app.config import settings

if TYPE_CHECKING:
    from app.models import Conversation


def _extract_intent_bullets(conversation: "Conversation") -> list[str]:
    """Analyzes transcript turns and notes to extract structured candidate inquiries."""
    turns = conversation.transcript or []
    full_text = " ".join(t.get("text", "") for t in turns).lower()
    if isinstance(conversation.extracted_data, dict):
        full_text += " " + str(conversation.extracted_data.get("key_notes_for_office", "")).lower()

    bullets = []
    if any(k in full_text for k in ["recruitment", "boolean", "sourcing", "talent acquisition", "headhunt", "ats"]):
        bullets.append("🎓 Course Focus: End-to-End Recruitment & Talent Acquisition")
    if any(k in full_text for k in ["payroll", "generalist", "statutory", "pf", "esic", "compliance", "labor law"]):
        bullets.append("📘 Course Focus: HR Generalist & Payroll Operations")
    if any(k in full_text for k in ["entrepreneur", "agency", "consultancy", "start business", "client"]):
        bullets.append("🚀 Course Focus: HR Entrepreneurship & Agency Setup")
    if any(k in full_text for k in ["fee", "cost", "price", "how much", "discount", "charge", "rupees", "₹"]):
        bullets.append("💰 Commercials: Inquired about Course Fees & Discounts")
    if any(k in full_text for k in ["weekend", "saturday", "sunday"]):
        bullets.append("📅 Batch Preference: Weekend Batch (Saturday & Sunday)")
    elif any(k in full_text for k in ["weekday", "evening", "timing", "time"]):
        bullets.append("⏰ Batch Preference: Weekday / Evening Timing")
    if any(k in full_text for k in ["placement", "job", "support", "interview", "package", "95%", "100%"]):
        bullets.append("🎯 Placement: Inquired about 95% Placement & Corporate Hiring Partners")
    if any(k in full_text for k in ["pune", "classroom", "offline", "campus", "fc road"]):
        bullets.append("🏢 Learning Mode: Pune Classroom Training")
    elif any(k in full_text for k in ["online", "zoom", "live class", "remote"]):
        bullets.append("💻 Learning Mode: Live Online Interactive Batches")
    if any(k in full_text for k in ["demo", "trial", "free class", "counselling"]):
        bullets.append("🎟️ Demo Session: Inquired / Requested Free Demo Class")

    return bullets


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

    bullets = _extract_intent_bullets(conversation)

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
        "  EXACT CANDIDATE INQUIRIES & DEMANDS (AI EXTRACTED)",
        "------------------------------------------------------------",
    ]

    if bullets:
        for b in bullets:
            lines.append(f"  • {b}")
    else:
        lines.append("  • General Course & Admissions Consultation")

    lines += [
        "",
        "------------------------------------------------------------",
        "  EXECUTIVE ADMISSIONS SUMMARY",
        "------------------------------------------------------------",
        f"🎯 Disposition:        {disp or 'Recorded / High Interest'}",
        f"📅 Demo / Slot Booked: {slot or 'None'}",
        f"🎓 Preferred Program:  {pref_course or 'General Enquiry'}",
        f"📝 Admissions Notes:   {notes or 'Live spoken consultation recorded with Priya.'}",
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

    bullets = _extract_intent_bullets(conversation)
    bullets_formatted = "\n".join(f"• {b}" for b in bullets) if bullets else "• General Admissions Consultation"

    clean_candidate_phone = "".join(filter(str.isdigit, conversation.caller_phone or ""))
    if clean_candidate_phone and not clean_candidate_phone.startswith("91") and len(clean_candidate_phone) == 10:
        clean_candidate_phone = "91" + clean_candidate_phone
    wa_direct = f"https://wa.me/{clean_candidate_phone}" if clean_candidate_phone else ""

    # Build candidate quotes
    candidate_quotes = []
    if conversation.transcript:
        for t in conversation.transcript:
            if t.get("role") in ("caller", "user") and len(t.get("text", "").strip()) > 8:
                candidate_quotes.append(f"💬 _\"{t.get('text').strip()}\"_")
                if len(candidate_quotes) >= 2:
                    break
    quotes_str = "\n".join(candidate_quotes)

    # Build last turns snippet
    transcript_snippet = ""
    if conversation.transcript:
        turns = conversation.transcript[-3:]
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
🎯 *Disposition:* {disp.upper()}
📅 *Booked Slot:* {slot}

🎯 *EXACT CANDIDATE INQUIRIES & DEMANDS:*
{bullets_formatted}

{f'*CANDIDATE SPOKEN WORDS:*\n{quotes_str}\n' if quotes_str else ''}{f'📝 *Office Notes:* {notes}\n' if notes != 'None' else ''}
{f'💬 *Direct WhatsApp Candidate:* {wa_direct}' if wa_direct else ''}
🔗 *Admin Portal:* https://recruitmentinstitute.in/admin/contacts
━━━━━━━━━━━━━━━━━━━━
*Recent Dialogue:*
{transcript_snippet if transcript_snippet else '(Dialogue logged in database)'}"""

    return msg.strip()
