import pytest

from app.core.config import settings
from app.core.exceptions import ServiceError
from app.services.ai.ai_service import check_provider_health
from app.services.ai.reliable_provider import ReliableAIProvider


class FlakyProvider:
    def __init__(self) -> None:
        self.calls = 0

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        self.calls += 1
        raise RuntimeError("primary down")


class FailingProvider:
    def __init__(self) -> None:
        self.calls = 0

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        self.calls += 1
        raise RuntimeError("fallback down too")


class FakeProvider:
    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        return f"# Notes for {topic_name}"


@pytest.fixture(autouse=True)
def fast_retries(monkeypatch):
    monkeypatch.setattr(settings, "ai_retry_attempts", 2)
    monkeypatch.setattr(settings, "ai_retry_min_wait_seconds", 0.0)
    monkeypatch.setattr(settings, "ai_retry_max_wait_seconds", 0.0)


@pytest.mark.anyio
async def test_reliable_provider_falls_back_after_primary_exhausts_retries():
    flaky = FlakyProvider()
    fake = FakeProvider()
    provider = ReliableAIProvider(primary=flaky, fallbacks=[fake])

    result = await provider.generate_notes("OOP")

    assert result == "# Notes for OOP"
    assert flaky.calls == settings.ai_retry_attempts


@pytest.mark.anyio
async def test_reliable_provider_raises_service_error_when_all_providers_fail():
    flaky = FlakyProvider()
    failing = FailingProvider()
    provider = ReliableAIProvider(primary=flaky, fallbacks=[failing])

    with pytest.raises(ServiceError) as exc_info:
        await provider.generate_notes("OOP")

    assert exc_info.value.status_code == 503


@pytest.mark.anyio
async def test_health_check_reports_configured_vs_unconfigured(monkeypatch):
    monkeypatch.setattr(settings, "claude_api_key", None)
    monkeypatch.setattr(settings, "openai_api_key", "sk-test")

    result = await check_provider_health()

    assert result["claude"]["configured"] is False
    assert result["openai"]["configured"] is True
