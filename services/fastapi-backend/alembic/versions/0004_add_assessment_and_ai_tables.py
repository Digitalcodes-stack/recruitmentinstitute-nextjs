"""add assessment and ai assessment tables

Revision ID: 0004_add_assessment_and_ai_tables
Revises: 0003_add_placement_tracking_notified_at
Create Date: 2026-06-24
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_add_assessment_and_ai_tables"
down_revision = "0003_add_placement_tracking_notified_at"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assessments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("assessment_name", sa.String(length=255), nullable=False),
        sa.Column("total_marks", sa.Integer(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_assessments_course_id", "assessments", ["course_id"], unique=False)

    op.create_table(
        "student_assessments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("percentage", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="in_progress"),
    )
    op.create_index("ix_student_assessments_student_id", "student_assessments", ["student_id"], unique=False)
    op.create_index("ix_student_assessments_assessment_id", "student_assessments", ["assessment_id"], unique=False)
    op.create_index("ix_student_assessments_status", "student_assessments", ["status"], unique=False)

    op.create_table(
        "ai_assessment_analysis",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("percentage", sa.Float(), nullable=False),
        sa.Column("strong_topics", sa.JSON(), nullable=False),
        sa.Column("weak_topics", sa.JSON(), nullable=False),
        sa.Column("analysis_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ai_assessment_analysis_student_id", "ai_assessment_analysis", ["student_id"], unique=False)
    op.create_index("ix_ai_assessment_analysis_assessment_id", "ai_assessment_analysis", ["assessment_id"], unique=False)

    op.create_table(
        "ai_generated_notes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topic_name", sa.String(length=255), nullable=False),
        sa.Column("notes_content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ai_generated_notes_student_id", "ai_generated_notes", ["student_id"], unique=False)
    op.create_index("ix_ai_generated_notes_assessment_id", "ai_generated_notes", ["assessment_id"], unique=False)

    op.create_table(
        "student_study_plans",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("plan_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_student_study_plans_student_id", "student_study_plans", ["student_id"], unique=False)
    op.create_index("ix_student_study_plans_assessment_id", "student_study_plans", ["assessment_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_student_study_plans_assessment_id", table_name="student_study_plans")
    op.drop_index("ix_student_study_plans_student_id", table_name="student_study_plans")
    op.drop_table("student_study_plans")

    op.drop_index("ix_ai_generated_notes_assessment_id", table_name="ai_generated_notes")
    op.drop_index("ix_ai_generated_notes_student_id", table_name="ai_generated_notes")
    op.drop_table("ai_generated_notes")

    op.drop_index("ix_ai_assessment_analysis_assessment_id", table_name="ai_assessment_analysis")
    op.drop_index("ix_ai_assessment_analysis_student_id", table_name="ai_assessment_analysis")
    op.drop_table("ai_assessment_analysis")

    op.drop_index("ix_student_assessments_status", table_name="student_assessments")
    op.drop_index("ix_student_assessments_assessment_id", table_name="student_assessments")
    op.drop_index("ix_student_assessments_student_id", table_name="student_assessments")
    op.drop_table("student_assessments")

    op.drop_index("ix_assessments_course_id", table_name="assessments")
    op.drop_table("assessments")
