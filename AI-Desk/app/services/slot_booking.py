"""
Matches the free-text `interview_slot_booked` string from a conversation's
structured extraction (e.g. "Monday 3 PM", "2026-09-02 14:00", "Saturday at
11 AM", "Today at 4 PM", "Tomorrow at 11:30 AM") against an executive's
action_slots, so the matched slot can be marked booked and NOT offered to any
future caller.
"""
import re
from datetime import date as date_cls

_WEEKDAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def find_matching_slot(action_slots: list[dict], booked_text: str | None) -> dict | None:
    """Returns the first unbooked slot whose date/weekday+time/label matches booked_text, or None."""
    if not booked_text:
        return None
    normalized = booked_text.lower().strip()
    if not normalized or normalized in ("null", "none", "n/a", "no", "false"):
        return None

    # Step 1: Direct match against unbooked slots
    for slot in action_slots:
        if slot.get("is_booked"):
            continue
        date_str = str(slot.get("date", "")).lower()
        start_time = str(slot.get("start_time", "")).lower()
        label = str(slot.get("label", "")).lower()

        # Exact ISO date literally present
        if date_str and date_str in normalized:
            return slot

        # Relative word match: "today" or "tomorrow"
        if "today" in label and "today" in normalized:
            if _time_matches(start_time, normalized):
                return slot
        if "tomorrow" in label and "tomorrow" in normalized:
            if _time_matches(start_time, normalized):
                return slot

        # Weekday name match: "saturday" / "sunday" / "monday"
        weekday = _weekday_name(date_str)
        if weekday and weekday in normalized and _time_matches(start_time, normalized):
            return slot
        if any(w in label for w in _WEEKDAY_NAMES if w in normalized) and _time_matches(start_time, normalized):
            return slot

        # Time match alone if start_time is unique in prompt
        if _time_matches(start_time, normalized):
            # Check if any label keyword matches
            if any(kw in normalized for kw in ["demo", "counselling", "session", "batch", "slot"]):
                return slot

    # Step 2: Fallback — any label token match with time
    for slot in action_slots:
        if slot.get("is_booked"):
            continue
        start_time = str(slot.get("start_time", "")).lower()
        label = str(slot.get("label", "")).lower()
        if _time_matches(start_time, normalized):
            return slot

    return None


def _weekday_name(iso_date: str) -> str | None:
    """"2026-09-01" -> "monday" (that date's actual weekday), or None if unparseable."""
    match = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso_date)
    if not match:
        return None
    try:
        d = date_cls(int(match.group(1)), int(match.group(2)), int(match.group(3)))
    except ValueError:
        return None
    return _WEEKDAY_NAMES[d.weekday()]


def _time_matches(start_time: str, text: str) -> bool:
    """"15:00" also matches "3 PM" / "3pm" / "15:00" in free text, not just one literal format."""
    if not start_time:
        return True
    if start_time in text:
        return True
    match = re.match(r"(\d{1,2}):(\d{2})", start_time)
    if not match:
        return False
    hour, minute = int(match.group(1)), int(match.group(2))
    period = "am" if hour < 12 else "pm"
    hour_12 = hour % 12 or 12
    candidates = [
        f"{hour_12}{period}",
        f"{hour_12} {period}",
        f"{hour_12}:{minute:02d}{period}",
        f"{hour_12}:{minute:02d} {period}",
        f"{hour_12}:{minute:02d}",
        f"{hour:02d}:{minute:02d}",
    ]
    if minute == 0:
        candidates.extend([f"{hour_12} o'clock", f"{hour_12}pm" if hour >= 12 else f"{hour_12}am"])
    return any(c in text for c in candidates)
