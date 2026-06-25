from datetime import datetime, timedelta, timezone
from io import BytesIO
from types import SimpleNamespace

import pytest
from starlette.datastructures import Headers, UploadFile

from app.core.exceptions import ServiceError
from app.models.assessment import Assessment
from app.models.placement import PlacementTracking
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.placement_repository import PlacementRepository
from app.repositories.resume_repository import ResumeRepository
from app.schemas.assessment import AssessmentSubmitRequest, TopicScoreInput
from app.schemas.meeting import MeetingCreate
from app.services.ai.base import PerformanceAnalysis
from app.services.assessment_service import AssessmentService
from app.services.meeting_service import MeetingService
from app.services.placement_service import PlacementService
from app.services.resume_service import ResumeService


@pytest.mark.anyio
async def test_resume_upload_and_retrieval(db_session, tmp_path):
    student_id = 4001

    file = UploadFile(file=BytesIO(b"fake pdf"), filename="resume.pdf", headers=Headers({"content-type": "application/pdf"}))
    created = await ResumeService(ResumeRepository(db_session), tmp_path).upload(student_id, file)
    fetched = await ResumeService(ResumeRepository(db_session), tmp_path).get_resume(student_id, created.id)
    assert fetched.filename == created.filename


@pytest.mark.anyio
async def test_meeting_scheduling(db_session, monkeypatch):
    trainer_id = 5001

    class Provider:
        async def create(self, *args, **kwargs):
            return SimpleNamespace(external_meeting_id="gmeet-1", meeting_url="https://meet.example.com/abc")

        async def update(self, *args, **kwargs):
            return SimpleNamespace(external_meeting_id="gmeet-1", meeting_url="https://meet.example.com/abc")

        async def cancel(self, *args, **kwargs):
            return None

    async def fake_get_trainer(self, trainer_id):
        return None

    monkeypatch.setattr("app.services.meeting_service.get_meeting_provider", lambda: Provider())
    monkeypatch.setattr("app.services.meeting_service.IdentityRepository.get_trainer", fake_get_trainer)
    created = await MeetingService(MeetingRepository(db_session)).create(
        MeetingCreate(
            title="Weekly Sync",
            description="Training meeting",
            start_time=datetime.now(timezone.utc) + timedelta(days=1),
            end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=1),
            trainer_id=trainer_id,
        )
    )
    assert created.meeting_url == "https://meet.example.com/abc"


@pytest.mark.anyio
async def test_placement_tracking_creation(db_session):
    student_id = 6001

    tracking = await PlacementService(PlacementRepository(db_session)).create_tracking(
        PlacementTracking(student_id=student_id, job_title="Developer", company_name="Acme")
    )
    assert tracking.company_name == "Acme"
    assert tracking.student_id == student_id


@pytest.mark.anyio
async def test_assessment_submit_runs_ai_pipeline(db_session, monkeypatch):
    student_id = 7001

    db_session.add(Assessment(course_id=1, assessment_name="Python Basics", total_marks=100, duration_minutes=30))
    await db_session.commit()
    assessment = (await db_session.execute(Assessment.__table__.select())).fetchone()

    class FakeProvider:
        async def analyze_performance(self, score, percentage, topic_scores):
            return PerformanceAnalysis(
                strong_topics=["Python Basics"],
                weak_topics=["OOP"],
                difficulty_breakdown={"easy": 90.0, "hard": 40.0},
                summary="Strong on basics, weak on OOP.",
            )

        async def generate_notes(self, topic_name, context_chunks=None):
            return f"# Notes for {topic_name}"

        async def generate_study_plan(self, weak_topics, strong_topics):
            return {"day_1": "OOP", "day_2": "Inheritance", "day_3": "Polymorphism", "day_4": "Quiz", "day_5": "Revision"}

        async def generate_recommendations(self, percentage):
            return ["Practice OOP exercises", "Review inheritance examples"]

    class FakeRedis:
        async def get(self, key):
            return None

        async def set(self, key, value, ex=None):
            return True

    monkeypatch.setattr("app.services.assessment_service.get_reliable_ai_provider", lambda: FakeProvider())
    monkeypatch.setattr("app.services.assessment_service.create_redis_client", lambda: FakeRedis())

    payload = AssessmentSubmitRequest(
        assessment_id=assessment.id,
        topic_scores=[
            TopicScoreInput(topic_name="Python Basics", correct=9, total=10),
            TopicScoreInput(topic_name="OOP", correct=4, total=10),
        ],
    )

    student_assessment, analysis, notes, study_plan, recommendations = await AssessmentService(
        AssessmentRepository(db_session)
    ).submit(student_id, payload)

    assert student_assessment.student_id == student_id
    assert analysis.weak_topics == ["OOP"]
    assert len(notes) == 1
    assert notes[0].topic_name == "OOP"
    assert study_plan.plan_json["day_1"] == "OOP"
    assert recommendations == ["Practice OOP exercises", "Review inheritance examples"]

    service = AssessmentService(AssessmentRepository(db_session))
    owner = SimpleNamespace(user_id=student_id, type="student")
    other_student = SimpleNamespace(user_id=student_id + 1, type="student")
    admin = SimpleNamespace(user_id=999, type="admin")

    result_for_owner, _ = await service.get_result(student_assessment.id, owner)
    assert result_for_owner.id == student_assessment.id

    with pytest.raises(ServiceError):
        await service.get_result(student_assessment.id, other_student)

    admin_result, _ = await service.get_result(student_assessment.id, admin)
    assert admin_result.id == student_assessment.id
