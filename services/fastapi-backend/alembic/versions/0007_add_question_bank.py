"""add question bank items table

Revision ID: 0007_add_question_bank
Revises: 0006_add_trainer_remarks_and_assessment_reports
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0007_add_question_bank"
down_revision = "0006_add_trainer_remarks_and_assessment_reports"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "question_bank_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("assessment_id", sa.Integer(), sa.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topic_name", sa.String(length=255), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("option_a", sa.String(length=500), nullable=False),
        sa.Column("option_b", sa.String(length=500), nullable=False),
        sa.Column("option_c", sa.String(length=500), nullable=False),
        sa.Column("option_d", sa.String(length=500), nullable=False),
        sa.Column("correct_option", sa.String(length=1), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_question_bank_items_assessment_id", "question_bank_items", ["assessment_id"], unique=False)
    op.create_index("ix_question_bank_items_topic_name", "question_bank_items", ["topic_name"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_question_bank_items_topic_name", table_name="question_bank_items")
    op.drop_index("ix_question_bank_items_assessment_id", table_name="question_bank_items")
    op.drop_table("question_bank_items")
