"""add bloom_level, estimated_time_seconds, source_chunk_id, generated_by to question tables

Revision ID: 0010_add_question_metadata_fields
Revises: 0009_add_explanation_and_difficulty
Create Date: 2026-06-26
"""

from alembic import op
import sqlalchemy as sa

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("question_bank_items", sa.Column("bloom_level", sa.String(length=32), nullable=True))
    op.add_column("question_bank_items", sa.Column("estimated_time_seconds", sa.Integer(), nullable=True))
    op.add_column(
        "question_bank_items",
        sa.Column("source_chunk_id", sa.Integer(), sa.ForeignKey("course_content_embeddings.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column("question_bank_items", sa.Column("generated_by", sa.String(length=32), nullable=False, server_default="local_ai"))

    op.add_column("assessment_questions", sa.Column("bloom_level", sa.String(length=32), nullable=True))
    op.add_column("assessment_questions", sa.Column("estimated_time_seconds", sa.Integer(), nullable=True))
    op.add_column(
        "assessment_questions",
        sa.Column("source_chunk_id", sa.Integer(), sa.ForeignKey("course_content_embeddings.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column("assessment_questions", sa.Column("generated_by", sa.String(length=32), nullable=False, server_default="local_ai"))


def downgrade() -> None:
    op.drop_column("assessment_questions", "generated_by")
    op.drop_column("assessment_questions", "source_chunk_id")
    op.drop_column("assessment_questions", "estimated_time_seconds")
    op.drop_column("assessment_questions", "bloom_level")

    op.drop_column("question_bank_items", "generated_by")
    op.drop_column("question_bank_items", "source_chunk_id")
    op.drop_column("question_bank_items", "estimated_time_seconds")
    op.drop_column("question_bank_items", "bloom_level")
