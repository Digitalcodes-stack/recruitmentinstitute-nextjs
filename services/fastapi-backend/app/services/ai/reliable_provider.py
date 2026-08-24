import logging

from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ServiceError
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore

logger = logging.getLogger(__name__)


class ReliableAIProvider(AIProvider):
    def __init__(self, primary: AIProvider, fallbacks: list[AIProvider] | None = None) -> None:
        self._primary = primary
        self._fallbacks = fallbacks or []

    async def _call_with_retry(self, fn_name: str, *args, **kwargs):
        providers = [self._primary, *self._fallbacks]
        last_exc: Exception | None = None
        for provider in providers:
            try:
                async for attempt in AsyncRetrying(
                    stop=stop_after_attempt(settings.ai_retry_attempts),
                    wait=wait_exponential(min=settings.ai_retry_min_wait_seconds, max=settings.ai_retry_max_wait_seconds),
                    retry=retry_if_exception_type(Exception),
                    reraise=True,
                ):
                    with attempt:
                        return await getattr(provider, fn_name)(*args, **kwargs)
            except Exception as exc:
                logger.warning("AI provider %s failed for %s after retries: %s", type(provider).__name__, fn_name, exc)
                last_exc = exc
                continue
        raise ServiceError("AI provider unavailable", 503) from last_exc

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        return await self._call_with_retry("analyze_performance", score, percentage, topic_scores)

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        return await self._call_with_retry("generate_questions", context_text, question_types, count)

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        return await self._call_with_retry("generate_notes", topic_name, context_chunks=context_chunks)

    async def generate_study_plan(
        self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None
    ) -> dict:
        return await self._call_with_retry(
            "generate_study_plan", weak_topics, strong_topics, difficulty_breakdown=difficulty_breakdown
        )

    async def generate_recommendations(self, percentage: float) -> list[str]:
        return await self._call_with_retry("generate_recommendations", percentage)

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        return await self._call_with_retry("generate_trainer_recommendations", batch_summary)
