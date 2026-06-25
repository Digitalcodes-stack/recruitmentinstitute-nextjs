import json

from anthropic import AsyncAnthropic

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore

ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "strong_topics": {"type": "array", "items": {"type": "string"}},
        "weak_topics": {"type": "array", "items": {"type": "string"}},
        "difficulty_breakdown": {"type": "object", "additionalProperties": {"type": "number"}},
        "summary": {"type": "string"},
    },
    "required": ["strong_topics", "weak_topics", "difficulty_breakdown", "summary"],
    "additionalProperties": False,
}

STUDY_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "day_1": {"type": "string"},
        "day_2": {"type": "string"},
        "day_3": {"type": "string"},
        "day_4": {"type": "string"},
        "day_5": {"type": "string"},
    },
    "required": ["day_1", "day_2", "day_3", "day_4", "day_5"],
    "additionalProperties": False,
}

RECOMMENDATIONS_SCHEMA = {
    "type": "object",
    "properties": {"recommendations": {"type": "array", "items": {"type": "string"}}},
    "required": ["recommendations"],
    "additionalProperties": False,
}

SYSTEM_PROMPT = (
    "You are an academic performance analyst for a recruitment training institute. "
    "You analyze student assessment results, identify strengths and weaknesses, generate "
    "study notes, and produce personalized study plans. Be concise and factual."
)


QUESTIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question_type": {"type": "string", "enum": ["mcq", "true_false", "scenario", "descriptive"]},
                    "topic": {"type": "string"},
                    "question_text": {"type": "string"},
                    "options": {"type": "array", "items": {"type": "string"}},
                    "correct_answer": {"type": "string"}
                },
                "required": ["question_type", "topic", "question_text", "correct_answer"],
                "additionalProperties": False
            }
        }
    },
    "required": ["questions"],
    "additionalProperties": False
}


class ClaudeProvider(AIProvider):
    def __init__(self) -> None:
        self._client = AsyncAnthropic(api_key=settings.claude_api_key)
        self._model = settings.claude_model

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        prompt = (
            f"Generate {count} assessment questions based on the following course material context:\n\n"
            f"{context_text}\n\n"
            f"Allowed question types: {', '.join(question_types)}. "
            "For mcq, provide 4 options. Ensure the correct_answer matches one of the options for mcq or is a boolean for true_false."
        )
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            output_config={"format": {"type": "json_schema", "schema": QUESTIONS_SCHEMA}},
            messages=[{"role": "user", "content": prompt}],
        )
        data = json.loads(response.content[0].text)
        return data["questions"]

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        topic_lines = "\n".join(f"- {t.topic_name}: {t.correct}/{t.total} correct ({t.percentage:.1f}%)" for t in topic_scores)
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=1024,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            output_config={"format": {"type": "json_schema", "schema": ANALYSIS_SCHEMA}},
            messages=[{
                "role": "user",
                "content": f"Score: {score}, Percentage: {percentage:.1f}%\nTopic breakdown:\n{topic_lines}\n\nAnalyze this performance.",
            }],
        )
        data = json.loads(response.content[0].text)
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
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            messages=[{
                "role": "user",
                "content": (
                    f"Generate personalized study notes for the weak topic: {topic_name}\n\n"
                    "Include: a simplified explanation, key concepts, important points, "
                    "3-5 interview questions, 3-5 practice questions, and a real-world example. "
                    f"Format as markdown.{context_block}"
                ),
            }],
        )
        return response.content[0].text

    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str]) -> dict:
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=512,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            output_config={"format": {"type": "json_schema", "schema": STUDY_PLAN_SCHEMA}},
            messages=[{
                "role": "user",
                "content": (
                    f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
                    f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
                    "Generate a 5-day study plan focused on reinforcing the weak topics."
                ),
            }],
        )
        return json.loads(response.content[0].text)

    async def generate_recommendations(self, percentage: float) -> list[str]:
        if percentage > 85:
            bucket = "Advanced Learning Path, Advanced Projects, Mock Interviews"
        elif percentage >= 60:
            bucket = "Revision Notes, Practice Questions, Topic Reinforcement"
        else:
            bucket = "Remedial Training, Additional Notes, Extra Practice Tests, Trainer Guidance"
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=512,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            output_config={"format": {"type": "json_schema", "schema": RECOMMENDATIONS_SCHEMA}},
            messages=[{
                "role": "user",
                "content": f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. Produce 3-5 specific, actionable recommendations.",
            }],
        )
        return json.loads(response.content[0].text)["recommendations"]

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=512,
            system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
            output_config={"format": {"type": "json_schema", "schema": RECOMMENDATIONS_SCHEMA}},
            messages=[{
                "role": "user",
                "content": (
                    f"Batch summary: {json.dumps(batch_summary)}\n\n"
                    "Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes."
                ),
            }],
        )
        return json.loads(response.content[0].text)["recommendations"]
