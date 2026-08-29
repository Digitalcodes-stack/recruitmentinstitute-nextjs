"""add conversations table

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "executive_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("virtual_executives.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("caller_name", sa.String(180), nullable=False),
        sa.Column("caller_phone", sa.String(32), nullable=True),
        sa.Column("caller_email", sa.String(255), nullable=True),
        sa.Column("transcript", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("extracted_data", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_conversations_executive_id", "conversations", ["executive_id"])


def downgrade() -> None:
    op.drop_table("conversations")
