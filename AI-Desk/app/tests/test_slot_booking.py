"""Self-check for slot_booking's free-text-to-slot matching. Run: py -m app.tests.test_slot_booking"""
from app.services.slot_booking import find_matching_slot

SLOTS = [
    {"label": "Mon, 3 PM - 3:30 PM", "date": "2026-09-01", "start_time": "15:00", "end_time": "15:30", "is_booked": False},
    {"label": "Tue, 11 AM - 11:30 AM", "date": "2026-09-02", "start_time": "11:00", "end_time": "11:30", "is_booked": False},
    {"label": "Wed, 3 PM - 3:30 PM", "date": "2026-09-03", "start_time": "15:00", "end_time": "15:30", "is_booked": True},  # already booked
]


def test_matches_exact_iso_date_and_24h_time():
    match = find_matching_slot(SLOTS, "2026-09-02 11:00 IST")
    assert match is not None
    assert match["label"] == "Tue, 11 AM - 11:30 AM"


def test_matches_weekday_plus_spoken_time():
    """
    Regression: real Gemini extractions say "Monday 3 PM" or "Monday, 3 PM"
    — never the ISO date or the slot's full formatted label. This is the
    2026-08-28 bug report where two different callers both booked "Monday
    3 PM" and neither was blocked, because the old matcher only checked for
    the literal label string appearing in the text (it never does).
    """
    for text in ["Monday 3 PM", "Monday, 3 PM", "Monday 3PM", "toh Monday 3 PM ka aapka slot book ho gaya hai"]:
        match = find_matching_slot(SLOTS, text)
        assert match is not None, f"expected a match for {text!r}"
        assert match["date"] == "2026-09-01", f"wrong slot matched for {text!r}: {match}"


def test_does_not_match_wrong_weekday():
    """"Monday 3 PM" and "Wednesday 3 PM" share a time but not a day — must not cross-match."""
    match = find_matching_slot(SLOTS, "Wednesday 3 PM")
    # Wednesday's slot is already booked (is_booked=True) — correctly returns None,
    # not the Monday slot just because the time matches.
    assert match is None


def test_skips_already_booked_slot():
    match = find_matching_slot(SLOTS, "Wednesday at 3 PM, 2026-09-03")
    assert match is None  # that slot is_booked=True already, must not re-match


def test_no_match_returns_none():
    assert find_matching_slot(SLOTS, "Not interested, no slot booked") is None
    assert find_matching_slot(SLOTS, None) is None
    assert find_matching_slot(SLOTS, "") is None


def test_empty_slots_list():
    assert find_matching_slot([], "2026-09-01 14:00") is None


if __name__ == "__main__":
    test_matches_exact_iso_date_and_24h_time()
    test_matches_weekday_plus_spoken_time()
    test_does_not_match_wrong_weekday()
    test_skips_already_booked_slot()
    test_no_match_returns_none()
    test_empty_slots_list()
    print("OK: all slot_booking self-checks passed")
