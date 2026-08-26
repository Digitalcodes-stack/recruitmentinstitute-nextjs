import json
import logging
from typing import Any

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.providers.prompts import (
    ANALYSIS_SCHEMA,
    QUESTIONS_SCHEMA,
    RECOMMENDATIONS_SCHEMA,
    STUDY_PLAN_SCHEMA,
    SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


class ClaudeProviderError(Exception):
    """Raised when ClaudeProvider fails to generate or parse response."""
    pass


class ClaudeProvider(AIProvider):
    def __init__(self) -> None:
        self._api_key = settings.claude_api_key
        self._model = settings.claude_model or "claude-3-5-sonnet-20241022"
        self._client: Any = None

    def _get_client(self):
        if not self._api_key:
            raise ClaudeProviderError("CLAUDE_API_KEY (or ANTHROPIC_API_KEY) is not configured")
        if self._client is None:
            try:
                from anthropic import AsyncAnthropic
                self._client = AsyncAnthropic(api_key=self._api_key)
            except ImportError as e:
                raise ClaudeProviderError("The 'anthropic' package is not installed.") from e
        return self._client

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        client = self._get_client()
        prompt = (
            f"Generate {count} assessment questions based on the following course material context:\n\n"
            f"{context_text}\n\n"
            f"Allowed question types: {', '.join(question_types)}. "
            "For mcq, provide 4 options. Ensure the correct_answer matches one of the options for mcq or is a boolean for true_false."
        )
        response = await client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": f"{prompt}\n\nStrictly output valid JSON matching this schema: {json.dumps(QUESTIONS_SCHEMA)}",
            }],
        )
        content_text = response.content[0].text
        data = json.loads(content_text)
        return data["questions"]

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        client = self._get_client()
        topic_lines = "\n".join(f"- {t.topic_name}: {t.correct}/{t.total} correct ({t.percentage:.1f}%)" for t in topic_scores)
        response = await client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Score: {score}, Percentage: {percentage:.1f}%\n"
                    f"Topic breakdown:\n{topic_lines}\n\n"
                    f"Analyze this performance. Output valid JSON matching schema: {json.dumps(ANALYSIS_SCHEMA)}"
                ),
            }],
        )
        content_text = response.content[0].text
        data = json.loads(content_text)
        return PerformanceAnalysis(
            strong_topics=data.get("strong_topics", []),
            weak_topics=data.get("weak_topics", []),
            difficulty_breakdown=data.get("difficulty_breakdown", {}),
            summary=data.get("summary", ""),
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        client = self._get_client()
        context_block = ""
        if context_chunks:
            joined = "\n\n".join(context_chunks)
            context_block = f"\n\nUse the following course material as grounding context where relevant:\n{joined}\n"
        response = await client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Generate personalized study notes for the weak topic: {topic_name}\n\n"
                    "Include the following section headers:\n"
                    "### Overview\n"
                    "### Key Concepts\n"
                    "### Practice Questions\n"
                    f"Format as markdown.{context_block}"
                ),
            }],
        )
        return response.content[0].text

    async def generate_study_plan(
        self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None
    ) -> dict:
        client = self._get_client()
        response = await client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
                    f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
                    f"Generate a 5-day study plan focused on reinforcing weak topics. "
                    f"Output valid JSON matching schema: {json.dumps(STUDY_PLAN_SCHEMA)}"
                ),
            }],
        )
        content_text = response.content[0].text
        return json.loads(content_text)

    async def generate_recommendations(self, percentage: float) -> list[str]:
        client = self._get_client()
        if percentage > 85:
            bucket = "Advanced Learning Path, Advanced Projects, Mock Interviews"
        elif percentage >= 60:
            bucket = "Revision Notes, Practice Questions, Topic Reinforcement"
        else:
            bucket = "Remedial Training, Additional Notes, Extra Practice Tests, Trainer Guidance"
        response = await client.messages.create(
            model=self._model,
            max_tokens=1024,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. "
                    f"Produce 3-5 specific, actionable recommendations. "
                    f"Output valid JSON matching schema: {json.dumps(RECOMMENDATIONS_SCHEMA)}"
                ),
            }],
        )
        content_text = response.content[0].text
        return json.loads(content_text)["recommendations"]

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        client = self._get_client()
        response = await client.messages.create(
            model=self._model,
            max_tokens=1024,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Batch summary: {json.dumps(batch_summary)}\n\n"
                    f"Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes. "
                    f"Output valid JSON matching schema: {json.dumps(RECOMMENDATIONS_SCHEMA)}"
                ),
            }],
        )
        content_text = response.content[0].text
        return json.loads(content_text)["recommendations"]
