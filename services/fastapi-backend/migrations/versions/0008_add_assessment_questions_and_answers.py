"""add assessment_questions and assessment_answers tables

Revision ID: 0008_add_assessment_questions_and_answers
Revises: 0007_add_question_bank
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assessment_questions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_type", sa.String(length=32), nullable=False),
        sa.Column("topic", sa.String(length=128), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("options", sa.JSON(), nullable=True),
        sa.Column("correct_answer", sa.Text(), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False, server_default="1"),
    )
    op.create_index("ix_assessment_questions_assessment_id", "assessment_questions", ["assessment_id"], unique=False)

    op.create_table(
        "assessment_answers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_assessment_id", sa.Integer(), sa.ForeignKey("student_assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("student_answer", sa.Text(), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("points_awarded", sa.Float(), nullable=False, server_default="0"),
        sa.Column("ai_feedback", sa.Text(), nullable=True),
    )
    op.create_index("ix_assessment_answers_student_assessment_id", "assessment_answers", ["student_assessment_id"], unique=False)
    op.create_index("ix_assessment_answers_question_id", "assessment_answers", ["question_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_assessment_answers_question_id", table_name="assessment_answers")
    op.drop_index("ix_assessment_answers_student_assessment_id", table_name="assessment_answers")
    op.drop_table("assessment_answers")

    op.drop_index("ix_assessment_questions_assessment_id", table_name="assessment_questions")
    op.drop_table("assessment_questions")
