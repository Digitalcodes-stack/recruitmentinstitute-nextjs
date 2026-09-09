"""
Self-check for the prompt builder: the one piece of non-trivial branching
logic in this project's prompt engine. Run with: py -m app.tests.test_prompt_builder
(or pytest, if installed — no fixtures/framework needed either way).
"""
from types import SimpleNamespace

from app.services.prompt_builder import build_system_prompt


def test_full_profile():
    exe = SimpleNamespace(
        name="Rupali Patil", role="Recruitment Coordinator", company="DigitalAIML",
        address="Pune", introduction="Hi, this is Rupali from DigitalAIML.",
        goals=["Confirm identity", "Book interview"], scopes=["Discuss open roles"],
        donts=["Never discuss salary numbers"], languages=["English", "Hindi", "Hinglish"],
        speech_style="Warm, concise.", products_services=[{"title": "Backend Engineer", "description": "Remote, Pune"}],
        faqs=[{"question": "Is it remote?", "answer": "Hybrid, 2 days office."}],
        action_slots=[{"label": "Tue", "date": "2026-09-02", "start_time": "14:00", "end_time": "14:30", "is_booked": False}],
        business_hours={"mon": {"start": "09:30", "end": "18:30"}, "sun": {"closed": True}},
        timezone="Asia/Kolkata", extraction_schema=[],
    )
    prompt = build_system_prompt(exe, language="Marathi", caller_state="Maharashtra")
    assert "Rupali Patil" in prompt
    assert "Backend Engineer" in prompt
    assert "Is it remote?" in prompt
    assert "Tue" in prompt and "14:00" in prompt
    assert "Monday: 09:30" in prompt
    assert "DYNAMIC REAL-TIME LANGUAGE MATCHING" in prompt
    assert "MARATHI" in prompt and "HINDI" in prompt and "ENGLISH" in prompt
    assert "ACTIVE LISTENING" in prompt
    assert "MAXIMUM 1 TO 2 SHORT SENTENCES" in prompt
    assert "NEVER MENTION WHATSAPP" in prompt
    assert "EMAIL" in prompt


def test_empty_profile_does_not_crash():
    exe = SimpleNamespace(
        name="Test Bot", role="Agent", company="Acme", address=None, introduction="",
        goals=[], scopes=[], donts=[], languages=[], speech_style="Neutral.",
        products_services=[], faqs=[], action_slots=[], business_hours={},
        timezone="UTC", extraction_schema=[],
    )
    prompt = build_system_prompt(exe)
    assert "Test Bot" in prompt
    assert "none specified" in prompt or "No FAQs" in prompt


def test_booked_slots_excluded():
    exe = SimpleNamespace(
        name="X", role="R", company="C", address=None, introduction="", goals=[], scopes=[],
        donts=[], languages=[], speech_style="", products_services=[], faqs=[],
        action_slots=[{"label": "Mon", "date": "2026-09-01", "start_time": "10:00", "end_time": "10:30", "is_booked": True}],
        business_hours={}, timezone="UTC", extraction_schema=[],
    )
    prompt = build_system_prompt(exe)
    assert "BOOKED" in prompt


def test_agent_name_override():
    exe = SimpleNamespace(
        name="Rupali Patil", role="Senior Career Counsellor", company="Recruitment Institute",
        address="Pune", introduction="Hi, this is Rupali calling from Recruitment Institute.",
        goals=["Help candidate"], scopes=["Discuss courses"],
        donts=["Never break character"], languages=["English", "Hindi"],
        speech_style="Friendly and helpful.", products_services=[],
        faqs=[], action_slots=[], business_hours={}, timezone="Asia/Kolkata",
        extraction_schema=[],
    )
    prompt = build_system_prompt(exe, agent_name="Pooja Kulkarni", language="Marathi")
    assert "You are Pooja Kulkarni" in prompt
    assert "Remember: you are Pooja Kulkarni" in prompt
    assert "Rupali" not in prompt


if __name__ == "__main__":
    test_full_profile()
    test_empty_profile_does_not_crash()
    test_booked_slots_excluded()
    test_agent_name_override()
    print("OK: all prompt_builder self-checks passed")

