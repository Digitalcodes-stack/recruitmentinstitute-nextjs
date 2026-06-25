import json

from google import genai
from google.genai import types

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.providers.claude_provider import (
    ANALYSIS_SCHEMA,
    RECOMMENDATIONS_SCHEMA,
    STUDY_PLAN_SCHEMA,
    SYSTEM_PROMPT,
)


class GeminiProvider(AIProvider):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._model = settings.gemini_model

    async def _json_completion(self, user_content: str, schema: dict, max_tokens: int) -> dict:
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=user_content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=max_tokens,
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return json.loads(response.text)

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        from app.services.ai.providers.claude_provider import QUESTIONS_SCHEMA
        prompt = (
            f"Generate {count} assessment questions based on the following course material context:\n\n"
            f"{context_text}\n\n"
            f"Allowed question types: {', '.join(question_types)}. "
            "For mcq, provide 4 options. Ensure the correct_answer matches one of the options for mcq or is a boolean for true_false."
        )
        data = await self._json_completion(prompt, QUESTIONS_SCHEMA, 2048)
        return data["questions"]

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        topic_lines = "\n".join(f"- {t.topic_name}: {t.correct}/{t.total} correct ({t.percentage:.1f}%)" for t in topic_scores)
        data = await self._json_completion(
            f"Score: {score}, Percentage: {percentage:.1f}%\nTopic breakdown:\n{topic_lines}\n\nAnalyze this performance.",
            ANALYSIS_SCHEMA,
            1024,
        )
        return PerformanceAnalysis(
            strong_topics=data["strong_topics"],
            weak_topics=data["weak_topics"],
            difficulty_breakdown=data["difficulty_breakdown"],
            summary=data["summary"],
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        context_block = ""
        if context_chunks:
            joined = "\n\n".join(context_chunks)
            context_block = f"\n\nUse the following course material as grounding context where relevant:\n{joined}\n"
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=(
                f"Generate personalized study notes for the weak topic: {topic_name}\n\n"
                "Include: a simplified explanation, key concepts, important points, "
                "3-5 interview questions, 3-5 practice questions, and a real-world example. "
                f"Format as markdown.{context_block}"
            ),
            config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, max_output_tokens=2048),
        )
        return response.text

    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        return await self._json_completion(
            f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
            f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
            "Generate a 5-day study plan focused on reinforcing the weak topics.",
            STUDY_PLAN_SCHEMA,
            512,
        )

    async def generate_recommendations(self, percentage: float) -> list[str]:
        if percentage > 85:
            bucket = "Advanced Learning Path, Advanced Projects, Mock Interviews"
        elif percentage >= 60:
            bucket = "Revision Notes, Practice Questions, Topic Reinforcement"
        else:
            bucket = "Remedial Training, Additional Notes, Extra Practice Tests, Trainer Guidance"
        data = await self._json_completion(
            f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. Produce 3-5 specific, actionable recommendations.",
            RECOMMENDATIONS_SCHEMA,
            512,
        )
        return data["recommendations"]

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        data = await self._json_completion(
            f"Batch summary: {json.dumps(batch_summary)}\n\n"
            "Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes.",
            RECOMMENDATIONS_SCHEMA,
            512,
        )
        return data["recommendations"]
