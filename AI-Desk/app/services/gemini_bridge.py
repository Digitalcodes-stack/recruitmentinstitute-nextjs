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
        self.call_id = kwargs.get("call_id")
        self.plivo_call_uuid = kwargs.get("plivo_call_uuid")
        raw_lang = kwargs.get("language") or "English"
        if "(" in raw_lang:
            raw_lang = raw_lang.split("(")[0].strip()
        self.language = raw_lang.strip().capitalize()
        self._opening_greeting_delivered = False
        self._closing_triggered = False
        self._hangup_task = None
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
        # Realistic Indian Voice Selection:
        # Vikram Joshi (Male) -> "Puck" (Natural, articulate conversational Indian male voice)
        # Pooja Kulkarni, Anjali Patil, Sneha Deshmukh, Meera Rao, Riya Joshi -> "Kore" (Warm, natural, realistic Indian female counsellor)
        counselor_lower = (self.agent_name or "").lower()
        if "vikram" in counselor_lower or ("joshi" in counselor_lower and "riya" not in counselor_lower):
            selected_voice = "Puck"
        else:
            selected_voice = "Kore"

        logger.info("Sending Gemini Live setup configuration (model=%s, voice=%s, temp=0.65, silence=800ms)...",
                    settings.GEMINI_LIVE_MODEL, selected_voice)
        await self._gemini_ws.send(json.dumps({
            "setup": {
                "model": f"models/{settings.GEMINI_LIVE_MODEL}",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {
                        "voiceConfig": {
                            "prebuiltVoiceConfig": {
                                "voiceName": selected_voice
                            }
                        }
                    },
                    "temperature": 0.65,
                },
                "systemInstruction": {"parts": [{"text": self.system_prompt}]},
                "inputAudioTranscription": {},
                "outputAudioTranscription": {},
                "realtimeInputConfig": {
                    "automaticActivityDetection": {
                        "endOfSpeechSensitivity": "END_SENSITIVITY_DEFAULT",
                        "silenceDurationMs": 800,
                    },
                },
            },
        }))
        raw = await self._gemini_ws.recv()
        event = json.loads(raw)
        if "setupComplete" not in event:
            logger.warning("Unexpected first Gemini Live message (expected setupComplete): %s", event)
        else:
            logger.info("✅ Gemini Live setupComplete received successfully (voice=%s).", selected_voice)

    async def _trigger_opening_line(self):
        """
        Gemini Live speaks in response to a turn.
        We instruct Gemini in the EXACT language selected by the user to guarantee
        that the very first generated sentence is in that language with natural human warmth.
        CRITICAL: The opening line is strictly 1 short sentence so the AI finishes in ~2-3 seconds
        and immediately yields the floor to listen to the caller.
        """
        lang = self.language or "English"
        caller = self.caller_name if (self.caller_name and self.caller_name.lower() not in ("candidate", "caller", "user", "visitor", "")) else "Candidate"
        caller_first = caller.split()[0] if caller else "there"
        counselor = self.agent_name or "Pooja Kulkarni"
        inst_company = self.company or "Recruitment Institute"

        if lang == "Marathi":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short, warm sentence in natural spoken Marathi (मराठी) like a real Indian counsellor. "
                f"Say ONLY this one sentence, then STOP speaking immediately and LISTEN attentively to the caller.]\n"
                f"'नमस्कार {caller_first}! मी {inst_company}मधून {counselor} बोलतेय. कशी मदत करू शकते तुम्हाला?'"
            )
        elif lang == "Hindi":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short, warm sentence in natural spoken Hindi (हिंदी) like a real Indian counsellor. "
                f"Say ONLY this one sentence, then STOP speaking immediately and LISTEN attentively to the caller.]\n"
                f"'नमस्ते {caller_first}! मैं {inst_company} से {counselor} बात कर रही हूँ। कैसे हैं आप?'"
            )
        elif lang == "Odia":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Odia (ଓଡ଼ିଆ). Then STOP speaking and LISTEN.]\n"
                f"'ନମସ୍କାର {caller_first}! ମୁଁ {inst_company}ରୁ {counselor} କହୁଛି। କେମିତି ଅଛନ୍ତି?'"
            )
        elif lang == "Assamese":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Assamese (অসমীয়া). Then STOP speaking and LISTEN.]\n"
                f"'নমস্কাৰ {caller_first}! মই {inst_company}ৰ পৰা {counselor} কৈছোঁ। কেনে আছে আপুনি?'"
            )
        elif lang == "Konkani":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Konkani (कोंकणी). Then STOP speaking and LISTEN.]\n"
                f"'नमस्कार {caller_first}! हांव {inst_company} कडल्यान {counselor} उलयतां. कशे आसात तुमी?'"
            )
        elif lang == "Tamil":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Tamil (தமிழ்). Then STOP speaking and LISTEN.]\n"
                f"'வணக்கம் {caller_first}! நான் {inst_company}லிருந்து {counselor} பேசுகிறேன். எப்படி இருக்கிறீர்கள்?'"
            )
        elif lang == "Telugu":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Telugu (తెలుగు). Then STOP speaking and LISTEN.]\n"
                f"'నమస్కారం {caller_first}! నేను {inst_company} నుండి {counselor} మాట్లాడుతున్నాను. ఎలా ఉన్నారు?'"
            )
        elif lang == "Kannada":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Kannada (ಕನ್ನಡ). Then STOP speaking and LISTEN.]\n"
                f"'ನಮಸ್ಕಾರ {caller_first}! ನಾನು {inst_company}ಯಿಂದ {counselor} ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ಹೇಗಿದ್ದೀರಿ?'"
            )
        elif lang == "Bengali":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Bengali (বাংলা). Then STOP speaking and LISTEN.]\n"
                f"'নমস্কার {caller_first}! আমি {inst_company} থেকে {counselor} বলছি। কেমন আছেন?'"
            )
        elif lang == "Gujarati":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Gujarati (ગુજરાતી). Then STOP speaking and LISTEN.]\n"
                f"'નમસ્તે {caller_first}! હું {inst_company}માંથી {counselor} વાત કરું છું. કેમ છો?'"
            )
        elif lang == "Malayalam":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Malayalam (മലയാളം). Then STOP speaking and LISTEN.]\n"
                f"'നമസ്കാരം {caller_first}! ഞാൻ {inst_company}യിൽ നിന്ന് {counselor} സംസാരിക്കുന്നു. സുഖമാണോ?'"
            )
        elif lang == "Punjabi":
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short sentence in natural spoken Punjabi (ਪੰਜਾਬੀ). Then STOP speaking and LISTEN.]\n"
                f"'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {caller_first}! ਮੈਂ {inst_company} ਤੋਂ {counselor} ਬੋਲ ਰਹੀ ਹਾਂ। ਕਿਵੇਂ ਹੋ ਤੁਸੀਂ?'"
            )
        else:
            instruction = (
                f"[CRITICAL: Speak ONLY 1 short, warm sentence in natural Indian English like a real Indian woman counsellor. "
                f"Say ONLY this one sentence, then STOP speaking immediately and LISTEN attentively to the caller.]\n"
                f"'Hi {caller_first}! {counselor} here from {inst_company}. How are you doing today?'"
            )

        logger.info("Triggering Gemini Live opening greeting for %s in %s: %s", self.caller_name, lang, instruction[:150])
        await self._gemini_ws.send(json.dumps({
            "clientContent": {
                "turns": [{"role": "user", "parts": [{"text": instruction}]}],
                "turnComplete": True,
            },
        }))

    async def _pump_client_to_gemini(self):
        """Reads audio from client (browser binary or Plivo JSON base64), forwards to Gemini."""
        first_audio_logged = False
        stream_start_time = asyncio.get_event_loop().time()
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
                    start_call_id = event.get("start", {}).get("callId")
                    if start_call_id and not self.plivo_call_uuid:
                        self.plivo_call_uuid = start_call_id
                    logger.info("▶️ Plivo Stream 'start' event: streamId=%s, callId=%s",
                                event.get("start", {}).get("streamId"),
                                start_call_id)
                elif evt_type == "media":
                    # Ignore initial 1.2s carrier connection transient clicks/noise to prevent false barge-in
                    if asyncio.get_event_loop().time() - stream_start_time < 1.2:
                        continue
                    media = event.get("media", {})
                    payload = media.get("payload")
                    if payload and self.transcoder:
                        if not first_audio_logged:
                            logger.info("🎙️ First inbound audio packet received from Plivo caller (past carrier guard)")
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

            # Low-latency Barge-in / interruption: immediately clear audio playback buffer when caller interrupts
            if server_content.get("interrupted"):
                logger.info("⚡ Caller barge-in / interruption detected: clearing audio playback buffer")
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
                caller_turn = pending_caller.strip()
                asst_turn = pending_assistant.strip()

                if caller_turn:
                    self.transcript.append({"role": "caller", "text": caller_turn})
                    pending_caller = ""
                    # Check for buy / enroll / admission intent
                    caller_lower = caller_turn.lower()
                    buy_keywords = [
                        # English
                        "want to buy", "buy the course", "buy this course", "buy course",
                        "want to enroll", "enroll in", "enroll now", "enroll karna",
                        "take admission", "take the admission", "ready to join",
                        "purchase the course", "purchase course", "make payment",
                        "send payment link", "pay the fee", "pay fees",
                        # Hindi
                        "admission lena", "admission confirm", "admission process",
                        "join karna", "fees pay karna", "payment karna", "paise kaise dene",
                        "link bhej do", "admission kar do", "admission chahiye",
                        # Marathi
                        "ॲडमिशन", "ऍडमिशन", "प्रवेश घ्यायचा", "प्रवेश", "कोर्स घ्यायचा",
                        "जॉईन करायचा", "फीस भरायची", "फी भरायची", "पेमेंट करायचे",
                        "लिंक पाठवा", "पैसे कसे भरायचे", "प्रवेश निश्चित",
                        # Multilingual
                        "சேர்க்கை", "அட்மிஷன்", "అడ్మిషన్", "చేరాలి", "ಪ್ರವೇಶ",
                        "অ্যাডমিশন", "ভর্তি হতে চাই", "એડમિશન લેવું", "ਦਾਖਲਾ ਲੈਣਾ",
                    ]
                    if any(kw in caller_lower for kw in buy_keywords):
                        logger.info("🎯 Student expressed buying/enrollment intent: '%s'. Guiding Gemini to immediate single-sentence closing.", caller_turn)
                        self._closing_triggered = True

                if asst_turn:
                    self.transcript.append({"role": "assistant", "text": asst_turn})
                    self._opening_greeting_delivered = True
                    pending_assistant = ""
                    asst_lower = asst_turn.lower()
                    # Detect closing sentence only if closing was triggered or explicit farewell was spoken
                    farewell_phrases = [
                        # English
                        "have a great day", "have a wonderful day", "thank you for calling",
                        # Hindi
                        "आपका दिन बहुत शुभ हो", "दिन बहुत शुभ हो", "शुभ दिन",
                        # Marathi
                        "दिवस खूप छान जावो", "मनःपूर्वक धन्यवाद",
                        # Multilingual
                        "நல்ல நாளாக அமையட்டும்", "మీ రోజు శుభం కావాలి", "ಶುಭ ದಿನ", "দিনটি শুভ হোক",
                    ]
                    if self._closing_triggered or any(fp in asst_lower for fp in farewell_phrases):
                        if not self._hangup_task:
                            logger.info("🛑 Closing sentence delivered. Scheduling clean call hangup in 2.2s.")
                            self._hangup_task = asyncio.create_task(self._delayed_call_hangup(delay_seconds=2.2))

    async def _delayed_call_hangup(self, delay_seconds: float = 2.2):
        """
        Allows the single closing sentence audio to fully stream to the caller,
        then cleanly terminates the Plivo telephone call and closes the session.
        Prevents multiple 'bye bye' repetitions and guarantees clean disconnect.
        """
        try:
            await asyncio.sleep(delay_seconds)
            logger.info("📴 Executing clean call disconnect (plivo_call_uuid=%s)", self.plivo_call_uuid)
            if self.is_plivo and self.plivo_call_uuid:
                try:
                    from app.services.plivo_service import get_plivo_client
                    client = get_plivo_client()
                    client.calls.hangup(call_uuid=self.plivo_call_uuid)
                    logger.info("✅ Plivo telephone call hung up cleanly via REST API: %s", self.plivo_call_uuid)
                except Exception as e:
                    logger.warning("Plivo call hangup via REST API: %s", e)
            self._closed = True
            try:
                await self.client_ws.close()
            except Exception:
                pass
            if self._gemini_ws:
                try:
                    await self._gemini_ws.close()
                except Exception:
                    pass
        except Exception as exc:
            logger.warning("Error during delayed call hangup: %s", exc)

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
