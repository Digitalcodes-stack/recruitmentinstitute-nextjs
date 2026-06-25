from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_principal, get_db_session, require_principal_types
from app.api.responses import success_response
from app.models.report import AssessmentReport
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.schemas.assessment import (
    AssessmentResultRead,
    AssessmentSubmitRequest,
    AssessmentSubmitResult,
    AIGeneratedNoteRead,
    StudentAssessmentRead,
    StudentStudyPlanRead,
    AssessmentGenerateRequest,
)
from app.schemas.common import ResponseEnvelope
from app.schemas.question_bank import (
    AssessmentCreate,
    AssessmentGradeRequest,
    AssessmentQuestionRead,
    AssessmentSummaryRead,
    QuestionBankItemCreate,
    QuestionBankItemRead,
)
from app.schemas.report import ReportStatusRead, ReportTriggerResponse, TrainerRemarksUpdate
from app.services.assessment_service import AssessmentService
from app.services.ai.retrieval_service import RetrievalService
from app.services.question_bank_service import QuestionBankService
from app.services.report_service import ReportService
from app.workers.tasks import REPORTS_STORAGE_ROOT, generate_assessment_report

router = APIRouter()


def _question_bank_service(db: AsyncSession) -> QuestionBankService:
    repo = AssessmentRepository(db)
    return QuestionBankService(repo, AssessmentService(repo, RetrievalService(EmbeddingRepository(db))))


@router.post("/generate", response_model=ResponseEnvelope[AssessmentSummaryRead], status_code=status.HTTP_201_CREATED)
async def generate_assessment(
    payload: AssessmentGenerateRequest,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin", "trainer")),
):
    assessment = await AssessmentService(
        AssessmentRepository(db), RetrievalService(EmbeddingRepository(db))
    ).generate_assessment(
        course_id=payload.course_id,
        name=payload.name,
        topics=payload.topics,
        types=payload.question_types,
        count=payload.question_count,
    )
    return success_response(jsonable_encoder(assessment), status_code=status.HTTP_201_CREATED)


@router.post("/submit", response_model=ResponseEnvelope[AssessmentSubmitResult], status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    payload: AssessmentSubmitRequest,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    student_assessment, analysis, notes, study_plan, recommendations = await AssessmentService(
        AssessmentRepository(db), RetrievalService(EmbeddingRepository(db))
    ).submit(principal.user_id, payload)
    return success_response(
        jsonable_encoder({
            "student_assessment_id": student_assessment.id,
            "analysis": analysis,
            "notes": notes,
            "study_plan": study_plan,
            "recommendations": recommendations,
        }),
        "Assessment submitted and analyzed successfully",
        status_code=status.HTTP_201_CREATED,
    )


@router.get("/my", response_model=ResponseEnvelope[list[StudentAssessmentRead]])
async def list_my_assessments(
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    attempts = await AssessmentService(AssessmentRepository(db)).list_my_assessments(principal.user_id)
    return success_response(jsonable_encoder(attempts))


@router.post("/", response_model=ResponseEnvelope[AssessmentSummaryRead], status_code=status.HTTP_201_CREATED)
async def create_assessment(
    payload: AssessmentCreate,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin")),
):
    assessment = await _question_bank_service(db).create_assessment(
        payload.course_id, payload.assessment_name, payload.total_marks, payload.duration_minutes
    )
    return success_response(jsonable_encoder(assessment), status_code=status.HTTP_201_CREATED)


@router.get("/by-course/{course_id}", response_model=ResponseEnvelope[AssessmentSummaryRead])
async def get_assessment_by_course(
    course_id: int,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(get_current_principal),
):
    assessment = await _question_bank_service(db).get_assessment_for_course(course_id)
    return success_response(jsonable_encoder(assessment))


@router.get("/result/{id}", response_model=ResponseEnvelope[AssessmentResultRead])
async def get_assessment_result(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    student_assessment, analysis = await AssessmentService(AssessmentRepository(db)).get_result(id, principal)
    return success_response(jsonable_encoder({"student_assessment": student_assessment, "analysis": analysis}))


@router.get("/notes/{id}", response_model=ResponseEnvelope[list[AIGeneratedNoteRead]])
async def get_assessment_notes(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    notes = await AssessmentService(AssessmentRepository(db)).get_notes(id, principal)
    return success_response(jsonable_encoder(notes))


@router.get("/study-plan/{id}", response_model=ResponseEnvelope[StudentStudyPlanRead])
async def get_assessment_study_plan(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    plan = await AssessmentService(AssessmentRepository(db)).get_study_plan(id, principal)
    return success_response(jsonable_encoder(plan))


@router.post("/report/{id}", response_model=ResponseEnvelope[ReportTriggerResponse])
async def trigger_assessment_report(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    repo = AssessmentRepository(db)
    student_assessment = await repo.get_student_assessment(id)
    if student_assessment:
        ReportService._assert_can_access(student_assessment.student_id, principal)
    result = generate_assessment_report.delay(id)
    existing = await repo.get_report(id)
    if existing is None:
        await repo.upsert_report(AssessmentReport(student_assessment_id=id, status="generating", celery_task_id=result.id))
    else:
        existing.status = "generating"
        existing.celery_task_id = result.id
    await repo.commit()
    return success_response({"student_assessment_id": id, "task_id": result.id, "status": "generating"})


@router.post("/report/{id}/run-now", response_model=ResponseEnvelope[ReportStatusRead])
async def run_assessment_report_now(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    repo = AssessmentRepository(db)
    student_assessment = await repo.get_student_assessment(id)
    if student_assessment:
        ReportService._assert_can_access(student_assessment.student_id, principal)
    report = await ReportService(repo, REPORTS_STORAGE_ROOT).generate_pdf(id)
    await repo.commit()
    return success_response(jsonable_encoder(report))


@router.get("/report/{id}/status", response_model=ResponseEnvelope[ReportStatusRead])
async def get_assessment_report_status(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    report = await ReportService(AssessmentRepository(db), REPORTS_STORAGE_ROOT).get_status(id, principal)
    return success_response(jsonable_encoder(report))


@router.get("/report/{id}/download")
async def download_assessment_report(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    report, _ = await ReportService(AssessmentRepository(db), REPORTS_STORAGE_ROOT).get_report_for_download(id, principal)
    return FileResponse(report.file_path, media_type="application/pdf", filename=f"assessment-report-{id}.pdf")


@router.patch("/{id}/remarks", response_model=ResponseEnvelope[StudentAssessmentRead])
async def update_trainer_remarks(
    id: int,
    payload: TrainerRemarksUpdate,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin", "trainer")),
):
    repo = AssessmentRepository(db)
    student_assessment = await repo.set_trainer_remarks(id, payload.remarks)
    await repo.commit()
    await db.refresh(student_assessment)
    return success_response(jsonable_encoder(student_assessment))


@router.post("/{id}/questions", response_model=ResponseEnvelope[QuestionBankItemRead], status_code=status.HTTP_201_CREATED)
async def add_question(
    id: int,
    payload: QuestionBankItemCreate,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin")),
):
    question = await _question_bank_service(db).add_question(id, payload)
    return success_response(jsonable_encoder(question), status_code=status.HTTP_201_CREATED)


@router.get("/{id}/questions", response_model=ResponseEnvelope[list[QuestionBankItemRead]])
async def list_questions(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin")),
):
    questions = await _question_bank_service(db).list_questions(id)
    return success_response(jsonable_encoder(questions))


@router.delete("/{id}/questions/{question_id}", response_model=ResponseEnvelope[None])
async def delete_question(
    id: int,
    question_id: int,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(require_principal_types("admin")),
):
    await _question_bank_service(db).delete_question(question_id)
    return success_response(None, "Question deleted successfully")


@router.get("/{id}/start", response_model=ResponseEnvelope[list[AssessmentQuestionRead]])
async def start_assessment(
    id: int,
    db: AsyncSession = Depends(get_db_session),
    _principal=Depends(get_current_principal),
):
    questions = await _question_bank_service(db).get_assessment_questions_for_student(id)
    safe_questions = [AssessmentQuestionRead.model_validate(q) for q in questions]
    return success_response(jsonable_encoder(safe_questions))


@router.post("/{id}/grade-and-submit", response_model=ResponseEnvelope[AssessmentSubmitResult], status_code=status.HTTP_201_CREATED)
async def grade_and_submit_assessment(
    id: int,
    payload: AssessmentGradeRequest,
    db: AsyncSession = Depends(get_db_session),
    principal=Depends(get_current_principal),
):
    if payload.assessment_id != id:
        payload = AssessmentGradeRequest(assessment_id=id, answers=payload.answers)
    student_assessment, analysis, notes, study_plan, recommendations = await _question_bank_service(db).grade_and_submit(
        principal.user_id, payload
    )
    return success_response(
        jsonable_encoder({
            "student_assessment_id": student_assessment.id,
            "analysis": analysis,
            "notes": notes,
            "study_plan": study_plan,
            "recommendations": recommendations,
        }),
        "Assessment submitted and analyzed successfully",
        status_code=status.HTTP_201_CREATED,
    )
