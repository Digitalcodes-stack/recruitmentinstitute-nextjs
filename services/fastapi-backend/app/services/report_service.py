import re
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.exceptions import ServiceError
from app.models.ai_assessment import AIGeneratedNote, StudentStudyPlan
from app.models.assessment import StudentAssessment
from app.models.report import AssessmentReport
from app.repositories.assessment_repository import AssessmentRepository


def _markdown_to_reportlab(text: str) -> str:
    """Convert the limited markdown subset our notes generator produces
    (### headers, **bold**, - bullets) into reportlab's HTML-like markup."""
    lines = text.split("\n")
    out: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("### "):
            out.append(f"<b>{stripped[4:]}</b>")
        elif stripped.startswith("- "):
            out.append(f"&bull; {stripped[2:]}")
        else:
            out.append(stripped)
    joined = "<br/>".join(out)
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", joined)


def _render_pdf(
    file_path: Path,
    student_assessment: StudentAssessment,
    strong_topics: list[str],
    weak_topics: list[str],
    summary: str,
    notes: list[AIGeneratedNote],
    plan: StudentStudyPlan | None,
) -> None:
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(str(file_path), pagesize=A4)
    elements = []

    elements.append(Paragraph("Student Assessment Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    summary_table = Table(
        [
            ["Student ID", str(student_assessment.student_id)],
            ["Assessment ID", str(student_assessment.assessment_id)],
            ["Score", f"{student_assessment.score:.1f}" if student_assessment.score is not None else "N/A"],
            ["Percentage", f"{student_assessment.percentage:.1f}%" if student_assessment.percentage is not None else "N/A"],
            ["Status", student_assessment.status],
        ],
        colWidths=[150, 300],
    )
    summary_table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.grey), ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke)]))
    elements.append(summary_table)
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Strong Topics", styles["Heading2"]))
    elements.append(Paragraph(", ".join(strong_topics) or "None identified", styles["BodyText"]))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Weak Topics", styles["Heading2"]))
    elements.append(Paragraph(", ".join(weak_topics) or "None identified", styles["BodyText"]))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("AI Analysis Summary", styles["Heading2"]))
    elements.append(Paragraph(summary or "No summary available.", styles["BodyText"]))
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Personalized Notes", styles["Heading2"]))
    if notes:
        for note in notes:
            elements.append(Paragraph(note.topic_name, styles["Heading3"]))
            elements.append(Paragraph(_markdown_to_reportlab(note.notes_content), styles["BodyText"]))
            elements.append(Spacer(1, 8))
    else:
        elements.append(Paragraph("No notes were generated for this attempt.", styles["BodyText"]))
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Study Plan", styles["Heading2"]))
    if plan:
        plan_rows = [[key.replace("_", " ").title(), str(value)] for key, value in plan.plan_json.items()]
        plan_table = Table(plan_rows, colWidths=[100, 350])
        plan_table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.grey)]))
        elements.append(plan_table)
    else:
        elements.append(Paragraph("No study plan was generated for this attempt.", styles["BodyText"]))
    elements.append(Spacer(1, 16))

    elements.append(Paragraph("Trainer Remarks", styles["Heading2"]))
    elements.append(Paragraph(student_assessment.trainer_remarks or "No remarks yet.", styles["BodyText"]))

    doc.build(elements)


@dataclass
class ReportService:
    repo: AssessmentRepository
    storage_root: Path

    @staticmethod
    def _assert_can_access(owner_student_id: int, principal) -> None:
        if principal.type in ("admin", "trainer"):
            return
        if principal.user_id != owner_student_id:
            raise ServiceError("Report not found", 404)

    async def generate_pdf(self, student_assessment_id: int) -> AssessmentReport:
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        analysis = await self.repo.get_analysis_by_student_assessment(student_assessment_id)
        notes = await self.repo.get_notes_by_student_assessment(student_assessment_id)
        plan = await self.repo.get_study_plan_by_student_assessment(student_assessment_id)

        self.storage_root.mkdir(parents=True, exist_ok=True)
        filename = f"report-{student_assessment_id}-{uuid4().hex}.pdf"
        file_path = self.storage_root / filename

        _render_pdf(
            file_path,
            student_assessment,
            analysis.strong_topics if analysis else [],
            analysis.weak_topics if analysis else [],
            analysis.analysis_json.get("summary", "") if analysis else "",
            notes,
            plan,
        )

        report = await self.repo.get_report(student_assessment_id)
        if report is None:
            report = await self.repo.upsert_report(
                AssessmentReport(student_assessment_id=student_assessment_id, status="ready", file_path=str(file_path))
            )
        else:
            report.status = "ready"
            report.file_path = str(file_path)
            report.error_message = None
        return report

    async def get_report_for_download(self, student_assessment_id: int, principal) -> tuple[AssessmentReport, StudentAssessment]:
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        self._assert_can_access(student_assessment.student_id, principal)
        report = await self.repo.get_report(student_assessment_id)
        if not report or report.status != "ready" or not report.file_path:
            raise ServiceError("Report not ready", 404)
        return report, student_assessment

    async def get_status(self, student_assessment_id: int, principal) -> AssessmentReport:
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        self._assert_can_access(student_assessment.student_id, principal)
        report = await self.repo.get_report(student_assessment_id)
        if not report:
            raise ServiceError("Report not found", 404)
        return report
