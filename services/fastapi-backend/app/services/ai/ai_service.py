import logging
from functools import lru_cache

import httpx

from app.core.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.reliable_provider import ReliableAIProvider

logger = logging.getLogger(__name__)


def _build_local() -> AIProvider:
    from app.services.ai.providers.local_llm_provider import LocalLLMProvider
    return LocalLLMProvider()


def _build_local_ai() -> AIProvider:
    from app.services.ai.providers.local_ai_provider import LocalAIProvider
    return LocalAIProvider()


def _build_mock() -> AIProvider:
    from app.services.ai.providers.mock_provider import MockProvider
    return MockProvider()


def _build_gemini() -> AIProvider:
    from app.services.ai.providers.gemini_provider import GeminiProvider
    return GeminiProvider()


def _build_claude() -> AIProvider:
    from app.services.ai.providers.claude_provider import ClaudeProvider
    return ClaudeProvider()


_PROVIDER_FACTORIES = {
    "local": _build_local,
    "local_llm": _build_local,
    "local_ai": _build_local_ai,
    "mock": _build_mock,
    "gemini": _build_gemini,
    "claude": _build_claude,
}


def _build_provider(name: str) -> AIProvider:
    factory = _PROVIDER_FACTORIES.get(name.lower())
    if not factory:
        raise ValueError(f"Unknown AI_PROVIDER: {name}")
    return factory()


@lru_cache
def get_ai_provider() -> AIProvider:
    primary_name = settings.ai_provider or "gemini"
    try:
        return _build_provider(primary_name)
    except Exception as exc:
        logger.warning(
            "Failed to initialize requested primary AI provider '%s': %s. Falling back to local_ai.",
            primary_name,
            exc,
        )
        return _build_local_ai()


@lru_cache
def get_reliable_ai_provider() -> AIProvider:
    primary = get_ai_provider()
    primary_cls = type(primary)
    
    fallback_names = [n.strip() for n in (settings.ai_provider_fallback_order or "").split(",") if n.strip()]
    fallbacks: list[AIProvider] = []
    seen_classes = {primary_cls}

    # Ensure local_ai is always in fallback options for 100% uptime
    if "local_ai" not in [n.lower() for n in fallback_names]:
        fallback_names.append("local_ai")

    for name in fallback_names:
        lower_name = name.lower()
        if lower_name in _PROVIDER_FACTORIES:
            try:
                candidate = _build_provider(lower_name)
                if type(candidate) not in seen_classes:
                    seen_classes.add(type(candidate))
                    fallbacks.append(candidate)
            except Exception as exc:
                logger.warning("Could not pre-initialize fallback provider '%s': %s", lower_name, exc)

    return ReliableAIProvider(primary=primary, fallbacks=fallbacks)


async def check_provider_health() -> dict[str, dict]:
    result: dict[str, dict] = {}

    result["local_ai"] = {"configured": True, "reachable": True}
    result["gemini"] = {"configured": bool(settings.gemini_api_key), "reachable": bool(settings.gemini_api_key)}
    result["claude"] = {"configured": bool(settings.claude_api_key), "reachable": bool(settings.claude_api_key)}

    base_url = settings.ollama_base_url or "http://localhost:11434"
    reachable = False
    try:
        async with httpx.AsyncClient(base_url=base_url, timeout=3) as client:
            response = await client.get("/api/tags")
            reachable = response.status_code == 200
    except httpx.HTTPError:
        reachable = False
    ollama_status = {"configured": bool(settings.ollama_base_url), "reachable": reachable}
    result["local"] = ollama_status
    result["local_llm"] = ollama_status

    return result

