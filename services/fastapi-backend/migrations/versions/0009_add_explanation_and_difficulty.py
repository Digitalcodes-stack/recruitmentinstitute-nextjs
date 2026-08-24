"""add explanation and difficulty to question_bank_items and assessment_questions

Revision ID: 0009_add_explanation_and_difficulty
Revises: 0008_add_assessment_questions_and_answers
Create Date: 2026-06-26
"""

from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("question_bank_items", sa.Column("explanation", sa.Text(), nullable=True))
    op.add_column("question_bank_items", sa.Column("difficulty", sa.String(length=16), nullable=False, server_default="medium"))

    op.add_column("assessment_questions", sa.Column("explanation", sa.Text(), nullable=True))
    op.add_column("assessment_questions", sa.Column("difficulty", sa.String(length=16), nullable=False, server_default="medium"))


def downgrade() -> None:
    op.drop_column("assessment_questions", "difficulty")
    op.drop_column("assessment_questions", "explanation")

    op.drop_column("question_bank_items", "difficulty")
    op.drop_column("question_bank_items", "explanation")
