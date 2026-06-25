import pytest

from app.services.ai.base import TopicScore
from app.services.ai.providers.local_ai_provider import LocalAIProvider
from app.services.ai.question_generator import generate_questions_from_content


@pytest.mark.anyio
async def test_analyze_performance_splits_strong_and_weak_by_threshold():
    provider = LocalAIProvider()
    topic_scores = [
        TopicScore(topic_name="Recruitment Lifecycle", correct=9, total=10, percentage=90.0),
        TopicScore(topic_name="HR Operations", correct=3, total=10, percentage=30.0),
    ]

    result = await provider.analyze_performance(score=60.0, percentage=60.0, topic_scores=topic_scores)

    assert result.strong_topics == ["Recruitment Lifecycle"]
    assert result.weak_topics == ["HR Operations"]
    assert result.difficulty_breakdown == {"Recruitment Lifecycle": 90.0, "HR Operations": 30.0}
    assert "60.0%" in result.summary
    assert "Recruitment Lifecycle" in result.summary
    assert "HR Operations" in result.summary


@pytest.mark.anyio
async def test_analyze_performance_handles_no_topic_scores():
    provider = LocalAIProvider()
    result = await provider.analyze_performance(score=0.0, percentage=0.0, topic_scores=[])
    assert result.strong_topics == []
    assert result.weak_topics == []
    assert result.difficulty_breakdown == {}
    assert "0.0%" in result.summary


@pytest.mark.anyio
async def test_generate_study_plan_returns_five_day_shape_with_weak_topics():
    provider = LocalAIProvider()
    plan = await provider.generate_study_plan(weak_topics=["HR Operations"], strong_topics=["Recruitment Lifecycle"])

    assert set(plan.keys()) == {"day_1", "day_2", "day_3", "day_4", "day_5"}
    assert all(isinstance(v, str) and v for v in plan.values())
    assert "HR Operations" in plan["day_1"]


@pytest.mark.anyio
async def test_generate_study_plan_returns_five_day_shape_with_no_weak_topics():
    provider = LocalAIProvider()
    plan = await provider.generate_study_plan(weak_topics=[], strong_topics=["Recruitment Lifecycle"])

    assert set(plan.keys()) == {"day_1", "day_2", "day_3", "day_4", "day_5"}
    assert all("Recruitment Lifecycle" in v for v in plan.values())


@pytest.mark.anyio
@pytest.mark.parametrize("percentage", [90.0, 70.0, 40.0])
async def test_generate_recommendations_returns_nonempty_bucketed_list(percentage):
    provider = LocalAIProvider()
    recs = await provider.generate_recommendations(percentage)
    assert 3 <= len(recs) <= 5
    assert all(isinstance(r, str) and r for r in recs)


@pytest.mark.anyio
async def test_generate_trainer_recommendations_uses_real_batch_summary():
    provider = LocalAIProvider()
    summary = {
        "batch_performance": {"avg_score": 55.0, "avg_percentage": 45.0, "count": 12},
        "weak_topics": [{"topic_name": "HR Operations", "occurrence_count": 8}],
    }
    recs = await provider.generate_trainer_recommendations(summary)
    assert any("HR Operations" in r for r in recs)
    assert len(recs) <= 5


@pytest.mark.anyio
async def test_generate_notes_falls_back_gracefully_with_no_context():
    provider = LocalAIProvider()
    notes = await provider.generate_notes("HR Operations", context_chunks=None)
    assert "HR Operations" in notes
    assert "knowledge base" in notes.lower()


@pytest.mark.anyio
async def test_generate_notes_uses_context_chunks_when_available(monkeypatch):
    monkeypatch.setattr(
        "app.services.ai.providers.local_ai_provider._summarize_text",
        lambda text: "Summarized: " + text[:30],
    )
    provider = LocalAIProvider()
    notes = await provider.generate_notes("HR Operations", context_chunks=["Onboarding involves payroll setup."])
    assert "Summarized" in notes
    assert "Onboarding involves payroll setup" in notes


def test_generate_questions_from_content_returns_requested_count_and_shape(monkeypatch):
    monkeypatch.setattr(
        "app.services.ai.question_generator._extract_key_terms",
        lambda text, top_n=15: ["sourcing", "onboarding", "payroll", "interview"],
    )
    context = (
        "Sourcing is the first step in recruitment lifecycle management. "
        "Onboarding involves payroll setup and policy orientation for new hires. "
        "An interview typically follows the initial screening process for candidates."
    )

    questions = generate_questions_from_content(
        context, question_types=["mcq", "true_false", "scenario", "descriptive"], count=4, topic="HR Operations"
    )

    assert len(questions) == 4
    types_seen = {q["question_type"] for q in questions}
    assert types_seen.issubset({"mcq", "true_false", "scenario", "descriptive"})
    for q in questions:
        assert q["topic"] == "HR Operations"
        assert q["question_text"]
        assert q["correct_answer"]


def test_generate_questions_mcq_options_include_correct_answer(monkeypatch):
    monkeypatch.setattr(
        "app.services.ai.question_generator._extract_key_terms",
        lambda text, top_n=15: ["sourcing", "onboarding", "payroll", "interview"],
    )
    context = "Sourcing is the first step in recruitment lifecycle management for new hires."

    questions = generate_questions_from_content(context, question_types=["mcq"], count=1, topic="Recruitment")

    assert len(questions) == 1
    q = questions[0]
    assert q["question_type"] == "mcq"
    assert len(q["options"]) == 4
    assert q["correct_answer"] in q["options"]


def test_generate_questions_returns_empty_for_blank_content():
    assert generate_questions_from_content("", question_types=["mcq"], count=3) == []
