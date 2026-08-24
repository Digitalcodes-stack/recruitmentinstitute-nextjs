import json
import logging
from typing import TypeVar

from google.genai import Client, errors, types
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import settings
from app.services.ai.base import AIProvider, PerformanceAnalysis, TopicScore
from app.services.ai.providers.prompts import (
    QUESTION_GENERATOR_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


class GeminiProviderError(Exception):
    """Raised when GeminiProvider fails to generate or validate structured content."""
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


def _is_quota_error(exc: Exception) -> bool:
    if isinstance(exc, errors.APIError):
        code = getattr(exc, "code", None)
        if code == 429:
            return True
        msg = str(exc).lower()
        if "429" in msg or "quota" in msg or "resource_exhausted" in msg or "rate" in msg:
            return True
    return False


class GeminiProvider(AIProvider):
    def __init__(self) -> None:
        self._api_key = settings.gemini_api_key
        self._model_primary = settings.gemini_model_primary
        self._model_overflow = settings.gemini_model_overflow
        self._temperature = settings.gemini_temperature
        self._client: Client | None = None

    def _get_client(self) -> Client:
        if not self._api_key:
            raise GeminiProviderError("GEMINI_API_KEY is not configured")
        if self._client is None:
            self._client = Client(api_key=self._api_key)
        return self._client

    async def _generate_with_validation(
        self,
        prompt: str,
        model_cls: type[T],
        system_prompt: str,
        model_name: str,
    ) -> T:
        client = self._get_client()

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=model_cls,
            temperature=self._temperature,
        )

        response = await client.aio.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )
        raw_content = response.text or ""

        try:
            return model_cls.model_validate_json(raw_content)
        except (ValidationError, ValueError, json.JSONDecodeError) as first_err:
            logger.warning(
                "Gemini validation failed on initial call for %s (%s): %s. Initiating one correction retry turn.",
                model_cls.__name__,
                model_name,
                first_err,
            )

            correction_prompt = (
                f"{prompt}\n\n"
                f"[SYSTEM FEEDBACK]: Your previous response failed schema validation with error:\n{first_err}\n"
                "Please correct the output and return ONLY valid JSON matching the exact schema."
            )

            retry_response = await client.aio.models.generate_content(
                model=model_name,
                contents=correction_prompt,
                config=config,
            )
            retry_content = retry_response.text or ""

            try:
                return model_cls.model_validate_json(retry_content)
            except Exception as second_err:
                logger.error(
                    "Gemini validation failed after retry for %s (%s): %s",
                    model_cls.__name__,
                    model_name,
                    second_err,
                )
                raise GeminiProviderError(
                    f"Failed to produce valid {model_cls.__name__} after retry from {model_name}: {second_err}"
                ) from second_err

    async def _call_with_overflow(
        self,
        prompt: str,
        model_cls: type[T],
        system_prompt: str,
    ) -> T:
        try:
            return await self._generate_with_validation(
                prompt=prompt,
                model_cls=model_cls,
                system_prompt=system_prompt,
                model_name=self._model_primary,
            )
        except Exception as exc:
            if _is_quota_error(exc):
                logger.warning(
                    "Gemini primary model (%s) hit quota limit (429). Retrying on overflow model (%s): %s",
                    self._model_primary,
                    self._model_overflow,
                    exc,
                )
                try:
                    return await self._generate_with_validation(
                        prompt=prompt,
                        model_cls=model_cls,
                        system_prompt=system_prompt,
                        model_name=self._model_overflow,
                    )
                except Exception as overflow_exc:
                    logger.error(
                        "Gemini overflow model (%s) failed: %s",
                        self._model_overflow,
                        overflow_exc,
                    )
                    raise GeminiProviderError(
                        f"Gemini primary and overflow models exhausted: {overflow_exc}"
                    ) from overflow_exc
            raise exc

    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]:
        prompt = (
            f"Generate {count} multiple-choice question(s) (MCQs) for recruitment training based on the following material.\n"
            f"Context material:\n{context_text}\n\n"
            "Requirements for each question:\n"
            "- A clear question_text stem\n"
            "- Exactly four distinct options: option_a, option_b, option_c, option_d\n"
            "- A correct_option strictly set to 'A', 'B', 'C', or 'D'\n"
            "- An explanation explaining why the correct option is right\n"
            "- A relevant topic_name"
        )

        result = await self._call_with_overflow(
            prompt=prompt,
            model_cls=MCQQuestionList,
            system_prompt=QUESTION_GENERATOR_SYSTEM_PROMPT,
        )

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
        prompt = (
            f"Student score: {score}, Overall percentage: {percentage:.1f}%\n"
            f"Topic breakdown:\n{topic_lines}\n\n"
            "Analyze this performance. Identify strong_topics (>=70%), weak_topics (<70%), "
            "a difficulty_breakdown mapping topic name to score percentage, and an encouraging summary."
        )

        data = await self._call_with_overflow(
            prompt=prompt,
            model_cls=PerformanceAnalysisModel,
            system_prompt=SYSTEM_PROMPT,
        )

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

        prompt = (
            f"Generate comprehensive, structured study notes in markdown for the topic: {topic_name}.\n"
            "The output 'notes_markdown' MUST include the following section headers:\n"
            "### Overview\n"
            "### Key Concepts\n"
            "### Practice Questions\n\n"
            f"Ensure the notes are detailed, pedagogically sound, and cover practical recruitment examples.{context_block}"
        )

        result = await self._call_with_overflow(
            prompt=prompt,
            model_cls=StudyNotesModel,
            system_prompt=SYSTEM_PROMPT,
        )
        return result.notes_markdown

    async def generate_study_plan(
        self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None
    ) -> dict:
        prompt = (
            f"Weak topics: {', '.join(weak_topics) or 'none'}\n"
            f"Strong topics: {', '.join(strong_topics) or 'none'}\n\n"
            "Generate a structured 5-day study plan focused on reinforcing the weak topics and solidifying mastery. "
            "Provide detailed actionable daily learning activities for day_1 through day_5."
        )

        result = await self._call_with_overflow(
            prompt=prompt,
            model_cls=StudyPlanModel,
            system_prompt=SYSTEM_PROMPT,
        )
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

        prompt = (
            f"Student scored {percentage:.1f}%. Recommendation category: {bucket}. "
            "Produce 3-5 specific, actionable recommendations."
        )

        result = await self._call_with_overflow(
            prompt=prompt,
            model_cls=RecommendationsModel,
            system_prompt=SYSTEM_PROMPT,
        )
        return result.recommendations

    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]:
        prompt = (
            f"Batch summary: {json.dumps(batch_summary)}\n\n"
            "Produce 3-5 actionable recommendations for the trainer to improve this batch's outcomes."
        )

        result = await self._call_with_overflow(
            prompt=prompt,
            model_cls=RecommendationsModel,
            system_prompt=SYSTEM_PROMPT,
        )
        return result.recommendations
