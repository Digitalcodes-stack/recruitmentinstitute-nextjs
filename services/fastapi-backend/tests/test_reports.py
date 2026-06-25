from types import SimpleNamespace

import pytest

from app.core.exceptions import ServiceError
from app.models.ai_assessment import AIAssessmentAnalysis, AIGeneratedNote, StudentStudyPlan
from app.models.assessment import Assessment, StudentAssessment
from app.repositories.assessment_repository import AssessmentRepository
from app.services.report_service import ReportService
from app.workers.tasks import _generate_assessment_report


async def _seed_assessment(db_session) -> StudentAssessment:
    db_session.add(Assessment(course_id=1, assessment_name="HR Basics", total_marks=100, duration_minutes=30))
    await db_session.commit()
    assessment = (await db_session.execute(Assessment.__table__.select())).fetchone()

    student_assessment = StudentAssessment(
        student_id=8001, assessment_id=assessment.id, score=72.0, percentage=72.0, status="completed"
    )
    db_session.add(student_assessment)
    await db_session.flush()

    db_session.add(AIAssessmentAnalysis(
        student_id=8001, assessment_id=student_assessment.id, score=72.0, percentage=72.0,
        strong_topics=["Sourcing"], weak_topics=["Interview Scheduling"],
        analysis_json={"summary": "Good on sourcing, weak on scheduling."},
    ))
    db_session.add(AIGeneratedNote(
        student_id=8001, assessment_id=student_assessment.id, topic_name="Interview Scheduling",
        notes_content="# Notes\nSchedule interviews promptly.",
    ))
    db_session.add(StudentStudyPlan(
        student_id=8001, assessment_id=student_assessment.id,
        plan_json={"day_1": "Review scheduling", "day_2": "Practice", "day_3": "Mock", "day_4": "Quiz", "day_5": "Revise"},
    ))
    await db_session.commit()
    await db_session.refresh(student_assessment)
    return student_assessment


@pytest.mark.anyio
async def test_generate_pdf_writes_valid_pdf_bytes(db_session, tmp_path):
    student_assessment = await _seed_assessment(db_session)

    report = await ReportService(AssessmentRepository(db_session), tmp_path).generate_pdf(student_assessment.id)
    await db_session.commit()

    assert report.status == "ready"
    pdf_bytes = open(report.file_path, "rb").read()
    assert pdf_bytes[:5] == b"%PDF-"


@pytest.mark.anyio
async def test_generate_pdf_handles_missing_remarks_gracefully(db_session, tmp_path):
    student_assessment = await _seed_assessment(db_session)
    assert student_assessment.trainer_remarks is None

    report = await ReportService(AssessmentRepository(db_session), tmp_path).generate_pdf(student_assessment.id)
    assert report.status == "ready"


@pytest.mark.anyio
async def test_download_ownership_enforced(db_session, tmp_path):
    student_assessment = await _seed_assessment(db_session)
    service = ReportService(AssessmentRepository(db_session), tmp_path)
    await service.generate_pdf(student_assessment.id)
    await db_session.commit()

    owner = SimpleNamespace(user_id=8001, type="student")
    other_student = SimpleNamespace(user_id=9999, type="student")
    admin = SimpleNamespace(user_id=1, type="admin")

    report, _ = await service.get_report_for_download(student_assessment.id, owner)
    assert report.status == "ready"

    with pytest.raises(ServiceError):
        await service.get_report_for_download(student_assessment.id, other_student)

    report, _ = await service.get_report_for_download(student_assessment.id, admin)
    assert report.status == "ready"


@pytest.mark.anyio
async def test_celery_task_function_runs_synchronously(db_session, monkeypatch, tmp_path):
    student_assessment = await _seed_assessment(db_session)
    monkeypatch.setattr("app.workers.tasks.REPORTS_STORAGE_ROOT", tmp_path)

    result = await _generate_assessment_report(student_assessment.id)

    assert result["status"] == "ready"
    assert result["file_path"] is not None


@pytest.mark.anyio
async def test_trainer_remarks_update(db_session):
    student_assessment = await _seed_assessment(db_session)
    repo = AssessmentRepository(db_session)

    updated = await repo.set_trainer_remarks(student_assessment.id, "Great improvement this term.")
    await repo.commit()

    assert updated.trainer_remarks == "Great improvement this term."
