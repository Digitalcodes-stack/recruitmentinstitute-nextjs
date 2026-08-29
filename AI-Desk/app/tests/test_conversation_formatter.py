"""Self-check for conversation email formatting. Run: py -m app.tests.test_conversation_formatter"""
from types import SimpleNamespace

from app.services.conversation_formatter import format_conversation_email


def test_full_conversation():
    convo = SimpleNamespace(
        caller_name="Parnika Patil", caller_phone="+919403217105", caller_email="parnika@gmail.com",
        started_at="2026-08-28 16:33:06",
        transcript=[
            {"role": "assistant", "text": "Hi, this is Rupali."},
            {"role": "caller", "text": "Hello."},
        ],
        extracted_data={"disposition": "interested", "interview_slot_booked": "Monday 3 PM", "notice_period": None},
    )
    subject, body = format_conversation_email(convo)
    assert "Parnika Patil" in subject
    assert "+919403217105" in body
    assert "parnika@gmail.com" in body
    assert "Executive: Hi, this is Rupali." in body
    assert "Caller: Hello." in body
    assert "disposition: interested" in body
    assert "notice_period" not in body  # None values are skipped, not shown as "notice_period: None"


def test_empty_conversation():
    convo = SimpleNamespace(
        caller_name="X", caller_phone=None, caller_email=None, started_at="2026-01-01",
        transcript=[], extracted_data={},
    )
    subject, body = format_conversation_email(convo)
    assert "no transcript captured" in body
    assert "(none)" in body


if __name__ == "__main__":
    test_full_conversation()
    test_empty_conversation()
    print("OK: all conversation_formatter self-checks passed")
