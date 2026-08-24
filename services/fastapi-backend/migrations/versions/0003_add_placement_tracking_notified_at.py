"""add placement_tracking.notified_at

Revision ID: 0003_add_placement_tracking_notified_at
Revises: 0002_sprint0_repoint_and_drop_debt
Create Date: 2026-06-24
"""

from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("placement_tracking", sa.Column("notified_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("placement_tracking", "notified_at")
