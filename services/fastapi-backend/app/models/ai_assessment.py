from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AIAssessmentAnalysis(Base):
    __tablename__ = "ai_assessment_analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    strong_topics: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    weak_topics: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    analysis_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AIGeneratedNote(Base):
    __tablename__ = "ai_generated_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    notes_content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class StudentStudyPlan(Base):
    __tablename__ = "student_study_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
