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
async def test_health_check_reports_local_ai_as_always_configured():
    result = await check_provider_health()

    assert result["local_ai"]["configured"] is True
    assert result["local_ai"]["reachable"] is True
    assert "gemini" in result
    assert result["gemini"]["configured"] is bool(settings.gemini_api_key)
    assert "local_llm" in result
    assert result["local_llm"]["configured"] is bool(settings.ollama_base_url)


@pytest.mark.anyio
async def test_reliable_provider_falls_back_from_local_llm_to_local_ai_on_connect_error(monkeypatch):
    import httpx
    from app.services.ai.providers.local_ai_provider import LocalAIProvider
    from app.services.ai.providers.local_llm_provider import LocalLLMProvider

    async def mock_connect_error(*args, **kwargs):
        raise httpx.ConnectError("Ollama connection refused", request=httpx.Request("POST", "http://localhost:11434/api/chat"))

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_connect_error)
    monkeypatch.setattr(
        "app.services.ai.providers.local_ai_provider._summarize_text",
        lambda text: "Summarized: " + text[:30],
    )

    llm_provider = LocalLLMProvider()
    offline_provider = LocalAIProvider()
    reliable = ReliableAIProvider(primary=llm_provider, fallbacks=[offline_provider])

    result = await reliable.generate_notes("Boolean Search", context_chunks=["Boolean search uses AND OR NOT operators."])

    assert "Boolean Search" in result or "Summarized" in result


@pytest.mark.anyio
async def test_reliable_provider_falls_back_from_local_llm_to_local_ai_on_validation_failure(monkeypatch):
    import httpx
    from app.services.ai.providers.local_ai_provider import LocalAIProvider
    from app.services.ai.providers.local_llm_provider import LocalLLMProvider

    async def mock_invalid_post(*args, **kwargs):
        return httpx.Response(
            200,
            json={"message": {"role": "assistant", "content": "malformed invalid non-json"}},
            request=httpx.Request("POST", "http://localhost:11434/api/chat"),
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_invalid_post)
    monkeypatch.setattr(
        "app.services.ai.question_generator._extract_key_terms",
        lambda text, top_n=15: ["sourcing", "screening", "onboarding", "interview"],
    )

    llm_provider = LocalLLMProvider()
    offline_provider = LocalAIProvider()
    reliable = ReliableAIProvider(primary=llm_provider, fallbacks=[offline_provider])

    context = "Sourcing is the first step in talent acquisition and candidate pipelining."
    questions = await reliable.generate_questions(context, ["mcq"], count=1)

    assert len(questions) == 1
    assert questions[0]["question_type"] == "mcq"
    assert len(questions[0]["options"]) == 4


@pytest.mark.anyio
async def test_reliable_provider_gemini_flash_429_overflow_flash_lite_then_local_ai(monkeypatch):
    from unittest.mock import AsyncMock, MagicMock
    from google.genai import errors
    from app.services.ai.providers.gemini_provider import GeminiProvider
    from app.services.ai.providers.local_ai_provider import LocalAIProvider

    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    monkeypatch.setattr(settings, "gemini_model_primary", "gemini-2.5-flash")
    monkeypatch.setattr(settings, "gemini_model_overflow", "gemini-2.5-flash-lite")

    invoked_models: list[str] = []

    async def mock_generate_content(model, contents, config):
        invoked_models.append(model)
        # Both Flash and Flash-Lite return 429 quota exhausted
        raise errors.APIError(429, f"Quota exhausted on {model}")

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=mock_generate_content)

    gemini_prov = GeminiProvider()
    gemini_prov._client = mock_client
    offline_prov = LocalAIProvider()

    monkeypatch.setattr(
        "app.services.ai.providers.local_ai_provider._summarize_text",
        lambda text: "Summarized: " + text[:30],
    )

    reliable = ReliableAIProvider(primary=gemini_prov, fallbacks=[offline_prov])

    result = await reliable.generate_notes("Boolean Sourcing", context_chunks=["Boolean search uses AND OR NOT operators."])

    # Verify fallback chain invoked flash then flash-lite
    assert "gemini-2.5-flash" in invoked_models
    assert "gemini-2.5-flash-lite" in invoked_models
    # Assert NO Pro model appears anywhere in the call chain
    for model in invoked_models:
        assert "pro" not in model.lower()

    # Assert LocalAIProvider returned a successful result
    assert "Boolean Sourcing" in result or "Summarized" in result
