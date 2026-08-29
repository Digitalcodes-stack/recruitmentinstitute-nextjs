"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-28
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "virtual_executives",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("role", sa.String(120), nullable=False),
        sa.Column("company", sa.String(180), nullable=False),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("introduction", sa.Text, nullable=False, server_default=""),
        sa.Column("goals", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("scopes", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("donts", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("languages", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("speech_style", sa.Text, nullable=False, server_default=""),
        sa.Column("products_services", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("faqs", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("action_slots", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("business_hours", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("timezone", sa.String(64), nullable=False, server_default="Asia/Kolkata"),
        sa.Column("extraction_schema", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("is_active", sa.Boolean, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("virtual_executives")
    op.drop_table("users")
