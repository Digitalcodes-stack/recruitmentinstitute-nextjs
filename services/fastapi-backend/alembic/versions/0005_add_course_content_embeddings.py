"""add course content embeddings table

Revision ID: 0005_add_course_content_embeddings
Revises: 0004_add_assessment_and_ai_tables
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_add_course_content_embeddings"
down_revision = "0004_add_assessment_and_ai_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "course_content_embeddings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=True),
        sa.Column("chunk_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("embedding", sa.JSON(), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.Column("embedding_model", sa.String(length=64), nullable=False, server_default="text-embedding-3-small"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("source_type", "source_id", "chunk_index", name="uq_content_embedding_source_chunk"),
    )
    op.create_index("ix_course_content_embeddings_source_type", "course_content_embeddings", ["source_type"], unique=False)
    op.create_index("ix_course_content_embeddings_source_id", "course_content_embeddings", ["source_id"], unique=False)
    op.create_index("ix_course_content_embeddings_course_id", "course_content_embeddings", ["course_id"], unique=False)
    op.create_index("ix_course_content_embeddings_content_hash", "course_content_embeddings", ["content_hash"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_course_content_embeddings_content_hash", table_name="course_content_embeddings")
    op.drop_index("ix_course_content_embeddings_course_id", table_name="course_content_embeddings")
    op.drop_index("ix_course_content_embeddings_source_id", table_name="course_content_embeddings")
    op.drop_index("ix_course_content_embeddings_source_type", table_name="course_content_embeddings")
    op.drop_table("course_content_embeddings")
