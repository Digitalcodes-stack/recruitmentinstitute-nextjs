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
if settings.DEBUG:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router)
app.include_router(executives.router)
app.include_router(conversations.router)
app.include_router(voice_chat.router)

app.mount("/admin", StaticFiles(directory="static", html=True), name="admin")


@app.get("/", tags=["health"])
async def root():
    return {"app": settings.APP_NAME, "status": "ok", "admin_panel": "/admin"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}


@app.on_event("startup")
async def on_startup():
    logger.info("%s starting up (env=%s)", settings.APP_NAME, settings.ENV)
