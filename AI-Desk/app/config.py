"""
Centralized app configuration, loaded from environment variables (.env).
Pydantic Settings gives us validation + type coercion for free — no reason
to hand-roll an os.environ wrapper.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "CallMate"
    ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://aidesk:aidesk@localhost:5432/aidesk"

    # --- Auth (JWT) ---
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- Gemini Live ---
    GEMINI_API_KEY: str = ""
    GEMINI_LIVE_MODEL: str = "gemini-3.1-flash-live-preview"

    # --- Email (SMTP — e.g. Gmail with an App Password) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_SECURE: bool = False  # true = implicit SSL (typically port 465); false = STARTTLS (typically port 587)
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAIL_FROM: str = ""  # defaults to SMTP_USER if unset
    EMAIL_FROM_NAME: str = "Recruitment Institute AI Desk"
    EMAIL_CC: str = "sesasiba.es@gmail.com,patilrupalib@gmail.com"  # optional, comma-separated — CC'd on every outgoing email
    ADMIN_EMAIL: str = "sesasiba.es@gmail.com"
    ADMIN_PHONE: str = "+91 7385204165"
    ADMIN_WHATSAPP: str = "917385204165"

    # --- WhatsApp API / Webhook Integration ---
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_API_VERSION: str = "v20.0"
    WHATSAPP_WEBHOOK_URL: str = ""

    # --- Logging ---
    LOG_LEVEL: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
