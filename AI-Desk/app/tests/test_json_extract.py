"""Self-check for safe_parse_json (shared by realtime_bridge and gemini_bridge). Run: py -m app.tests.test_json_extract"""
from app.utils.json_extract import safe_parse_json


def test_clean_json():
    assert safe_parse_json('{"a": 1}') == {"a": 1}


def test_json_in_markdown_fence():
    text = 'Here is the summary:\n```json\n{"interest_level": "interested", "notes": "ok"}\n```'
    assert safe_parse_json(text) == {"interest_level": "interested", "notes": "ok"}


def test_unparseable_falls_back():
    result = safe_parse_json("not json at all")
    assert result == {"raw_summary": "not json at all"}


if __name__ == "__main__":
    test_clean_json()
    test_json_in_markdown_fence()
    test_unparseable_falls_back()
    print("OK: all json_extract self-checks passed")
