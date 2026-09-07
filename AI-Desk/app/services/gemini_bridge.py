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
    """One live voice conversation: owns the client WS (browser or Plivo) and the Gemini Live WS for its duration."""

    def __init__(
        self,
        browser_ws: WebSocket,
        system_prompt: str,
        is_plivo: bool = False,
        transcoder=None,
        caller_name: str | None = None,
        caller_phone: str | None = None,
        preferred_course: str | None = None,
        agent_name: str | None = None,
        company: str | None = None,
        **kwargs,
    ):
        self.browser_ws = browser_ws
        self.client_ws = browser_ws
        self.system_prompt = system_prompt
        self.is_plivo = is_plivo
        self.transcoder = transcoder
        self.caller_name = caller_name
        self.caller_phone = caller_phone
        self.preferred_course = preferred_course
        self.agent_name = agent_name
        self.company = company
        self.transcript: list[dict] = []  # [{"role": "assistant"|"caller", "text": str}]
        self._gemini_ws = None
        self._closed = False
        self._in_resample_state = None

    async def run(self, extraction_prompt: str) -> tuple[list[dict], dict]:
        """
        Runs the full bidirectional bridge until the client disconnects.
        Returns (transcript, extraction).
        """
        url = f"{GEMINI_LIVE_URL}?key={settings.GEMINI_API_KEY}"

        async with websockets.connect(url, max_size=None) as gemini_ws:
            self._gemini_ws = gemini_ws
            await self._send_setup()
            await self._trigger_opening_line()

            to_gemini = asyncio.create_task(self._pump_client_to_gemini())
            to_client = asyncio.create_task(self._pump_gemini_to_client())
            done, pending = await asyncio.wait(
                {to_gemini, to_client}, return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
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
        logger.info("Sending Gemini Live setup configuration (model=%s)...", settings.GEMINI_LIVE_MODEL)
        await self._gemini_ws.send(json.dumps({
            "setup": {
                "model": f"models/{settings.GEMINI_LIVE_MODEL}",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "temperature": 0.4,
                },
                "systemInstruction": {"parts": [{"text": self.system_prompt}]},
                "inputAudioTranscription": {},
                "outputAudioTranscription": {},
                "realtimeInputConfig": {
                    "automaticActivityDetection": {
                        "endOfSpeechSensitivity": "END_SENSITIVITY_LOW",
                        "silenceDurationMs": 750,
                    },
                },
            },
        }))
        raw = await self._gemini_ws.recv()
        event = json.loads(raw)
        if "setupComplete" not in event:
            logger.warning("Unexpected first Gemini Live message (expected setupComplete): %s", event)
        else:
            logger.info("✅ Gemini Live setupComplete received successfully.")

    async def _trigger_opening_line(self):
        """
        Gemini Live only speaks in response to a turn. If the caller's name is known,
        instruct Gemini to greet them warmly by name right away.
        """
        if self.caller_name and self.caller_name.lower() not in ("candidate", "caller", "user", "visitor", ""):
            course_text = f" regarding the {self.preferred_course}" if self.preferred_course else ""
            instruction = (
                f"(The phone call has just connected with {self.caller_name}{course_text}. "
                f"Immediately greet them warmly by their name '{self.caller_name}', introduce yourself as "
                f"{self.agent_name or 'Rupali'} from {self.company or 'Recruitment Institute'}, and state that you are calling them back right now as requested.)"
            )
        else:
            instruction = "(The call has just connected. Greet the caller and introduce yourself now, following your instructions.)"

        logger.info("Triggering Gemini Live opening greeting for %s: %s", self.caller_name, instruction[:120])
        await self._gemini_ws.send(json.dumps({
            "clientContent": {
                "turns": [{"role": "user", "parts": [{"text": instruction}]}],
                "turnComplete": True,
            },
        }))

    async def _pump_client_to_gemini(self):
        """Reads audio from client (browser binary or Plivo JSON base64), forwards to Gemini."""
        first_audio_logged = False
        while not self._closed:
            try:
                msg = await self.client_ws.receive()
            except (WebSocketDisconnect, RuntimeError):
                logger.info("Client WebSocket disconnected in _pump_client_to_gemini")
                break

            if msg.get("type") == "websocket.disconnect":
                logger.info("Client WebSocket received disconnect event")
                break

            if self.is_plivo:
                # Plivo sends text frames with JSON payloads
                text_data = msg.get("text")
                if not text_data:
                    bytes_data = msg.get("bytes")
                    if bytes_data:
                        try:
                            text_data = bytes_data.decode("utf-8")
                        except Exception:
                            pass
                if not text_data:
                    continue
                try:
                    event = json.loads(text_data)
                except Exception:
                    continue

                evt_type = event.get("event")
                if evt_type == "start":
                    logger.info("▶️ Plivo Stream 'start' event: streamId=%s, callId=%s",
                                event.get("start", {}).get("streamId"),
                                event.get("start", {}).get("callId"))
                elif evt_type == "media":
                    media = event.get("media", {})
                    payload = media.get("payload")
                    if payload and self.transcoder:
                        if not first_audio_logged:
                            logger.info("🎙️ First inbound audio packet received from Plivo caller")
                            first_audio_logged = True
                        pcm16 = self.transcoder.decode_inbound(payload)
                        if pcm16:
                            await self._gemini_ws.send(json.dumps({
                                "realtimeInput": {
                                    "audio": {
                                        "mimeType": f"audio/pcm;rate={GEMINI_IN_RATE}",
                                        "data": base64.b64encode(pcm16).decode("ascii"),
                                    },
                                },
                            }))
                elif evt_type in ("stop", "hangup"):
                    logger.info("⏹️ Plivo audio stream sent stop/hangup event: %s", event)
                    break
            else:
                # Browser mic sends raw PCM16 binary frames
                data = msg.get("bytes")
                if not data:
                    continue

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

    async def _pump_gemini_to_client(self):
        """Reads Gemini Live events, forwards audio to client, records transcript, handles barge-in."""
        pending_assistant = ""
        pending_caller = ""
        first_outbound_logged = False

        async for raw in self._gemini_ws:
            if self._closed:
                break
            event = json.loads(raw)

            server_content = event.get("serverContent", {})

            # Low-latency Barge-in / interruption: clear Plivo audio buffer when user interrupts
            if server_content.get("interrupted") and self.is_plivo:
                logger.info("⚡ Caller barge-in detected: sending clearAudio to Plivo buffer")
                try:
                    await self.client_ws.send_text(json.dumps({"event": "clearAudio"}))
                except Exception:
                    pass

            model_turn = server_content.get("modelTurn", {})
            for part in model_turn.get("parts", []):
                inline_data = part.get("inlineData")
                if inline_data:
                    pcm24k = base64.b64decode(inline_data["data"])
                    if self.is_plivo:
                        if self.transcoder:
                            outbound_payload = self.transcoder.encode_outbound(pcm24k)
                            if outbound_payload:
                                if not first_outbound_logged:
                                    logger.info("🔊 Streaming voice audio back to Plivo caller (playAudio)")
                                    first_outbound_logged = True
                                await self.client_ws.send_text(json.dumps({
                                    "event": "playAudio",
                                    "media": {
                                        "contentType": "audio/x-mulaw",
                                        "sampleRate": 8000,
                                        "payload": outbound_payload,
                                    },
                                }))
                    else:
                        await self.client_ws.send_bytes(pcm24k)

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
