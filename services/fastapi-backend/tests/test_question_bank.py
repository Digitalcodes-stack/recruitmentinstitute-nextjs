from types import SimpleNamespace

import pytest

from app.core.exceptions import ServiceError
from app.models.assessment import Assessment
from app.repositories.assessment_repository import AssessmentRepository
from app.schemas.assessment import AssessmentSubmitRequest
from app.schemas.question_bank import AssessmentAnswerInput, AssessmentGradeRequest, QuestionBankItemCreate
from app.services.ai.base import PerformanceAnalysis
from app.services.assessment_service import AssessmentService
from app.services.question_bank_service import QuestionBankService


async def _seed_assessment(db_session, course_id: int = 1) -> Assessment:
    db_session.add(Assessment(course_id=course_id, assessment_name="HR Basics", total_marks=100, duration_minutes=30))
    await db_session.commit()
    return (await db_session.execute(Assessment.__table__.select().order_by(Assessment.id.desc()))).fetchone()


def _service(db_session, assessment_service=None) -> QuestionBankService:
    repo = AssessmentRepository(db_session)
    return QuestionBankService(repo, assessment_service or AssessmentService(repo))


@pytest.mark.anyio
async def test_admin_can_add_list_delete_questions(db_session):
    assessment = await _seed_assessment(db_session)
    service = _service(db_session)

    q1 = await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="Recruitment Lifecycle", question_text="What is the first step?",
        option_a="Sourcing", option_b="Onboarding", option_c="Offer", option_d="Interview",
        correct_option="A",
    ))
    await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="Recruitment Lifecycle", question_text="What comes after interview?",
        option_a="Sourcing", option_b="Offer", option_c="Job posting", option_d="Screening",
        correct_option="B",
    ))

    questions = await service.list_questions(assessment.id)
    assert len(questions) == 2

    await service.delete_question(q1.id)
    remaining = await service.list_questions(assessment.id)
    assert len(remaining) == 1


@pytest.mark.anyio
async def test_student_facing_questions_never_include_correct_option(db_session):
    from app.schemas.question_bank import AssessmentQuestionRead

    assessment = await _seed_assessment(db_session)
    service = _service(db_session)
    await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="SQL", question_text="What does SELECT do?",
        option_a="Deletes rows", option_b="Reads rows", option_c="Updates rows", option_d="Creates a table",
        correct_option="B",
    ))

    questions = await service.get_assessment_questions_for_student(assessment.id)
    serialized = AssessmentQuestionRead.model_validate(questions[0]).model_dump()

    assert "correct_option" not in serialized


@pytest.mark.anyio
async def test_grade_and_submit_tallies_topics_and_runs_ai_pipeline(db_session, monkeypatch):
    assessment = await _seed_assessment(db_session)

    class FakeProvider:
        async def analyze_performance(self, score, percentage, topic_scores):
            return PerformanceAnalysis(strong_topics=["Recruitment Lifecycle"], weak_topics=["SQL"], difficulty_breakdown={}, summary="x")

        async def generate_notes(self, topic_name, context_chunks=None):
            return f"# Notes for {topic_name}"

        async def generate_study_plan(self, weak_topics, strong_topics, difficulty_breakdown=None):
            return {"day_1": "x", "day_2": "x", "day_3": "x", "day_4": "x", "day_5": "x"}

        async def generate_recommendations(self, percentage):
            return ["rec"]

    class FakeRedis:
        async def get(self, key):
            return None

        async def set(self, key, value, ex=None):
            return True

    monkeypatch.setattr("app.services.assessment_service.get_reliable_ai_provider", lambda: FakeProvider())
    monkeypatch.setattr("app.services.assessment_service.create_redis_client", lambda: FakeRedis())

    service = _service(db_session)
    q1 = await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="Recruitment Lifecycle", question_text="Q1", option_a="A", option_b="B", option_c="C", option_d="D", correct_option="A",
    ))
    q2 = await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="Recruitment Lifecycle", question_text="Q2", option_a="A", option_b="B", option_c="C", option_d="D", correct_option="B",
    ))
    q3 = await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="SQL", question_text="Q3", option_a="A", option_b="B", option_c="C", option_d="D", correct_option="C",
    ))

    payload = AssessmentGradeRequest(
        assessment_id=assessment.id,
        answers=[
            AssessmentAnswerInput(question_id=q1.id, selected_option="A"),
            AssessmentAnswerInput(question_id=q2.id, selected_option="A"),
            AssessmentAnswerInput(question_id=q3.id, selected_option="D"),
        ],
    )

    student_assessment, analysis, notes, study_plan, recommendations = await service.grade_and_submit(9001, payload)

    assert student_assessment.student_id == 9001
    assert student_assessment.percentage == pytest.approx(100 / 3)
    assert analysis.weak_topics == ["SQL"]


@pytest.mark.anyio
async def test_grade_and_submit_ignores_answers_for_nonexistent_questions(db_session, monkeypatch):
    assessment = await _seed_assessment(db_session)

    class FakeProvider:
        async def analyze_performance(self, score, percentage, topic_scores):
            return PerformanceAnalysis(strong_topics=[], weak_topics=[], difficulty_breakdown={}, summary="")

        async def generate_notes(self, topic_name, context_chunks=None):
            return "notes"

        async def generate_study_plan(self, weak_topics, strong_topics, difficulty_breakdown=None):
            return {}

        async def generate_recommendations(self, percentage):
            return []

    monkeypatch.setattr("app.services.assessment_service.get_reliable_ai_provider", lambda: FakeProvider())
    monkeypatch.setattr("app.services.assessment_service.create_redis_client", lambda: SimpleNamespace(get=lambda k: None))

    service = _service(db_session)
    q1 = await service.add_question(assessment.id, QuestionBankItemCreate(
        topic_name="HR", question_text="Q1", option_a="A", option_b="B", option_c="C", option_d="D", correct_option="A",
    ))

    payload = AssessmentGradeRequest(
        assessment_id=assessment.id,
        answers=[
            AssessmentAnswerInput(question_id=q1.id, selected_option="A"),
            AssessmentAnswerInput(question_id=999999, selected_option="B"),
        ],
    )

    student_assessment, *_ = await service.grade_and_submit(9002, payload)
    assert student_assessment.percentage == 100.0


@pytest.mark.anyio
async def test_grade_and_submit_raises_when_assessment_has_no_questions(db_session):
    assessment = await _seed_assessment(db_session)
    service = _service(db_session)

    payload = AssessmentGradeRequest(assessment_id=assessment.id, answers=[AssessmentAnswerInput(question_id=1, selected_option="A")])

    with pytest.raises(ServiceError) as exc_info:
        await service.grade_and_submit(9003, payload)
    assert exc_info.value.status_code == 404


@pytest.mark.anyio
async def test_create_and_lookup_assessment_by_course(db_session):
    service = _service(db_session)
    created = await service.create_assessment(course_id=42, assessment_name="Test", total_marks=50, duration_minutes=20)

    fetched = await service.get_assessment_for_course(42)
    assert fetched.id == created.id


@pytest.mark.anyio
async def test_get_assessment_for_course_404_when_none_exists(db_session):
    service = _service(db_session)
    with pytest.raises(ServiceError) as exc_info:
        await service.get_assessment_for_course(99999)
    assert exc_info.value.status_code == 404
