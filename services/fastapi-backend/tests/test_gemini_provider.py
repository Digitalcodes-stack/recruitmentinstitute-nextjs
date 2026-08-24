import json
from unittest.mock import AsyncMock, MagicMock
import pytest
from google.genai import errors

from app.core.config import settings
from app.services.ai.base import TopicScore
from app.services.ai.providers.gemini_provider import (
    GeminiProvider,
    GeminiProviderError,
    MCQQuestionList,
    StudyNotesModel,
)


@pytest.mark.anyio
async def test_gemini_provider_reads_settings_and_no_pro_models(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-api-key")
    monkeypatch.setattr(settings, "gemini_model_primary", "gemini-2.5-flash")
    monkeypatch.setattr(settings, "gemini_model_overflow", "gemini-2.5-flash-lite")
    monkeypatch.setattr(settings, "gemini_temperature", 0.35)

    provider = GeminiProvider()

    assert provider._api_key == "test-api-key"
    assert provider._model_primary == "gemini-2.5-flash"
    assert provider._model_overflow == "gemini-2.5-flash-lite"
    assert provider._temperature == 0.35

    # Strict assertion: Free-tier Flash family only, no Pro models
    assert "pro" not in provider._model_primary.lower()
    assert "pro" not in provider._model_overflow.lower()


@pytest.mark.anyio
async def test_gemini_provider_raises_when_api_key_missing(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", None)
    provider = GeminiProvider()

    with pytest.raises(GeminiProviderError) as exc_info:
        await provider.generate_questions("Some context", ["mcq"], 1)

    assert "GEMINI_API_KEY is not configured" in str(exc_info.value)


@pytest.mark.anyio
async def test_gemini_validation_retry_recovers_after_initial_malformed_json(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    provider = GeminiProvider()

    call_count = 0
    captured_calls = []

    valid_response_data = {
        "strong_topics": ["Talent Sourcing"],
        "weak_topics": ["Employment Law"],
        "difficulty_breakdown": {"Talent Sourcing": 85.0, "Employment Law": 45.0},
        "summary": "Solid candidate sourcing abilities demonstrated, but further review of employment law regulations is needed.",
    }

    async def mock_generate_content(model, contents, config):
        nonlocal call_count
        call_count += 1
        captured_calls.append({"model": model, "contents": contents, "config": config})
        resp = MagicMock()
        if call_count == 1:
            resp.text = "NOT JSON {{ broken"
            return resp
        resp.text = json.dumps(valid_response_data)
        return resp

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=mock_generate_content)
    provider._client = mock_client

    topic_scores = [
        TopicScore(topic_name="Talent Sourcing", correct=9, total=10, percentage=90.0),
        TopicScore(topic_name="Employment Law", correct=4, total=10, percentage=40.0),
    ]

    analysis = await provider.analyze_performance(score=13.0, percentage=65.0, topic_scores=topic_scores)

    assert call_count == 2
    assert len(captured_calls) == 2
    # Verify retry prompt includes validation error feedback
    assert "[SYSTEM FEEDBACK]: Your previous response failed schema validation" in captured_calls[1]["contents"]
    assert analysis.strong_topics == ["Talent Sourcing"]
    assert analysis.weak_topics == ["Employment Law"]
    assert "sourcing" in analysis.summary.lower()


@pytest.mark.anyio
async def test_gemini_double_validation_failure_raises_typed_error(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    provider = GeminiProvider()

    call_count = 0

    async def mock_generate_content(model, contents, config):
        nonlocal call_count
        call_count += 1
        resp = MagicMock()
        resp.text = '{"unexpected_key": "bad_value"}'
        return resp

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=mock_generate_content)
    provider._client = mock_client

    with pytest.raises(GeminiProviderError) as exc_info:
        await provider.generate_study_plan(weak_topics=["Compliance"], strong_topics=["Sourcing"])

    assert call_count == 2
    assert "Failed to produce valid StudyPlanModel after retry" in str(exc_info.value)


@pytest.mark.anyio
async def test_gemini_primary_429_overflows_to_flash_lite(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    monkeypatch.setattr(settings, "gemini_model_primary", "gemini-2.5-flash")
    monkeypatch.setattr(settings, "gemini_model_overflow", "gemini-2.5-flash-lite")
    provider = GeminiProvider()

    captured_models = []

    valid_questions = {
        "questions": [
            {
                "question_text": "What is the primary purpose of candidate pre-screening?",
                "option_a": "To negotiate executive compensation",
                "option_b": "To filter out unqualified applicants early in the recruitment pipeline",
                "option_c": "To conduct background checks",
                "option_d": "To issue formal employment offers",
                "correct_option": "B",
                "explanation": "Pre-screening verifies minimum qualifications before investing time in in-depth interviews.",
                "topic_name": "Candidate Screening",
            }
        ]
    }

    async def mock_generate_content(model, contents, config):
        captured_models.append(model)
        if model == "gemini-2.5-flash":
            # Simulate 429 quota error on primary model
            raise errors.APIError(429, "Resource has been exhausted (quota limit reached).")
        # Overflow model succeeds
        resp = MagicMock()
        resp.text = json.dumps(valid_questions)
        return resp

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=mock_generate_content)
    provider._client = mock_client

    questions = await provider.generate_questions("Course content about candidate screening.", ["mcq"], 1)

    assert captured_models == ["gemini-2.5-flash", "gemini-2.5-flash-lite"]
    assert len(questions) == 1
    assert questions[0]["topic"] == "Candidate Screening"
    assert questions[0]["correct_answer"] == "To filter out unqualified applicants early in the recruitment pipeline"


@pytest.mark.anyio
async def test_gemini_generate_notes_preserves_rag_context_and_validates_headers(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key")
    provider = GeminiProvider()

    captured_contents = []

    notes_text = (
        "### Overview\n"
        "Behavioral interviewing assesses candidate competencies based on past workplace behavior.\n\n"
        "### Key Concepts\n"
        "- STAR Method (Situation, Task, Action, Result)\n- Competency Alignment\n- Objective Scoring\n\n"
        "### Practice Questions\n"
        "1. How does the STAR method structure candidate responses?\n"
        "2. Why are hypothetical questions less predictive than behavioral questions?"
    )

    valid_response = {"notes_markdown": notes_text}

    async def mock_generate_content(model, contents, config):
        captured_contents.append(contents)
        resp = MagicMock()
        resp.text = json.dumps(valid_response)
        return resp

    mock_client = MagicMock()
    mock_client.aio.models.generate_content = AsyncMock(side_effect=mock_generate_content)
    provider._client = mock_client

    context_chunks = ["Chunk A: STAR method principles.", "Chunk B: Evaluation scorecards."]
    notes = await provider.generate_notes("Behavioral Interviewing", context_chunks=context_chunks)

    assert len(captured_contents) == 1
    # Verify RAG context chunks are injected
    assert "Chunk A: STAR method principles." in captured_contents[0]
    assert "Chunk B: Evaluation scorecards." in captured_contents[0]

    assert "### Overview" in notes
    assert "### Key Concepts" in notes
    assert "### Practice Questions" in notes
    assert "Behavioral interviewing assesses candidate competencies" in notes
