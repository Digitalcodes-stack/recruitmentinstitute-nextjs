import json
import logging
from typing import TypeVar

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.providers.prompts import (
    FEW_SHOT_MCQ_TURNS,
    QUESTION_GENERATOR_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


class LLMResponseError(Exception):
    """Raised when LocalLLMProvider cannot obtain or validate structured output from Ollama."""
    pass


class MCQQuestion(BaseModel):
    question_text: str = Field(..., description="The clear question text/stem")
    option_a: str = Field(..., description="Option A")
    option_b: str = Field(..., description="Option B")
    option_c: str = Field(..., description="Option C")
    option_d: str = Field(..., description="Option D")
    correct_option: str = Field(..., description="The correct option letter ('A', 'B', 'C', or 'D')")
    explanation: str = Field(default="", description="Explanation of why the correct option is right")
    topic_name: str = Field(default="Recruitment", description="Topic category or concept")

    @field_validator("correct_option")
    @classmethod
    def normalize_correct_option(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if cleaned in ("A", "B", "C", "D"):
            return cleaned
        if cleaned.startswith("OPTION ") and len(cleaned) == 8 and cleaned[-1] in ("A", "B", "C", "D"):
            return cleaned[-1]
        raise ValueError(f"correct_option must be 'A', 'B', 'C', or 'D' (got '{v}')")


class MCQQuestionList(BaseModel):
    questions: list[MCQQuestion] = Field(..., min_length=1)


class PerformanceAnalysisModel(BaseModel):
    strong_topics: list[str] = Field(default_factory=list)
    weak_topics: list[str] = Field(default_factory=list)
    difficulty_breakdown: dict[str, float] = Field(default_factory=dict)
    summary: str = Field(..., min_length=10)


class StudyPlanModel(BaseModel):
    day_1: str = Field(..., min_length=5)
    day_2: str = Field(..., min_length=5)
    day_3: str = Field(..., min_length=5)
    day_4: str = Field(..., min_length=5)
    day_5: str = Field(..., min_length=5)


class StudyNotesModel(BaseModel):
    notes_markdown: str = Field(..., description="Full markdown study notes")

    @field_validator("notes_markdown")
    @classmethod
    def validate_notes_markdown(cls, v: str) -> str:
        stripped = v.strip()
        if len(stripped) < 100:
            raise ValueError(f"Markdown notes too short ({len(stripped)} chars, minimum 100 required)")
        required_headers = ["### Overview", "### Key Concepts", "### Practice Questions"]
        missing = [h for h in required_headers if h.lower() not in stripped.lower()]
        if missing:
            raise ValueError(f"Markdown notes missing required section headers: {', '.join(missing)}")
        return stripped


class RecommendationsModel(BaseModel):
    recommendations: list[str] = Field(..., min_length=1)


T = TypeVar("T", bound=BaseModel)


class LocalLLMProvider(AIProvider):
    def __init__(self) -> None:
        self._base_url = settings.ollama_base_url or "http://localhost:11434"
        self._model = settings.ollama_model_name
        self._temperature = settings.ollama_temperature

    async def _chat_with_validation(
        self,
        messages: list[dict[str, str]],
        model_cls: type[T],
        max_tokens: int = 1024,
    ) -> T:
        schema = model_cls.model_json_schema()
        payload = {
            "model": self._model,
            "messages": messages,
            "format": schema,
            "stream": False,
            "options": {
                "temperature": self._temperature,
                "num_predict": max_tokens,
            },
        }

        async with httpx.AsyncClient(base_url=self._base_url, timeout=120) as client:
            response = await client.post("/api/chat", json=payload)
            response.raise_for_status()
            raw_data = response.json()
            raw_content = raw_data.get("message", {}).get("content", "")

            try:
                return model_cls.model_validate_json(raw_content)
            except (ValidationError, ValueError, json.JSONDecodeError) as first_err:
                logger.warning(
                    "Ollama validation failed on initial call for %s: %s. Initiating one correction retry turn.",
                    model_cls.__name__,
                    first_err,
                )

                retry_messages = list(messages) + [
                    {"role": "assistant", "content": raw_content},
                    {
                        "role": "user",
                        "content": (
                            f"Your previous response failed validation with error:\n{first_err}\n\n"
                            "Please correct the output and return ONLY valid JSON matching the exact schema."
                        ),
                    },
                ]
                retry_payload = {
                    "model": self._model,
                    "messages": retry_messages,
                    "format": schema,
                    "stream": False,
                    "options": {
                        "temperature": self._temperature,
                        "num_predict": max_tokens,
                    },
                }

                retry_response = await client.post("/api/chat", json=retry_payload)
                retry_response.raise_for_status()
                retry_raw_data = retry_response.json()
                retry_content = retry_raw_data.get("message", {}).get("content", "")

                try:
                    return model_cls.model_validate_json(retry_content)
                except Exception as second_err:
                    logger.error(
                        "Ollama validation failed after retry for %s: %s",
                        model_cls.__name__,
                        second_err,
                    )
                    raise LLMResponseError(
                        f"Failed to produce valid {model_cls.__name__} after retry: {second_err}"
                    ) from second_err

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        user_prompt = (
            f"Generate {count} multiple-choice question(s) (MCQs) for recruitment training based on the following material.\n"
            f"Context material:\n{context_text}\n\n"
            "Requirements for each question:\n"
            "- A clear question_text stem\n"
            "- Exactly four distinct options: option_a, option_b, option_c, option_d\n"
            "- A correct_option strictly set to 'A', 'B', 'C', or 'D'\n"
            "- An explanation explaining why the correct option is right\n"
            "- A relevant topic_name"
        )

        messages = [
            {"role": "system", "content": QUESTION_GENERATOR_SYSTEM_PROMPT},
            *FEW_SHOT_MCQ_TURNS,
            {"role": "user", "content": user_prompt},
        ]

        result = await self._chat_with_validation(messages, MCQQuestionList, max_tokens=2048)

        letter_to_index = {"A": 0, "B": 1, "C": 2, "D": 3}
        questions_output: list[dict] = []
        for q in result.questions:
            options = [q.option_a, q.option_b, q.option_c, q.option_d]
            correct_letter = q.correct_option.strip().upper()
            idx = letter_to_index.get(correct_letter, 0)
            correct_answer = options[idx]

            questions_output.append({
                "question_type": "mcq",
                "topic": q.topic_name,
                "question_text": q.question_text,
                "options": options,
                "correct_answer": correct_answer,
                "explanation": q.explanation,
                "difficulty": "medium",
                "bloom_level": "remember",
                "estimated_time_seconds": 60,
            })

        return questions_output

    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis:
        topic_lines = "\n".join(
            f"- {t.topic_name}: {t.correct}/{t.total} correct ({t.percentage:.1f}%)"
            for t in topic_scores
        )
        user_prompt = (
            f"Student score: {score}, Overall percentage: {percentage:.1f}%\n"
            f"Topic breakdown:\n{topic_lines}\n\n"
            "Analyze this performance. Identify strong_topics (>=70%), weak_topics (<70%), "
            "a difficulty_breakdown mapping topic name to score percentage, and an encouraging summary."
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        data = await self._chat_with_validation(messages, PerformanceAnalysisModel, max_tokens=1024)
        return PerformanceAnalysis(
            strong_topics=data.strong_topics,
            weak_topics=data.weak_topics,
            difficulty_breakdown=data.difficulty_breakdown,
            summary=data.summary,
        )

    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str:
        context_block = ""
        if context_chunks:
            joined = "\n\n".join(context_chunks)
            context_block = f"\n\nUse the following course material as grounding context where relevant:\n{joined}\n"

        user_prompt = (
            f"Generate comprehensive, structured study notes in markdown for the topic: {topic_name}.\n"
            "The output 'notes_markdown' MUST include the following section headers:\n"
            "### Overview\n"
            "### Key Concepts\n"
            "### Practice Questions\n\n"
            f"Ensure the notes are detailed, pedagogically sound, and cover practical recruitment examples.{context_block}"
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        result = await self._chat_with_validation(messages, StudyNotesModel, max_tokens=2048)
        return result.notes_markdown

    async def generate_study_plan(
        self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None
    ) -> dict:
        user_prompt = (
            f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
            f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
            "Generate a structured 5-day study plan focused on reinforcing the weak topics and solidifying mastery. "
            "Provide detailed actionable daily learning activities for day_1 through day_5."
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        result = await self._chat_with_validation(messages, StudyPlanModel, max_tokens=1024)
        return {
            "day_1": result.day_1,
            "day_2": result.day_2,
            "day_3": result.day_3,
            "day_4": result.day_4,
            "day_5": result.day_5,
        }

    async def generate_recommendations(self, percentage: float) -> list[str]:
        if percentage > 85:
            bucket = "Advanced Learning Path, Advanced Projects, Mock Interviews"
        elif percentage >= 60:
            bucket = "Revision Notes, Practice Questions, Topic Reinforcement"
        else:
            bucket = "Remedial Training, Additional Notes, Extra Practice Tests, Trainer Guidance"

        user_prompt = (
            f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. "
            "Produce 3-5 specific, actionable recommendations."
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        result = await self._chat_with_validation(messages, RecommendationsModel, max_tokens=512)
        return result.recommendations

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        user_prompt = (
            f"Batch summary: {json.dumps(batch_summary)}\n\n"
            "Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes."
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        result = await self._chat_with_validation(messages, RecommendationsModel, max_tokens=512)
        return result.recommendations
