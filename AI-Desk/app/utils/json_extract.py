"""Shared helper: pull a JSON object out of an LLM's text response, tolerating markdown fences/prose."""
import json


def safe_parse_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # model sometimes wraps JSON in prose/markdown fences — extract the {...} block
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                pass
        return {"raw_summary": text}
