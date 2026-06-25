import json

import httpx

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.providers.claude_provider import SYSTEM_PROMPT


class LocalLLMProvider(AIProvider):
    def __init__(self) -> None:
        self._base_url = settings.ollama_base_url or "http://localhost:11434"
        self._model = settings.ollama_model

    async def _generate(self, prompt: str, max_tokens: int, json_mode: bool = False) -> str:
        async with httpx.AsyncClient(base_url=self._base_url, timeout=120) as client:
            payload = {
                "model": self._model,
                "system": SYSTEM_PROMPT,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": max_tokens},
            }
            if json_mode:
                payload["format"] = "json"
            response = await client.post("/api/generate", json=payload)
            response.raise_for_status()
            return response.json()["response"]

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        topic_lines = "\n".join(f"- {t.topic_name}: {t.correct}/{t.total} correct ({t.percentage:.1f}%)" for t in topic_scores)
        raw = await self._generate(
            f"Score: {score}, Percentage: {percentage:.1f}%\nTopic breakdown:\n{topic_lines}\n\n"
            "Analyze this performance. Respond ONLY with JSON: "
            '{"strong_topics": [...], "weak_topics": [...], "difficulty_breakdown": {...}, "summary": "..."}',
            1024,
            json_mode=True,
        )
        data = json.loads(raw)
        return PerformanceAnalysis(
            strong_topics=data.get("strong_topics", []),
            weak_topics=data.get("weak_topics", []),
            difficulty_breakdown=data.get("difficulty_breakdown", {}),
            summary=data.get("summary", ""),
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        context_block = ""
        if context_chunks:
            joined = "\n\n".join(context_chunks)
            context_block = f"\n\nUse the following course material as grounding context where relevant:\n{joined}\n"
        return await self._generate(
            f"Generate personalized study notes for the weak topic: {topic_name}\n\n"
            "Include: a simplified explanation, key concepts, important points, "
            "3-5 interview questions, 3-5 practice questions, and a real-world example. "
            f"Format as markdown.{context_block}",
            2048,
        )

    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        raw = await self._generate(
            f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
            f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
            "Generate a 5-day study plan focused on reinforcing the weak topics. "
            'Respond ONLY with JSON: {"day_1": "...", "day_2": "...", "day_3": "...", "day_4": "...", "day_5": "..."}',
            512,
            json_mode=True,
        )
        return json.loads(raw)

    async def generate_recommendations(self, percentage: float) -> list[str]:
        if percentage > 85:
            bucket = "Advanced Learning Path, Advanced Projects, Mock Interviews"
        elif percentage >= 60:
            bucket = "Revision Notes, Practice Questions, Topic Reinforcement"
        else:
            bucket = "Remedial Training, Additional Notes, Extra Practice Tests, Trainer Guidance"
        raw = await self._generate(
            f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. "
            'Produce 3-5 specific, actionable recommendations. Respond ONLY with JSON: {"recommendations": [...]}',
            512,
            json_mode=True,
        )
        return json.loads(raw).get("recommendations", [])

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        raw = await self._generate(
            f"Batch summary: {json.dumps(batch_summary)}\n\n"
            "Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes. "
            'Respond ONLY with JSON: {"recommendations": [...]}',
            512,
            json_mode=True,
        )
        return json.loads(raw).get("recommendations", [])
