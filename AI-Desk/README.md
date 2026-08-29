# CallMate

**AI Desk — your voice, on every call.**

Create customizable AI Virtual Executives (recruiter, receptionist, sales
agent, etc.) and talk to them live, in the browser, powered by Gemini Live.

Seeded out of the box with **Rupali Patil — Recruitment Coordinator,
DigitalAIML (Pune)**, built for [Rupali Patil](mailto:digitalaimlsystem@gmail.com).

## Stack

- **Backend**: Python 3.12+, FastAPI (async)
- **DB**: PostgreSQL + SQLAlchemy 2.0 (async) + Alembic
- **Voice AI**: Gemini Live (`gemini-3.1-flash-live-preview`) over its `BidiGenerateContent` WebSocket
- **Auth**: JWT (email + password)
- **Admin UI**: single static HTML/JS page (`static/index.html`), no build step — includes a 🎙️ **Talk** button that opens a live mic conversation with an executive
- **Deploy**: Docker + docker-compose

## Project structure

```
ai-desk/
├── app/
│   ├── main.py                  # FastAPI app + router registration
│   ├── config.py                # env-driven settings
│   ├── database.py               # async engine/session
│   ├── models.py                  # SQLAlchemy models (User, VirtualExecutive, Conversation)
│   ├── schemas.py                 # Pydantic request/response models
│   ├── routers/                  # auth, executives, conversations, voice_chat
│   ├── services/                 # prompt_builder, gemini_bridge, voice_chat_orchestrator,
│   │                              # slot_booking, email_service, jd_formatter
│   ├── prompts/                  # hand-tuned reference prompt (Rupali Patil)
│   ├── utils/                    # security (JWT/bcrypt), deps (auth dependency), json_extract
│   └── tests/                    # self-checks (plain asserts, run with `py -m`)
├── alembic/                      # migrations
├── seed/seed_data.py             # seeds demo user + Rupali Patil profile
├── static/index.html             # admin panel (executives + browser voice chat)
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Setup

### 1. Local (no Docker)

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

copy .env.example .env
# edit .env: DATABASE_URL, GEMINI_API_KEY (see below)

# start Postgres yourself, or via docker:
docker compose up -d db

alembic upgrade head
py -m seed.seed_data     # creates rupali@digitalaiml.com / ChangeMe123!

uvicorn app.main:app --reload
```

Open **http://localhost:8000/admin** for the panel, or **http://localhost:8000/docs** for the API.

### 2. Full Docker

```bash
copy .env.example .env
# edit .env with a real GEMINI_API_KEY
docker compose up --build
```

This runs Postgres and the API (auto-migrates on boot). No other services needed.

## Getting a Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API key**, pick or create a Google Cloud project
3. Copy the key into `.env` as `GEMINI_API_KEY`

Keys issued since mid-2026 use a new `AQ.`-prefixed format (replacing the
older `AIzaSy...` format) — either works with this project; both authenticate
via the `key` query parameter on the Live API WebSocket.

## Talking to an executive

1. Log into `/admin` (`rupali@digitalaiml.com` / `ChangeMe123!`).
2. Click **🎙️ Talk** next to an executive.
3. Enter your name (required) and optionally phone/email.
4. Click **Start** and allow microphone access when prompted.
5. Speak naturally — audio streams to Gemini Live in real time and the
   executive's voice plays back through your speakers.
6. Click **Stop** to end the conversation.

The browser captures mic audio, resamples it to 16kHz PCM16 client-side, and
streams it over a WebSocket to `/ws/voice-chat/{executive_id}?caller_name=...`,
which bridges to Gemini Live using that executive's system prompt (built
fresh from its profile on every connection). Gemini's 24kHz PCM16 response
audio streams straight back and plays via the Web Audio API.

When the conversation ends, the caller's identity, full transcript, and
Gemini's structured extraction (interest level, disposition, notes, etc.)
are saved to the `conversations` table. View them under the **Conversations**
tab in `/admin`, or via `GET /api/conversations` / `GET /api/conversations/{id}`.

If the extraction includes `interview_slot_booked` (e.g. "2026-09-02 14:00"),
`app/services/slot_booking.py` matches it against that executive's
`action_slots` (by date, spoken/24h time, or label) and marks the matching
slot `is_booked: true` — so the next caller isn't offered a slot someone
already took.

Two things also happen automatically when a conversation ends (both
best-effort — SMTP being unconfigured or slow never breaks the save):
- If `ADMIN_EMAIL` is set, the full transcript + extracted data is emailed
  there automatically — no button click needed.
- If the extraction's `disposition` is `interested` or `slot_booked` **and**
  the caller gave an email, that executive's JD is automatically emailed to
  the caller. Not-interested calls or callers with no email on file are
  skipped (logged, not sent).

No phone numbers, no telephony provider, no per-call cost beyond your Gemini
API usage — this is a voice-chat demo tool, not an outbound dialer.

From the **Conversations** tab you can also:
- **🗑 Delete** a conversation permanently
- **✉ Email** it (full transcript + extracted data) to any address — needs SMTP configured, see below
- **💬 WhatsApp** it — opens `wa.me` with the transcript pre-filled to the caller's number; you send it yourself from WhatsApp

## Sending emails (SMTP)

"Send via Email" (conversations and JDs) needs real SMTP credentials in
`.env`. For Gmail:

1. Turn on 2-Step Verification on the Google account, if not already on
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password (16 characters, no spaces needed when pasting)
4. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=youraddress@gmail.com
   SMTP_PASS=<the 16-char app password>
   EMAIL_FROM=youraddress@gmail.com
   EMAIL_FROM_NAME=AI Desk
   ```
   `SMTP_SECURE=true` + port `465` is implicit SSL. `SMTP_SECURE=false` +
   port `587` is STARTTLS instead — pick one pairing, don't mix them
   (`app/services/email_service.py` branches on `SMTP_SECURE` to pick the
   right connection type).

Optionally set `EMAIL_CC` (comma-separated addresses) to CC every outgoing
email — e.g. your own inbox, so you see a copy of everything sent. Gmail
SMTP is send-only; there's no inbound/receiving integration, so `EMAIL_CC`
is how you keep a record, not a real "receiving" channel.

Without `SMTP_USER`/`SMTP_PASS` set, "Send via Email" returns a clear `503`
error rather than failing silently or crashing.

## Sending a Job Description (JD)

From the **executives** page, each executive has a **Send JD ▾** menu:
- **✉ Email** — formats that executive's Products/Services/Open Roles entries
  into a plain-text JD and emails it (same SMTP setup as above)
- **💬 WhatsApp** — same JD text, opens `wa.me` for you to send manually

There's no separate JD field — it's built from that executive's
**Products / Services / Open Roles**, edited on the executive's Edit form:

- **Title | Description** — the quick one-line summary (existing textarea)
- **Detailed JD Content** — an optional second textarea for real JD depth:
  salary range, responsibilities, requirements, one block per role, matched
  back to a role above by title:
  ```
  ### Backend Engineer
  Salary: 18-28 LPA
  Responsibilities:
  - Design and build scalable REST APIs
  - Own database schema design
  Requirements:
  - 3-6 years Python experience
  - PostgreSQL
  ```
  A role with no detail block still works — the JD just falls back to its
  short description. See `app/services/jd_formatter.py`.

## The prompt engine

`app/services/prompt_builder.py::build_system_prompt(executive)` turns any
`VirtualExecutive` row into a full realtime-voice-agent system prompt:
identity, voice/language rules, goals, scope, strict don'ts, conversation
flow, situational handling, FAQs, available slots, business hours, and the
structured-data-extraction contract. `app/prompts/rupali_patil_master_prompt.py`
is a separate, standalone example: a fully fixed, hand-scripted prompt for one
specific screening call (single role, literal slots, literal lines) — useful
as a second reference point when tuning the builder's tone, but not wired
into the app; the live system always uses `build_system_prompt`.

Preview any executive's live prompt via `/admin` → **Prompt** button, or
`GET /api/executives/{id}/prompt-preview`.

## Environment variables

See `.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (asyncpg driver) |
| `GEMINI_API_KEY` | Gemini Live API access — see "Getting a Gemini API key" above |
| `GEMINI_LIVE_MODEL` | Live API model name (default `gemini-3.1-flash-live-preview`) |
| `JWT_SECRET` | Sign/verify auth tokens — change in production |

## Tests

No pytest dependency — each service with real branching logic ships a
plain-assert self-check runnable directly:

```bash
py -m app.tests.test_prompt_builder
py -m app.tests.test_json_extract
py -m app.tests.test_gemini_bridge
py -m app.tests.test_slot_booking
py -m app.tests.test_jd_formatter
py -m app.tests.test_conversation_formatter
```

## Known simplifications (ponytail-flagged, intentional)

- **Auto-JD "interested" gate is fixed to `disposition in {interested,
  slot_booked}`** (`app/services/voice_chat_orchestrator.py`,
  `_INTERESTED_DISPOSITIONS`) — not configurable per executive. If some
  executives should auto-send on a different signal, add a field for it
  instead of editing the constant.
- **WhatsApp sending is a manual `wa.me` deep link, not the Business API** —
  it opens WhatsApp Web/app with the number and message pre-filled; you still
  click Send yourself. Real automated WhatsApp sending needs Business API
  verification (Meta or a provider like Twilio) — add that if you need
  fire-and-forget sending later.
- **Email sending has no retry/queue** — `send_email()` is a synchronous
  blocking SMTP call inline in the request; a slow/down mail server stalls
  that request. Fine at this scale; move to a background task if email
  volume grows.
- **Caller identity is self-reported, unverified** — the caller types their
  own name/phone/email into the Talk modal before the mic opens; nothing
  confirms it's accurate (no OTP/verification step). Fine for an internal
  demo tool; add verification before treating this as an audit trail.
- **Gemini Live audio resampling uses stdlib `audioop`** (browser rate ->
  16kHz PCM16 for Gemini input). `audioop` is deprecated and removed in
  Python 3.13+; if this project upgrades off 3.12, swap in the
  `audioop-lts` backport or a small numpy resampler.
- **Browser-side resampling is linear interpolation** (`static/index.html`,
  `resampleTo()`) — good enough for speech, not broadcast-quality; swap for
  a proper windowed-sinc resampler if audio fidelity becomes an issue.
- **`gemini_bridge.py`'s output leg does no resampling** — Gemini's 24kHz
  output plays directly via the Web Audio API's `AudioContext({sampleRate:
  24000})`, relying on the browser to handle final audio-device rate
  conversion, which all modern browsers do.
