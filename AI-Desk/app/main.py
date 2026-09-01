"""CallMate (AI Desk) — FastAPI application entrypoint."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, conversations, executives, voice_chat

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("aidesk")

app = FastAPI(
    title="CallMate — AI Desk, your voice on every call",
    description="Create AI Virtual Executives and talk to them live, in the browser, via Gemini Live.",
    version="2.0.0",
)

# The admin panel is served same-origin (from /admin on this same app), so no
# cross-origin CORS is needed for normal use — kept permissive only in DEBUG
# for local tooling (curl, alternate dev ports, etc.).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://recruitmentinstitute.in",
        "https://www.recruitmentinstitute.in",
        "http://localhost:3000",
        "http://localhost:8000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import User, VirtualExecutive, Conversation

app.include_router(auth.router)
app.include_router(executives.router)
app.include_router(conversations.router)
app.include_router(voice_chat.router)


@app.get("/admin", include_in_schema=False)
async def admin_redirect():
    return RedirectResponse(url="/admin/")


@app.get("/database", response_class=HTMLResponse, tags=["database"])
async def view_database_in_browser():
    async with AsyncSessionLocal() as db:
        users = (await db.scalars(select(User))).all()
        execs = (await db.scalars(select(VirtualExecutive))).all()
        convs = (await db.scalars(select(Conversation))).all()

    exec_cards = ""
    for e in execs:
        courses_html = "".join(f"<li style='margin-bottom:6px;'><strong>{c.get('title')}</strong><br/><span style='color:#555;'>{c.get('description','')}</span></li>" for c in e.products_services)
        faqs_html = "".join(f"<li style='margin-bottom:6px;'><strong>Q: {f.get('question')}</strong><br/><span style='color:#2b6cb0;'>A: {f.get('answer','')}</span></li>" for f in e.faqs)
        slots_list = []
        for s in e.action_slots:
            status_tag = '<span style="color:#e53e3e;">[Booked]</span>' if s.get('is_booked') else '<span style="color:#38a169;">[Available]</span>'
            slots_list.append(f"<li>{s.get('label')} — <em>{s.get('date')} ({s.get('start_time')}-{s.get('end_time')})</em> {status_tag}</li>")
        slots_html = "".join(slots_list)

        exec_cards += f"""
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06);">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #edf2f7;padding-bottom:12px;margin-bottom:16px;">
                <div>
                    <h3 style="margin:0 0 4px;font-size:20px;color:#1a202c;">{e.name} <span style="font-size:14px;color:#4a5568;font-weight:normal;">({e.role})</span></h3>
                    <span style="background:#ebf8ff;color:#2b6cb0;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">Company: {e.company}</span>
                    <span style="background:#f0fff4;color:#276749;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;margin-left:6px;">Status: {'Active' if e.is_active else 'Inactive'}</span>
                </div>
                <div style="font-family:monospace;font-size:12px;color:#718096;background:#f7fafc;padding:6px 12px;border-radius:6px;">ID: {e.id}</div>
            </div>
            <p style="margin:0 0 12px;font-size:14px;color:#4a5568;"><strong>📍 Location:</strong> {e.address or 'N/A'}</p>
            <p style="margin:0 0 16px;font-size:14px;color:#4a5568;"><strong>🗣️ Introduction:</strong> <em>"{e.introduction}"</em></p>
            <p style="margin:0 0 16px;font-size:14px;color:#4a5568;"><strong>🌐 Languages:</strong> {', '.join(e.languages)}</p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">
                <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #edf2f7;">
                    <h4 style="margin:0 0 10px;color:#2d3748;font-size:15px;">📚 Configured Courses ({len(e.products_services)})</h4>
                    <ul style="padding-left:18px;margin:0;font-size:13px;line-height:1.5;">{courses_html}</ul>
                </div>
                <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #edf2f7;">
                    <h4 style="margin:0 0 10px;color:#2d3748;font-size:15px;">❓ Knowledge & FAQs ({len(e.faqs)})</h4>
                    <ul style="padding-left:18px;margin:0;font-size:13px;line-height:1.5;">{faqs_html}</ul>
                </div>
            </div>

            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #edf2f7;margin-top:16px;">
                <h4 style="margin:0 0 10px;color:#2d3748;font-size:15px;">📅 Bookable Demo & Counselling Slots ({len(e.action_slots)})</h4>
                <ul style="padding-left:18px;margin:0;font-size:13px;line-height:1.5;">{slots_html}</ul>
            </div>
        </div>
        """

    users_rows = "".join(f"<tr><td style='padding:10px;border-bottom:1px solid #edf2f7;font-family:monospace;font-size:12px;'>{u.id}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;font-weight:600;'>{u.email}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{u.full_name}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'><span style='color:#38a169;font-weight:600;'>{'Active' if u.is_active else 'Inactive'}</span></td></tr>" for u in users)

    convs_rows = "".join(f"<tr><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{c.caller_name}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{c.caller_phone or '-'}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{c.caller_email or '-'}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{c.started_at.strftime('%Y-%m-%d %H:%M') if c.started_at else '-'}</td><td style='padding:10px;border-bottom:1px solid #edf2f7;'>{len(c.transcript or [])} turns</td></tr>" for c in convs) or "<tr><td colspan='5' style='padding:20px;text-align:center;color:#a0aec0;'>No calls recorded yet</td></tr>"

    html = f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>AI Desk Database Viewer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f7fafc; color: #2d3748; margin: 0; padding: 30px 20px; }}
        .container {{ max-width: 1100px; margin: 0 auto; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }}
        .badge {{ background: #4f3cc9; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; text-decoration: none; }}
        .nav-btn {{ background: #fff; border: 1px solid #cbd5e0; color: #4a5568; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; margin-left: 8px; }}
        .nav-btn:hover {{ background: #edf2f7; }}
        table {{ width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }}
        th {{ background: #edf2f7; text-align: left; padding: 12px 10px; font-size: 13px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 style="margin:0 0 6px;font-size:26px;color:#1a202c;">🗄️ AI Desk Database Viewer</h1>
                <p style="margin:0;font-size:14px;color:#718096;">Connected to PostgreSQL (Database: <strong>aidesk</strong>)</p>
            </div>
            <div>
                <a href="/admin/" class="badge">Go to Admin Panel &rarr;</a>
                <a href="/docs" class="nav-btn">Swagger API Docs</a>
            </div>
        </div>

        <h2 style="font-size:18px;margin:28px 0 12px;color:#2d3748;">👤 Admin Users (Table: <code>users</code>)</h2>
        <table>
            <thead><tr><th>User ID</th><th>Email</th><th>Full Name</th><th>Status</th></tr></thead>
            <tbody>{users_rows}</tbody>
        </table>

        <h2 style="font-size:18px;margin:32px 0 12px;color:#2d3748;">🤖 Virtual Executives (Table: <code>virtual_executives</code>)</h2>
        {exec_cards}

        <h2 style="font-size:18px;margin:32px 0 12px;color:#2d3748;">📞 Voice Conversations (Table: <code>conversations</code>)</h2>
        <table>
            <thead><tr><th>Caller</th><th>Phone</th><th>Email</th><th>Call Date</th><th>Transcript</th></tr></thead>
            <tbody>{convs_rows}</tbody>
        </table>
    </div>
</body>
</html>"""
    return HTMLResponse(content=html)


app.mount("/admin", StaticFiles(directory="static", html=True), name="admin")


@app.get("/", tags=["health"])
async def root():
    return {"app": settings.APP_NAME, "status": "ok", "admin_panel": "/admin/", "database_viewer": "/database"}


@app.get("/api/public/voice-leads", tags=["leads"])
async def get_public_voice_leads():
    """Provides consolidated AI Desk conversation transcripts, summaries, and slots to the main admin hub."""
    async with AsyncSessionLocal() as db:
        execs = (await db.scalars(select(VirtualExecutive))).all()
        convs = (await db.scalars(select(Conversation).order_by(Conversation.started_at.desc()).limit(150))).all()

    priya = execs[0] if execs else None
    slots = priya.action_slots if priya and priya.action_slots else []

    formatted_convs = []
    for c in convs:
        dur = 0
        if c.started_at and c.ended_at:
            dur = max(0, int((c.ended_at - c.started_at).total_seconds()))
        formatted_convs.append({
            "id": str(c.id),
            "executive_id": str(c.executive_id),
            "caller_name": c.caller_name or "Candidate",
            "caller_phone": c.caller_phone or "",
            "caller_email": c.caller_email or "",
            "started_at": c.started_at.isoformat() if c.started_at else None,
            "ended_at": c.ended_at.isoformat() if c.ended_at else None,
            "duration_seconds": dur,
            "extracted_data": c.extracted_data or {},
            "transcript": c.transcript or [],
        })

    return {
        "executive": {
            "id": str(priya.id) if priya else None,
            "name": priya.name if priya else "Priya",
            "role": priya.role if priya else "Senior Career Counsellor",
            "company": priya.company if priya else "Recruitment Institute",
            "phone": "+91-7385204165",
        } if priya else None,
        "slots": slots,
        "conversations": formatted_convs,
    }


@app.post("/api/public/voice-leads/slots/toggle", tags=["leads"])
async def toggle_slot_booking(data: dict):
    """Allows Superadmin to toggle slot booking status (e.g. release a booked slot or manually book a slot)."""
    slot_index = data.get("slot_index")
    is_booked = bool(data.get("is_booked", False))
    candidate_name = data.get("booked_by_name") or ""
    candidate_phone = data.get("booked_by_phone") or ""
    candidate_email = data.get("booked_by_email") or ""

    async with AsyncSessionLocal() as db:
        execs = (await db.scalars(select(VirtualExecutive))).all()
        if not execs:
            return JSONResponse({"error": "No executive found"}, status_code=404)
        priya = execs[0]
        slots = list(priya.action_slots or [])
        if slot_index is None or slot_index < 0 or slot_index >= len(slots):
            return JSONResponse({"error": "Invalid slot index"}, status_code=400)

        target = dict(slots[slot_index])
        target["is_booked"] = is_booked
        if is_booked:
            target["booked_by_name"] = candidate_name or "Manually Booked by Admin"
            target["booked_by_phone"] = candidate_phone
            target["booked_by_email"] = candidate_email
            target["booked_at"] = datetime.now(timezone.utc).isoformat()
        else:
            target["booked_by_name"] = None
            target["booked_by_phone"] = None
            target["booked_by_email"] = None
            target["booked_at"] = None

        slots[slot_index] = target
        priya.action_slots = slots
        await db.commit()

    return {"success": True, "slots": slots}


@app.post("/api/public/voice-leads/slots/add", tags=["leads"])
async def add_new_slot(data: dict):
    """Allows Superadmin to create a new demo/counselling slot for Priya to offer."""
    label = data.get("label", "").strip()
    date_str = data.get("date", "").strip()
    start_time = data.get("start_time", "").strip()
    end_time = data.get("end_time", "").strip()

    if not label or not start_time:
        return JSONResponse({"error": "Label and start_time are required"}, status_code=400)

    new_slot = {
        "label": label,
        "date": date_str or datetime.now().strftime("%Y-%m-%d"),
        "start_time": start_time,
        "end_time": end_time or start_time,
        "is_booked": False,
    }

    async with AsyncSessionLocal() as db:
        execs = (await db.scalars(select(VirtualExecutive))).all()
        if not execs:
            return JSONResponse({"error": "No executive found"}, status_code=404)
        priya = execs[0]
        slots = list(priya.action_slots or [])
        slots.append(new_slot)
        priya.action_slots = slots
        await db.commit()

    return {"success": True, "slots": slots}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


@app.on_event("startup")
async def on_startup():
    logger.info("%s starting up (env=%s)", settings.APP_NAME, settings.ENV)

