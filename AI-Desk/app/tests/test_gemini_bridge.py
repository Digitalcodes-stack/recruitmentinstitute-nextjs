"""
Self-checks for gemini_bridge.py's message-shape and transcript-accumulation
logic. No network — these exercise the pure parsing/accumulation behavior
directly, or grep source for message shapes verified against the live API.
Run: py -m app.tests.test_gemini_bridge
"""
import asyncio
import inspect

from app.services import gemini_bridge


def test_pump_uses_current_realtime_input_shape():
    """
    Guards against regressing to the deprecated `mediaChunks` array shape.
    Gemini's Live API now expects realtimeInput.audio = {mimeType, data}
    (verified directly against the live API on 2026-08-28 — see README).
    """
    source = inspect.getsource(gemini_bridge.VoiceChatSession._pump_browser_to_gemini)
    assert '"audio"' in source, "expected realtimeInput.audio in the outbound message"
    assert "mediaChunks" not in source, "mediaChunks is deprecated by Gemini Live API — use realtimeInput.audio instead"


def test_setup_enables_transcription():
    """
    Without inputAudioTranscription/outputAudioTranscription in the setup
    message, serverContent carries audio only — no text of what either side
    said, so the saved transcript silently ends up caller-only (assistant
    lines missing). This regressed once already; guard it.
    """
    source = inspect.getsource(gemini_bridge.VoiceChatSession._send_setup)
    assert "inputAudioTranscription" in source
    assert "outputAudioTranscription" in source


def test_transcript_accumulates_and_flushes_on_turn_complete():
    """
    outputTranscription/inputTranscription arrive as many small chunks per
    turn — verifies they're accumulated into one entry per side and only
    appended to self.transcript when turnComplete fires (not once per chunk,
    which would fragment the saved transcript into unreadable pieces).
    """
    session = gemini_bridge.VoiceChatSession.__new__(gemini_bridge.VoiceChatSession)
    session.transcript = []
    session._closed = False
    session._gemini_ws = _FakeGeminiWS([
        {"serverContent": {"outputTranscription": {"text": "Hi, this is "}}},
        {"serverContent": {"outputTranscription": {"text": "Rupali."}, "inputTranscription": {"text": "Hello"}}},
        {"serverContent": {"inputTranscription": {"text": " there"}, "turnComplete": True}},
    ])

    class _FakeBrowserWS:
        async def send_bytes(self, data):
            pass

    session.browser_ws = _FakeBrowserWS()

    asyncio.run(session._pump_gemini_to_browser())

    assert session.transcript == [
        {"role": "assistant", "text": "Hi, this is Rupali."},
        {"role": "caller", "text": "Hello there"},
    ]


class _FakeGeminiWS:
    """Minimal async-iterable stand-in for a websockets connection, yielding pre-baked JSON events."""
    def __init__(self, events):
        import json
        self._raw = [json.dumps(e) for e in events]

    def __aiter__(self):
        self._iter = iter(self._raw)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


if __name__ == "__main__":
    test_pump_uses_current_realtime_input_shape()
    test_setup_enables_transcription()
    test_transcript_accumulates_and_flushes_on_turn_complete()
    print("OK: all gemini_bridge self-checks passed")
