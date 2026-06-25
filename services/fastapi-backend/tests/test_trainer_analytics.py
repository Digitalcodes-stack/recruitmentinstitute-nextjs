from types import SimpleNamespace

import pytest

from app.core.exceptions import ServiceError
from app.models.ai_assessment import AIAssessmentAnalysis
from app.models.assessment import Assessment, StudentAssessment
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.trainer_analytics_repository import TrainerAnalyticsRepository
from app.services.trainer_analytics_service import TrainerAnalyticsService


async def _seed_completed_attempt(db_session, student_id: int, course_id: int, score: float, percentage: float, weak_topics: list[str]):
    db_session.add(Assessment(course_id=course_id, assessment_name="Test", total_marks=100, duration_minutes=30))
    await db_session.commit()
    assessment = (await db_session.execute(Assessment.__table__.select().order_by(Assessment.id.desc()))).fetchone()

    student_assessment = StudentAssessment(
        student_id=student_id, assessment_id=assessment.id, score=score, percentage=percentage, status="completed"
    )
    db_session.add(student_assessment)
    await db_session.flush()

    db_session.add(AIAssessmentAnalysis(
        student_id=student_id, assessment_id=student_assessment.id, score=score, percentage=percentage,
        strong_topics=[], weak_topics=weak_topics, analysis_json={},
    ))
    await db_session.commit()


@pytest.mark.anyio
async def test_batch_performance_aggregates_real_assessment_rows(db_session, monkeypatch):
    await _seed_completed_attempt(db_session, 5001, course_id=1, score=80.0, percentage=80.0, weak_topics=["OOP"])
    await _seed_completed_attempt(db_session, 5002, course_id=1, score=60.0, percentage=60.0, weak_topics=["SQL"])

    async def fake_get_batches_for_trainer(self, trainer_id):
        return [{"id": 1, "name": "Batch A", "course_id": 1, "status": "ACTIVE"}]

    async def fake_get_students_in_batch(self, batch_id):
        return [{"id": 5001, "name": "Student One", "email": "s1@example.com"}, {"id": 5002, "name": "Student Two", "email": "s2@example.com"}]

    monkeypatch.setattr(TrainerAnalyticsRepository, "get_batches_for_trainer", fake_get_batches_for_trainer)
    monkeypatch.setattr(TrainerAnalyticsRepository, "get_students_in_batch", fake_get_students_in_batch)

    service = TrainerAnalyticsService(TrainerAnalyticsRepository(db_session), AssessmentRepository(db_session))
    principal = SimpleNamespace(user_id=42, type="trainer")

    result = await service.batch_performance_for_trainer(42, principal)

    assert len(result) == 1
    assert result[0]["batch_id"] == 1
    assert result[0]["count"] == 2
    assert result[0]["avg_percentage"] == pytest.approx(70.0)


@pytest.mark.anyio
async def test_weak_topic_trends_counts_occurrences_across_students(db_session, monkeypatch):
    await _seed_completed_attempt(db_session, 6001, course_id=2, score=50.0, percentage=50.0, weak_topics=["OOP", "SQL"])
    await _seed_completed_attempt(db_session, 6002, course_id=2, score=55.0, percentage=55.0, weak_topics=["OOP"])

    async def fake_get_batches_for_trainer(self, trainer_id):
        return [{"id": 2, "name": "Batch B", "course_id": 2, "status": "ACTIVE"}]

    async def fake_get_students_in_batch(self, batch_id):
        return [{"id": 6001, "name": "S1", "email": "x"}, {"id": 6002, "name": "S2", "email": "y"}]

    monkeypatch.setattr(TrainerAnalyticsRepository, "get_batches_for_trainer", fake_get_batches_for_trainer)
    monkeypatch.setattr(TrainerAnalyticsRepository, "get_students_in_batch", fake_get_students_in_batch)

    service = TrainerAnalyticsService(TrainerAnalyticsRepository(db_session), AssessmentRepository(db_session))
    principal = SimpleNamespace(user_id=42, type="trainer")

    result = await service.weak_topic_trends_for_trainer(42, principal)

    assert result[0] == {"topic_name": "OOP", "occurrence_count": 2}
    assert {"topic_name": "SQL", "occurrence_count": 1} in result


@pytest.mark.anyio
async def test_scope_enforcement_trainer_cannot_view_other_trainer(db_session, monkeypatch):
    async def fake_get_batches_for_trainer(self, trainer_id):
        return []

    monkeypatch.setattr(TrainerAnalyticsRepository, "get_batches_for_trainer", fake_get_batches_for_trainer)

    service = TrainerAnalyticsService(TrainerAnalyticsRepository(db_session), AssessmentRepository(db_session))
    trainer_principal = SimpleNamespace(user_id=1, type="trainer")
    admin_principal = SimpleNamespace(user_id=999, type="admin")

    with pytest.raises(ServiceError) as exc_info:
        await service.batch_performance_for_trainer(2, trainer_principal)
    assert exc_info.value.status_code == 403

    result = await service.batch_performance_for_trainer(2, admin_principal)
    assert result == []


@pytest.mark.anyio
async def test_generate_recommendations_calls_ai_provider(db_session, monkeypatch):
    async def fake_get_students_in_batch(self, batch_id):
        return []

    async def fake_verify_batch(self, batch_id, trainer_id):
        return True

    monkeypatch.setattr(TrainerAnalyticsRepository, "get_students_in_batch", fake_get_students_in_batch)
    monkeypatch.setattr(TrainerAnalyticsRepository, "verify_batch_belongs_to_trainer", fake_verify_batch)

    class FakeProvider:
        async def generate_trainer_recommendations(self, batch_summary):
            return ["Focus on SQL fundamentals", "Schedule a revision session"]

    monkeypatch.setattr("app.services.trainer_analytics_service.get_reliable_ai_provider", lambda: FakeProvider())

    service = TrainerAnalyticsService(TrainerAnalyticsRepository(db_session), AssessmentRepository(db_session))
    principal = SimpleNamespace(user_id=42, type="trainer")

    result = await service.generate_recommendations(42, 1, principal)

    assert result == ["Focus on SQL fundamentals", "Schedule a revision session"]
