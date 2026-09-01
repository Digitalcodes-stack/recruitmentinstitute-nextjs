"""
Gemini Live voice bridge: relays audio between a browser's WebSocket
(mic capture -> speaker playback, see /ws/voice-chat/{executive_id} and
static/index.html) and the Gemini Live API (BidiGenerateContent) WebSocket.

Audio contract with the browser side:
  - Browser sends 16-bit PCM audio chunks, little-endian, at BROWSER_IN_RATE,
    as binary WebSocket frames (raw bytes, no base64/JSON wrapper — cheapest
    to produce from the Web Audio API and cheapest to relay).
  - Gemini Live expects 16kHz PCM16 input and returns 24kHz PCM16 output.
  - This bridge resamples browser input to 16kHz for Gemini, and passes
    Gemini's 24kHz output straight to the browser (a modern <audio>/Web Audio
    context can play back arbitrary sample rates, so no downsample needed
    on the way out — one less resample the server has to do per frame).

Resampling uses the stdlib `audioop` module (linear PCM rate conversion) —
no extra audio dependency needed for a straight rate conversion.

# ponytail: audioop is deprecated and removed in Python 3.13+. If/when this
# project upgrades off 3.12, replace with a small numpy resampler or the
# `audioop-lts` PyPI backport.
"""
import asyncio
import audioop
import base64
import json
import logging

import httpx
import websockets
from fastapi import WebSocket, WebSocketDisconnect

from app.config import settings
from app.utils.json_extract import safe_parse_json

logger = logging.getLogger("aidesk.gemini")

# Plain (non-Live) text model for post-call structured extraction — the Live
# session is locked to audio-only responses for its whole lifetime, so
# getting reliable JSON (exact phone numbers, emails, dates) means a
# separate text-in/text-out call against the saved transcript instead of
# asking the voice model to speak JSON and transcribing it back.
EXTRACTION_MODEL = "gemini-2.5-flash"
GENERATE_CONTENT_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{EXTRACTION_MODEL}:generateContent"

GEMINI_LIVE_URL = (
    "wss://generativelanguage.googleapis.com/ws/"
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
)

BROWSER_IN_RATE = 16000  # Hz, PCM16 — the rate the browser is asked to capture/send at (matches Gemini, so usually a no-op resample)
GEMINI_IN_RATE = 16000   # Hz, PCM16, expected by Gemini Live input
GEMINI_OUT_RATE = 24000  # Hz, PCM16, returned by Gemini Live output — sent to the browser as-is


class VoiceChatSession:
    """One live browser voice conversation: owns the browser WS and the Gemini Live WS for its duration."""

    def __init__(self, browser_ws: WebSocket, system_prompt: str, **kwargs):
        self.browser_ws = browser_ws
        self.system_prompt = system_prompt
        self.transcript: list[dict] = []  # [{"role": "assistant"|"caller", "text": str}]
        self._gemini_ws = None
        self._closed = False
        self._in_resample_state = None

    async def run(self, extraction_prompt: str) -> tuple[list[dict], dict]:
        """
        Runs the full bidirectional bridge until the browser disconnects.
        Returns (transcript, extraction) — the structured-summary request is
        a separate plain-text API call (see _request_structured_summary),
        so it doesn't need the Live WebSocket to still be open.
        """
        url = f"{GEMINI_LIVE_URL}?key={settings.GEMINI_API_KEY}"

        async with websockets.connect(url, max_size=None) as gemini_ws:
            self._gemini_ws = gemini_ws
            await self._send_setup()
            await self._trigger_opening_line()

            # Either direction ending (browser disconnects, or Gemini closes)
            # should end the whole session — asyncio.gather() alone would
            # leave the other pump task awaiting forever, since one task
            # returning normally doesn't cancel its sibling.
            to_gemini = asyncio.create_task(self._pump_browser_to_gemini())
            to_browser = asyncio.create_task(self._pump_gemini_to_browser())
            done, pending = await asyncio.wait(
                {to_gemini, to_browser}, return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
            # .cancel() only *schedules* the CancelledError — without awaiting
            # the task, it can still be mid-recv() on gemini_ws when
            # _request_structured_summary() below starts its own recv() on
            # the same socket, tripping websockets' ConcurrencyError. Await
            # (and swallow) the cancellation to guarantee it's actually done.
            for task in pending:
                try:
                    await task
                except (asyncio.CancelledError, Exception):
                    pass
            for task in done:
                exc = task.exception()
                if exc and not isinstance(exc, (WebSocketDisconnect, websockets.exceptions.ConnectionClosed)):
                    logger.exception("Voice chat pump failed", exc_info=exc)

            self._closed = True

        extraction = await self._request_structured_summary(extraction_prompt)
        return self.transcript, extraction

    async def _send_setup(self):
        """Sends the BidiGenerateContent setup message with our system prompt and audio config."""
        await self._gemini_ws.send(json.dumps({
            "setup": {
                "model": f"models/{settings.GEMINI_LIVE_MODEL}",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    # Lower than the default — less randomness means fewer
                    # rushed/rambling responses and steadier pacing.
                    "temperature": 0.4,
                },
                "systemInstruction": {"parts": [{"text": self.system_prompt}]},
                # Without these, serverContent carries audio only — no text
                # of what either side said, so the saved transcript would be
                # incomplete or (for the assistant's side) entirely empty.
                "inputAudioTranscription": {},
                "outputAudioTranscription": {},
                # LOW end-of-speech sensitivity + longer silence requirement
                # = the model waits longer for the caller to actually finish
                # before responding, instead of jumping in on a mid-sentence
                # pause. Fixes "she talks over me / doesn't listen".
                "realtimeInputConfig": {
                    "automaticActivityDetection": {
                        "endOfSpeechSensitivity": "END_SENSITIVITY_LOW",
                        "silenceDurationMs": 800,
                    },
                },
            },
        }))
        # First message back is setupComplete — wait for it before streaming audio.
        raw = await self._gemini_ws.recv()
        event = json.loads(raw)
        if "setupComplete" not in event:
            logger.warning("Unexpected first Gemini Live message (expected setupComplete): %s", event)

    async def _trigger_opening_line(self):
        """
        Gemini Live only speaks in response to a turn — with automaticActivityDetection
        on, that means waiting for the caller's mic input by default, so nobody says
        anything until the caller speaks first. Sending an empty clientContent turn
        with turnComplete=True immediately after setup gives the model a turn to
        respond to with no caller input yet, so it opens with its own introduction
        instead of sitting silently.
        """
        await self._gemini_ws.send(json.dumps({
            "clientContent": {
                "turns": [{"role": "user", "parts": [{"text": "(The call has just connected. Greet the caller and introduce yourself now, following your instructions.)"}]}],
                "turnComplete": True,
            },
        }))

    async def _pump_browser_to_gemini(self):
        """Reads raw PCM16 binary frames from the browser mic, forwards to Gemini as base64."""
        while not self._closed:
            msg = await self.browser_ws.receive()
            if msg.get("type") == "websocket.disconnect":
                break
            data = msg.get("bytes")
            if not data:
                continue  # ignore any stray text frames (e.g. browser-side control messages)

            if BROWSER_IN_RATE != GEMINI_IN_RATE:
                data, self._in_resample_state = audioop.ratecv(
                    data, 2, 1, BROWSER_IN_RATE, GEMINI_IN_RATE, self._in_resample_state
                )

            await self._gemini_ws.send(json.dumps({
                "realtimeInput": {
                    "audio": {
                        "mimeType": f"audio/pcm;rate={GEMINI_IN_RATE}",
                        "data": base64.b64encode(data).decode("ascii"),
                    },
                },
            }))

    async def _pump_gemini_to_browser(self):
        """Reads Gemini Live events, forwards model audio to the browser as raw PCM16 binary, records transcript."""
        # outputTranscription/inputTranscription arrive as many small chunks per
        # spoken turn, not one clean sentence — accumulate each side's current
        # turn and flush as a single transcript entry when Gemini signals the
        # turn is complete, so the saved transcript reads as real sentences.
        pending_assistant = ""
        pending_caller = ""

        async for raw in self._gemini_ws:
            if self._closed:
                break
            event = json.loads(raw)

            server_content = event.get("serverContent", {})
            model_turn = server_content.get("modelTurn", {})
            for part in model_turn.get("parts", []):
                inline_data = part.get("inlineData")
                if inline_data:
                    pcm24k = base64.b64decode(inline_data["data"])
                    await self.browser_ws.send_bytes(pcm24k)

            output_chunk = server_content.get("outputTranscription", {}).get("text")
            if output_chunk:
                pending_assistant += output_chunk

            input_chunk = server_content.get("inputTranscription", {}).get("text")
            if input_chunk:
                pending_caller += input_chunk

            if server_content.get("turnComplete"):
                if pending_assistant.strip():
                    self.transcript.append({"role": "assistant", "text": pending_assistant.strip()})
                    pending_assistant = ""
                if pending_caller.strip():
                    self.transcript.append({"role": "caller", "text": pending_caller.strip()})
                    pending_caller = ""

    async def _request_structured_summary(self, extraction_prompt: str) -> dict:
        """
        After the conversation ends, ask a plain text model for a structured
        JSON summary of the saved transcript. Deliberately NOT done on the
        live Gemini WebSocket: that session is locked to audio-only
        responses for its whole lifetime (Live API has no per-turn modality
        override), so getting it to "speak" JSON and transcribing that back
        is unreliable for exact values (phone numbers, emails, dates).
        A plain generateContent call is text in, text out — no speech
        round-trip, and doesn't require the Live socket to still be open.
        """
        if not self.transcript:
            return {}
        transcript_text = "\n".join(f"{t['role']}: {t['text']}" for t in self.transcript)
        prompt = f"{extraction_prompt}\n\n--- Transcript ---\n{transcript_text}"
        try:
            if settings.GEMINI_API_KEY:
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.post(
                        GENERATE_CONTENT_URL,
                        headers={"x-goog-api-key": settings.GEMINI_API_KEY, "Content-Type": "application/json"},
                        json={"contents": [{"parts": [{"text": prompt}]}]},
                    )
                if response.status_code == 200:
                    candidates = response.json().get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        text = "".join(p.get("text", "") for p in parts)
                        parsed = safe_parse_json(text)
                        if isinstance(parsed, dict) and parsed:
                            return parsed
        except Exception:
            logger.exception("Failed to extract structured summary from Gemini, applying rule-based heuristics")

        # Heuristic fallback extraction from transcript text
        full_txt = transcript_text.lower()
        disp = "interested" if any(w in full_txt for w in ["yes", "interested", "course", "fee", "demo", "batch", "syllabus", "placement"]) else "undetermined"
        
        notes = []
        if "fee" in full_txt or "cost" in full_txt or "price" in full_txt or "discount" in full_txt:
            notes.append("Inquired about Course Fees & Commercials")
        if "weekend" in full_txt or "saturday" in full_txt or "sunday" in full_txt or "timing" in full_txt:
            notes.append("Inquired about Weekend/Batch Timings")
        if "placement" in full_txt or "job" in full_txt or "support" in full_txt:
            notes.append("Inquired about 95% Placement & Job Assistance")
        if "demo" in full_txt or "trial" in full_txt:
            notes.append("Requested Demo / Trial Class Details")
        if "recruitment" in full_txt or "sourcing" in full_txt or "boolean" in full_txt or "ats" in full_txt:
            notes.append("Interested in End-to-End Recruitment & TA Training")
        elif "payroll" in full_txt or "generalist" in full_txt or "statutory" in full_txt:
            notes.append("Interested in HR Generalist & Payroll Operations")

        return {
            "interest_level": "interested" if notes else "undecided",
            "disposition": "slot_booked" if "demo" in full_txt and "booked" in full_txt else (disp if disp != "undetermined" else "interested"),
            "key_notes_for_office": " • ".join(notes) if notes else "Spoken consultation recorded with Priya.",
        }
