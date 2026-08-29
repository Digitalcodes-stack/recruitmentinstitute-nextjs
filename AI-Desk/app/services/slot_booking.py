"""
Matches the free-text `interview_slot_booked` string from a conversation's
structured extraction (e.g. "Monday 3 PM", "2026-09-02 14:00", "Saturday at
10 AM") against an executive's action_slots, so the matched slot can be
marked booked and not offered to the next caller.

Extraction text is short, spoken-style prose from the model — almost never
the ISO date, and never the slot's full formatted label verbatim. In
practice it's a weekday name + a time ("Monday 3 PM", "Mon 3pm"), so
matching is built around that: derive the weekday from the slot's ISO date
and match weekday + time-in-any-common-format against the extracted text.
The literal ISO date or ID is still checked first, for the rarer case the
model does echo it exactly.
"""
import re
from datetime import date as date_cls

_WEEKDAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def find_matching_slot(action_slots: list[dict], booked_text: str | None) -> dict | None:
    """Returns the first unbooked slot whose date/weekday+time/label matches booked_text, or None."""
    if not booked_text:
        return None
    normalized = booked_text.lower()

    for slot in action_slots:
        if slot.get("is_booked"):
            continue
        date_str = str(slot.get("date", ""))
        start_time = str(slot.get("start_time", "")).lower()
        label = str(slot.get("label", "")).lower()

        # 1. Exact ISO date literally present (rare, but cheap to check first).
        if date_str and date_str.lower() in normalized:
            return slot

        # 2. Weekday name (derived from the ISO date) + a time-of-day match —
        # this is the common case: extracted text like "Monday 3 PM".
        weekday = _weekday_name(date_str)
        if weekday and weekday in normalized and _time_matches(start_time, normalized):
            return slot

        # 3. Fallback: any 3+ character word from the slot's label appears in
        # the extracted text (covers custom/non-day labels).
        label_words = [w for w in re.findall(r"[a-z0-9]+", label) if len(w) >= 3]
        if label_words and all(w in normalized for w in label_words if w not in _WEEKDAY_NAMES):
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
        return True  # no time on the slot at all — don't let a missing time block a date/weekday match
    if start_time in text:
        return True
    match = re.match(r"(\d{1,2}):(\d{2})", start_time)
    if not match:
        return False
    hour, minute = int(match.group(1)), int(match.group(2))
    period = "am" if hour < 12 else "pm"
    hour_12 = hour % 12 or 12
    candidates = [f"{hour_12}{period}", f"{hour_12} {period}"]
    if minute == 0:
        candidates += [f"{hour_12}:00{period}", f"{hour_12}:00 {period}"]
    else:
        candidates += [f"{hour_12}:{minute:02d}{period}", f"{hour_12}:{minute:02d} {period}"]
    return any(c in text for c in candidates)
