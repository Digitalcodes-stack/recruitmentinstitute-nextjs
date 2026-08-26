from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recruitment Institute FastAPI"
    app_env: str = "development"
    app_debug: bool = True
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    database_url: str
    redis_url: str | None = None
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    refresh_token_expire_days: int = 30
    nextjs_service_url: str | None = None
    service_api_key: str | None = None
    redis_broker_url: str | None = None
    redis_backend_url: str | None = None
    redis_blacklist_db: int = 2
    email_enabled: bool = True
    smtp_host: str | None = "serenity.herosite.pro"
    smtp_port: int = 587
    smtp_username: str | None = "support@recruitmentinstitute.in"
    smtp_password: str | None = "support@recruitmentinstitute"
    smtp_from_email: str | None = "support@recruitmentinstitute.in"
    smtp_from_name: str = "Recruitment Institute"
    smtp_use_tls: bool = True
    smtp_cc_email: str | None = "sesasiba.es@gmail.com"
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_refresh_token: str | None = None
    google_calendar_id: str = "primary"
    ai_provider: str = "gemini"
    ai_provider_fallback_order: str = "gemini,local_ai,claude,openai"
    ai_retry_attempts: int = 3
    ai_retry_min_wait_seconds: float = 1.5
    ai_retry_max_wait_seconds: float = 6.0
    gemini_api_key: str | None = None
    gemini_model_primary: str = "gemini-3.6-flash"
    gemini_model_overflow: str = "gemini-3.5-flash"
    gemini_temperature: float = 0.2

    claude_api_key: str | None = None
    claude_model: str = "claude-3-5-sonnet-20241022"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    ollama_base_url: str | None = None
    ollama_model_name: str = "qwen3:8b"
    ollama_temperature: float = 0.15

    @property
    def ollama_model(self) -> str:
        return self.ollama_model_name

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
