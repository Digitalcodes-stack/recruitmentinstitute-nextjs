import re
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from app.core.exceptions import ServiceError
from app.models.ai_assessment import AIGeneratedNote, StudentStudyPlan
from app.models.assessment import StudentAssessment
from app.models.report import AssessmentReport
from app.repositories.assessment_repository import AssessmentRepository

# ── Brand palette ──────────────────────────────────────────────────────────────
NAVY     = colors.HexColor("#0F172A")
BLUE     = colors.HexColor("#1E40AF")
BLUE_MID = colors.HexColor("#2563EB")
BLUE_LT  = colors.HexColor("#EFF6FF")
BLUE_BDR = colors.HexColor("#BFDBFE")

GREEN    = colors.HexColor("#16A34A")
GREEN_LT = colors.HexColor("#F0FDF4")
GREEN_BD = colors.HexColor("#BBF7D0")

RED      = colors.HexColor("#DC2626")
RED_LT   = colors.HexColor("#FEF2F2")
RED_BD   = colors.HexColor("#FECACA")

AMBER    = colors.HexColor("#D97706")
AMBER_LT = colors.HexColor("#FFFBEB")

SLATE    = colors.HexColor("#475569")
SLATE_LT = colors.HexColor("#94A3B8")
GREY_BG  = colors.HexColor("#F8FAFC")
WHITE    = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm


def _score_color(pct: float):
    if pct >= 75:
        return GREEN
    if pct >= 50:
        return AMBER
    return RED


def _score_label(pct: float) -> str:
    if pct >= 75:
        return "EXCELLENT"
    if pct >= 50:
        return "GOOD"
    return "NEEDS IMPROVEMENT"


def _markdown_to_reportlab(text: str) -> str:
    """Blank lines in the source markdown are paragraph separators, not
    content — joining every line (including empties) with <br/> turns each
    blank line into a full extra line of vertical space in the rendered
    PDF, which can blow a single note's Paragraph past a full page's height.
    This keeps one <br/> between non-blank lines and collapses runs of
    blank lines instead of preserving each one."""
    lines = [line.strip() for line in text.split("\n")]
    out: list[str] = []
    for line in lines:
        if not line:
            continue
        if line.startswith("### "):
            out.append(f"<b>{line[4:]}</b>")
        elif line.startswith("## "):
            out.append(f"<b>{line[3:]}</b>")
        elif line.startswith("- "):
            out.append(f"&nbsp;&nbsp;• {line[2:]}")
        else:
            out.append(line)
    joined = "<br/>".join(out)
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", joined)


def _styles():
    base = getSampleStyleSheet()
    s = {}

    s["cover_name"] = ParagraphStyle("cover_name",
        fontName="Helvetica-Bold", fontSize=22, textColor=WHITE,
        alignment=TA_LEFT, leading=28)
    s["cover_sub"] = ParagraphStyle("cover_sub",
        fontName="Helvetica", fontSize=11, textColor=colors.HexColor("#CBD5E1"),
        alignment=TA_LEFT, leading=16)
    s["score_big"] = ParagraphStyle("score_big",
        fontName="Helvetica-Bold", fontSize=48, textColor=WHITE,
        alignment=TA_CENTER, leading=54)
    s["score_label"] = ParagraphStyle("score_label",
        fontName="Helvetica-Bold", fontSize=11, textColor=WHITE,
        alignment=TA_CENTER, spaceAfter=2)
    s["section_h"] = ParagraphStyle("section_h",
        fontName="Helvetica-Bold", fontSize=13, textColor=BLUE,
        spaceBefore=16, spaceAfter=6, leading=16)
    s["sub_h"] = ParagraphStyle("sub_h",
        fontName="Helvetica-Bold", fontSize=10, textColor=NAVY,
        spaceBefore=10, spaceAfter=4, leading=14)
    s["body"] = ParagraphStyle("body",
        fontName="Helvetica", fontSize=9.5, textColor=SLATE,
        leading=14, spaceAfter=4)
    s["tag_green"] = ParagraphStyle("tag_green",
        fontName="Helvetica-Bold", fontSize=8.5, textColor=GREEN,
        leading=12, alignment=TA_CENTER)
    s["tag_red"] = ParagraphStyle("tag_red",
        fontName="Helvetica-Bold", fontSize=8.5, textColor=RED,
        leading=12, alignment=TA_CENTER)
    s["cell_key"] = ParagraphStyle("cell_key",
        fontName="Helvetica-Bold", fontSize=9, textColor=NAVY, leading=12)
    s["cell_val"] = ParagraphStyle("cell_val",
        fontName="Helvetica", fontSize=9, textColor=SLATE, leading=12)
    s["day_key"] = ParagraphStyle("day_key",
        fontName="Helvetica-Bold", fontSize=9, textColor=BLUE, leading=12)
    s["footer"] = ParagraphStyle("footer",
        fontName="Helvetica", fontSize=8, textColor=SLATE_LT,
        alignment=TA_CENTER)
    return s


def _render_pdf(
    file_path: Path,
    student_assessment: StudentAssessment,
    total_marks: int,
    strong_topics: list[str],
    weak_topics: list[str],
    summary: str,
    notes: list[AIGeneratedNote],
    plan: StudentStudyPlan | None,
) -> None:
    S = _styles()
    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=14 * mm, bottomMargin=14 * mm,
    )
    W = PAGE_W - 2 * MARGIN  # usable width
    elements = []

    pct = student_assessment.percentage or 0.0
    score = student_assessment.score or 0.0
    s_color = _score_color(pct)
    s_label = _score_label(pct)

    # ── HEADER BANNER ────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("RECRUITMENT INSTITUTE", S["cover_name"]),
        Paragraph(f"<b>{pct:.1f}%</b>", S["score_big"]),
    ]]
    header_sub_data = [[
        Paragraph("Student Assessment Report", S["cover_sub"]),
        Paragraph(s_label, S["score_label"]),
    ]]
    col1 = W * 0.62
    col2 = W * 0.38

    header_tbl = Table(header_data, colWidths=[col1, col2])
    header_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (0, -1), 18),
        ("RIGHTPADDING", (1, 0), (1, -1), 18),
        ("ROUNDEDCORNERS", [6, 6, 0, 0]),
    ]))

    header_sub_tbl = Table(header_sub_data, colWidths=[col1, col2])
    header_sub_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE),
        ("ALIGN", (1, 0), (1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (0, -1), 18),
        ("RIGHTPADDING", (1, 0), (1, -1), 18),
        ("ROUNDEDCORNERS", [0, 0, 6, 6]),
    ]))

    elements.append(header_tbl)
    elements.append(header_sub_tbl)
    elements.append(Spacer(1, 14))

    # ── SCORE METRICS ROW ───────────────────────────────────────────────────
    metrics = [
        ("Score", f"{score:.1f} / {total_marks}", BLUE_LT, BLUE),
        ("Percentage", f"{pct:.1f}%", GREEN_LT if pct >= 50 else RED_LT, GREEN if pct >= 50 else RED),
        ("Status", student_assessment.status.replace("_", " ").title(), GREY_BG, SLATE),
        ("Student ID", str(student_assessment.student_id), GREY_BG, NAVY),
    ]
    metric_cells = []
    for label, value, bg, fg in metrics:
        cell_tbl = Table([
            [Paragraph(label.upper(), ParagraphStyle("ml", fontName="Helvetica", fontSize=7.5,
                textColor=fg, alignment=TA_CENTER, leading=10))],
            [Paragraph(f"<b>{value}</b>", ParagraphStyle("mv", fontName="Helvetica-Bold",
                fontSize=13, textColor=fg, alignment=TA_CENTER, leading=16))],
        ], colWidths=[W / 4 - 4])
        cell_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("ROUNDEDCORNERS", [8, 8, 8, 8]),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ]))
        metric_cells.append(cell_tbl)

    metrics_row = Table([metric_cells], colWidths=[W / 4] * 4)
    metrics_row.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(metrics_row)
    elements.append(Spacer(1, 18))

    # ── STRONG / WEAK TOPICS ─────────────────────────────────────────────────
    _CHIP_FONT, _CHIP_SIZE = "Helvetica-Bold", 8.5
    _CHIP_H_PAD, _CHIP_GAP = 16, 6  # left+right padding inside chip, gap between chips

    def _chip_width(text: str) -> float:
        return stringWidth(text, _CHIP_FONT, _CHIP_SIZE) + _CHIP_H_PAD

    def _topic_chips(topic_list, bg, border_c, label_style, max_w: float):
        """Wrap chips onto as many rows as needed based on each chip's real
        measured text width, instead of forcing a fixed N-per-row grid whose
        evenly-split columns clip or overlap text wider than the average."""
        if not topic_list:
            return [Paragraph("<i>None identified</i>", S["body"])]

        rows: list[list[str]] = []
        row_widths: list[list[float]] = []
        current_row: list[str] = []
        current_widths: list[float] = []
        current_total = 0.0

        for t in topic_list:
            w = _chip_width(t)
            projected = current_total + w + (_CHIP_GAP if current_row else 0)
            if current_row and projected > max_w:
                rows.append(current_row)
                row_widths.append(current_widths)
                current_row, current_widths, current_total = [], [], 0.0
            current_row.append(t)
            current_widths.append(w)
            current_total += w + (_CHIP_GAP if len(current_row) > 1 else 0)
        if current_row:
            rows.append(current_row)
            row_widths.append(current_widths)

        chip_tables = []
        for row_terms, widths in zip(rows, row_widths):
            cells = [Paragraph(t, label_style) for t in row_terms]
            row_tbl = Table([cells], colWidths=widths, hAlign="LEFT")
            style = [
                ("BACKGROUND", (i, 0), (i, 0), bg) for i in range(len(cells))
            ] + [
                ("BOX", (i, 0), (i, 0), 1, border_c) for i in range(len(cells))
            ] + [
                ("ROUNDEDCORNERS", [10, 10, 10, 10]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), _CHIP_H_PAD / 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), _CHIP_H_PAD / 2),
            ]
            row_tbl.setStyle(TableStyle(style))
            chip_tables.append(row_tbl)
            chip_tables.append(Spacer(1, 4))
        return chip_tables

    _chip_col_w = W * 0.48

    two_col_data = [[
        # left: strong topics
        [
            Paragraph("Strong Topics", ParagraphStyle("sh", fontName="Helvetica-Bold",
                fontSize=11, textColor=GREEN, leading=14, spaceAfter=6)),
            *_topic_chips(strong_topics, GREEN_LT, GREEN_BD, S["tag_green"], _chip_col_w),
            Spacer(1, 14),
            Paragraph("Weak Topics", ParagraphStyle("wh", fontName="Helvetica-Bold",
                fontSize=11, textColor=RED, leading=14, spaceAfter=6)),
            *_topic_chips(weak_topics, RED_LT, RED_BD, S["tag_red"], _chip_col_w),
        ],
        # right: performance bar chart
        [
            Paragraph("Topic-wise Performance", ParagraphStyle("ph", fontName="Helvetica-Bold",
                fontSize=11, textColor=NAVY, leading=14, spaceAfter=8)),
        ] + _build_bar_chart(strong_topics, weak_topics, W * 0.46),
    ]]

    left_cell_table = Table([[el] for el in two_col_data[0][0]], colWidths=[W * 0.48])
    left_cell_table.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    right_cell_table = Table([[el] for el in two_col_data[0][1]], colWidths=[W * 0.46])
    right_cell_table.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    two_col = Table([[left_cell_table, right_cell_table]], colWidths=[W * 0.52, W * 0.48])
    two_col.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LINEAFTER", (0, 0), (0, -1), 1, colors.HexColor("#F1F5F9")),
    ]))
    elements.append(two_col)
    elements.append(Spacer(1, 18))

    # ── AI SUMMARY ───────────────────────────────────────────────────────────
    if summary:
        elements.append(Paragraph("AI Analysis Summary", S["section_h"]))
        summary_box = Table([[Paragraph(f"<b>TIP:</b>  {summary}", S["body"])]], colWidths=[W])
        summary_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLUE_LT),
            ("BOX", (0, 0), (-1, -1), 1.5, BLUE_BDR),
            ("ROUNDEDCORNERS", [8, 8, 8, 8]),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ]))
        elements.append(summary_box)
        elements.append(Spacer(1, 18))

    # ── PERSONALIZED NOTES ───────────────────────────────────────────────────
    note_colors = [
        (colors.HexColor("#F0F9FF"), colors.HexColor("#0EA5E9")),  # sky
        (colors.HexColor("#FDF4FF"), colors.HexColor("#A855F7")),  # purple
        (colors.HexColor("#FFF7ED"), colors.HexColor("#EA580C")),  # orange
        (colors.HexColor("#F0FDF4"), colors.HexColor("#16A34A")),  # green
        (colors.HexColor("#FEF2F2"), colors.HexColor("#DC2626")),  # red
    ]
    elements.append(Paragraph("Personalized Notes", S["section_h"]))
    if notes:
        for i, note in enumerate(notes):
            bg, accent = note_colors[i % len(note_colors)]
            heading_p = Paragraph(
                f"<b>{note.topic_name}</b>",
                ParagraphStyle("nt", fontName="Helvetica-Bold", fontSize=10, textColor=accent, leading=14),
            )
            body_p = Paragraph(_markdown_to_reportlab(note.notes_content), S["body"])
            # Two real rows (not nested single-cell tables) so reportlab's
            # default splitByRow can break the table across pages instead
            # of demanding it fit on one page as a single atomic block.
            note_tbl = Table([[heading_p], [body_p]], colWidths=[W])
            note_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (0, 0), 12),
                ("BOTTOMPADDING", (0, 0), (0, 0), 4),
                ("TOPPADDING", (0, 1), (0, 1), 4),
                ("BOTTOMPADDING", (0, 1), (0, 1), 12),
                ("BOX", (0, 0), (-1, -1), 1.5, accent),
                ("ROUNDEDCORNERS", [8, 8, 8, 8]),
                ("LINEBELOW", (0, 0), (-1, 0), 1, accent),
            ]))
            elements.append(note_tbl)
            elements.append(Spacer(1, 8))
    else:
        elements.append(Paragraph("No notes were generated for this attempt.", S["body"]))
    elements.append(Spacer(1, 10))

    # ── STUDY PLAN ───────────────────────────────────────────────────────────
    elements.append(Paragraph("Study Plan", S["section_h"]))
    if plan and plan.plan_json:
        plan_rows = [
            [
                Paragraph(k.replace("_", " ").title(), S["day_key"]),
                Paragraph(str(v), S["body"]),
            ]
            for k, v in plan.plan_json.items()
        ]
        plan_tbl = Table(plan_rows, colWidths=[W * 0.18, W * 0.82])
        plan_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), BLUE_LT),
            ("BACKGROUND", (1, 0), (1, -1), WHITE),
            ("ROWBACKGROUNDS", (1, 0), (1, -1), [WHITE, GREY_BG]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ]))
        elements.append(plan_tbl)
    else:
        elements.append(Paragraph("No study plan was generated for this attempt.", S["body"]))
    elements.append(Spacer(1, 18))

    # ── TRAINER REMARKS ──────────────────────────────────────────────────────
    elements.append(Paragraph("Trainer Remarks", S["section_h"]))
    remarks_text = student_assessment.trainer_remarks or "No remarks yet."
    remarks_box = Table([[Paragraph(remarks_text, S["body"])]], colWidths=[W])
    remarks_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), AMBER_LT),
        ("BOX", (0, 0), (-1, -1), 1.5, AMBER),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(remarks_box)
    elements.append(Spacer(1, 20))

    # ── FOOTER ───────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width=W, thickness=1, color=colors.HexColor("#E2E8F0")))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        "Recruitment Institute  •  Confidential Student Report  •  Generated by AI",
        S["footer"],
    ))

    doc.build(elements)


def _build_bar_chart(strong: list[str], weak: list[str], avail_w: float) -> list:
    """Build a simple horizontal bar chart from topic lists."""
    S = _styles()
    rows = []
    all_topics = [(t, 100, GREEN, GREEN_LT) for t in strong] + \
                 [(t, 30, RED, RED_LT) for t in weak]
    if not all_topics:
        return [Paragraph("<i>No data</i>", S["body"])]
    for topic, pct_w, bar_c, bg_c in all_topics:
        bar_filled = avail_w * 0.62 * (pct_w / 100)
        bar_empty  = avail_w * 0.62 - bar_filled
        label_w    = avail_w * 0.38

        bar_tbl = Table([[
            Table([[""]], colWidths=[bar_filled], rowHeights=[8]),
            Table([[""]], colWidths=[max(bar_empty, 1)], rowHeights=[8]),
        ]], colWidths=[bar_filled, max(bar_empty, 1)])
        bar_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), bar_c),
            ("BACKGROUND", (1, 0), (1, 0), bg_c),
            ("BOX", (0, 0), (-1, -1), 0, WHITE),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))

        row_tbl = Table([[
            Paragraph(topic, ParagraphStyle("bt", fontName="Helvetica", fontSize=8,
                                            textColor=SLATE, leading=10, alignment=TA_RIGHT)),
            bar_tbl,
        ]], colWidths=[label_w, avail_w * 0.62])
        row_tbl.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        rows.append(row_tbl)
    return rows


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
        assessment = await self.repo.get_assessment(student_assessment.assessment_id)

        self.storage_root.mkdir(parents=True, exist_ok=True)
        filename = f"report-{student_assessment_id}-{uuid4().hex}.pdf"
        file_path = self.storage_root / filename

        _render_pdf(
            file_path,
            student_assessment,
            assessment.total_marks if assessment else 0,
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
