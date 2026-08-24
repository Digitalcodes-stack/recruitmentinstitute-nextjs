import json as json_lib
import pytest
import httpx

from app.core.config import settings
from app.services.ai.base import TopicScore
from app.services.ai.providers.local_llm_provider import (
    LLMResponseError,
    LocalLLMProvider,
    MCQQuestionList,
    StudyNotesModel,
)


@pytest.mark.anyio
async def test_local_llm_provider_reads_settings(monkeypatch):
    monkeypatch.setattr(settings, "ollama_model_name", "custom-model:latest")
    monkeypatch.setattr(settings, "ollama_temperature", 0.42)
    monkeypatch.setattr(settings, "ollama_base_url", "http://custom-ollama:11434")

    provider = LocalLLMProvider()

    assert provider._model == "custom-model:latest"
    assert provider._temperature == 0.42
    assert provider._base_url == "http://custom-ollama:11434"


@pytest.mark.anyio
async def test_generate_questions_sends_few_shot_and_schema(monkeypatch):
    captured_payloads = []

    valid_response_data = {
        "questions": [
            {
                "question_text": "What does ATS stand for in recruitment technology?",
                "option_a": "Applicant Tracking System",
                "option_b": "Automated Testing Software",
                "option_c": "Application Transfer Service",
                "option_d": "Advanced Talent Search",
                "correct_option": "A",
                "explanation": "ATS stands for Applicant Tracking System, which manages candidate applications.",
                "topic_name": "Recruitment Tech",
            }
        ]
    }

    async def mock_post(client, url, **kwargs):
        payload = kwargs.get("json")
        captured_payloads.append(payload)
        return httpx.Response(
            200,
            json={"message": {"role": "assistant", "content": json_lib.dumps(valid_response_data)}},
            request=httpx.Request("POST", f"http://localhost:11434{url}"),
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = LocalLLMProvider()
    questions = await provider.generate_questions("Course content about ATS systems.", ["mcq"], count=1)

    assert len(captured_payloads) == 1
    payload = captured_payloads[0]

    # Verify options & format parameter
    assert payload["model"] == provider._model
    assert payload["options"]["temperature"] == provider._temperature
    assert "properties" in payload["format"]
    assert "questions" in payload["format"]["properties"]

    # Verify few-shot examples were included in messages
    roles = [m["role"] for m in payload["messages"]]
    assert roles.count("system") == 1
    assert roles.count("assistant") >= 2  # few-shot turns
    assert any("Boolean Search Sourcing" in m["content"] for m in payload["messages"])

    # Verify parsed output
    assert len(questions) == 1
    assert questions[0]["question_type"] == "mcq"
    assert questions[0]["topic"] == "Recruitment Tech"
    assert questions[0]["question_text"] == "What does ATS stand for in recruitment technology?"
    assert questions[0]["options"][0] == "Applicant Tracking System"
    assert questions[0]["correct_answer"] == "Applicant Tracking System"


@pytest.mark.anyio
async def test_validation_retry_recovers_after_initial_malformed_json(monkeypatch):
    call_count = 0
    captured_payloads = []

    valid_response_data = {
        "strong_topics": ["Sourcing"],
        "weak_topics": ["Compliance"],
        "difficulty_breakdown": {"Sourcing": 90.0, "Compliance": 40.0},
        "summary": "Great progress overall with sourcing, but needs extra revision on legal compliance.",
    }

    async def mock_post(client, url, **kwargs):
        nonlocal call_count
        call_count += 1
        payload = kwargs.get("json")
        captured_payloads.append(payload)
        if call_count == 1:
            # First attempt: invalid JSON / schema
            return httpx.Response(
                200,
                json={"message": {"role": "assistant", "content": "NOT VALID JSON {"}},
                request=httpx.Request("POST", f"http://localhost:11434{url}"),
            )
        # Second attempt (retry): valid JSON
        return httpx.Response(
            200,
            json={"message": {"role": "assistant", "content": json_lib.dumps(valid_response_data)}},
            request=httpx.Request("POST", f"http://localhost:11434{url}"),
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = LocalLLMProvider()
    topic_scores = [
        TopicScore(topic_name="Sourcing", correct=9, total=10, percentage=90.0),
        TopicScore(topic_name="Compliance", correct=4, total=10, percentage=40.0),
    ]

    analysis = await provider.analyze_performance(score=13.0, percentage=65.0, topic_scores=topic_scores)

    assert call_count == 2
    assert len(captured_payloads) == 2
    # Verify retry prompt contains validation feedback
    assert "Your previous response failed validation" in captured_payloads[1]["messages"][-1]["content"]

    assert analysis.strong_topics == ["Sourcing"]
    assert analysis.weak_topics == ["Compliance"]
    assert "sourcing" in analysis.summary.lower()


@pytest.mark.anyio
async def test_validation_failure_after_retry_raises_typed_error(monkeypatch):
    call_count = 0

    async def mock_post(client, url, **kwargs):
        nonlocal call_count
        call_count += 1
        return httpx.Response(
            200,
            json={"message": {"role": "assistant", "content": '{"invalid": "data"}'}},
            request=httpx.Request("POST", f"http://localhost:11434{url}"),
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = LocalLLMProvider()

    with pytest.raises(LLMResponseError) as exc_info:
        await provider.generate_study_plan(weak_topics=["Compliance"], strong_topics=["Sourcing"])

    assert call_count == 2  # Initial + 1 retry
    assert "Failed to produce valid StudyPlanModel after retry" in str(exc_info.value)


@pytest.mark.anyio
async def test_generate_notes_enforces_markdown_headers_and_length(monkeypatch):
    notes_content = (
        "### Overview\n"
        "Job analysis is the systematic process of gathering information about a job's duties and responsibilities.\n\n"
        "### Key Concepts\n"
        "- Task Inventory\n- Competency Modeling\n- Position Classification\n\n"
        "### Practice Questions\n"
        "1. What is the difference between a task and a competency?\n"
        "2. How does job analysis inform salary band determination?"
    )

    valid_response_data = {"notes_markdown": notes_content}

    async def mock_post(client, url, **kwargs):
        return httpx.Response(
            200,
            json={"message": {"role": "assistant", "content": json_lib.dumps(valid_response_data)}},
            request=httpx.Request("POST", f"http://localhost:11434{url}"),
        )

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = LocalLLMProvider()
    notes = await provider.generate_notes("Job Analysis", context_chunks=["Chunk 1", "Chunk 2"])

    assert "### Overview" in notes
    assert "### Key Concepts" in notes
    assert "### Practice Questions" in notes
    assert "Job analysis is the systematic process" in notes
