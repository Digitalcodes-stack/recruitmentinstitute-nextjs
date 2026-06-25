import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFService:
    @staticmethod
    def generate_assessment_report(student_name: str, score: float, percentage: float, strong_topics: list[str], weak_topics: list[str], study_plan: dict, notes: str, trainer_remarks: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = styles['Heading1']
        title_style.alignment = 1 # Center
        elements.append(Paragraph("AI-Powered Student Assessment Report", title_style))
        elements.append(Spacer(1, 12))

        # Student Details
        elements.append(Paragraph(f"<b>Student Name:</b> {student_name}", styles['Normal']))
        elements.append(Paragraph(f"<b>Score:</b> {score} ({percentage:.1f}%)", styles['Normal']))
        if trainer_remarks:
            elements.append(Paragraph(f"<b>Trainer Remarks:</b> {trainer_remarks}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Performance Summary
        elements.append(Paragraph("<b>Strong Topics:</b> " + ", ".join(strong_topics), styles['Normal']))
        elements.append(Paragraph("<b>Weak Topics:</b> " + ", ".join(weak_topics), styles['Normal']))
        elements.append(Spacer(1, 24))

        # Study Plan
        elements.append(Paragraph("<b>Personalized Study Plan</b>", styles['Heading2']))
        for day, task in study_plan.items():
            elements.append(Paragraph(f"<b>{day.replace('_', ' ').title()}:</b> {task}", styles['Normal']))
        elements.append(Spacer(1, 24))

        # Notes
        elements.append(Paragraph("<b>AI Generated Notes</b>", styles['Heading2']))
        elements.append(Paragraph(notes.replace('\n', '<br/>'), styles['Normal']))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
