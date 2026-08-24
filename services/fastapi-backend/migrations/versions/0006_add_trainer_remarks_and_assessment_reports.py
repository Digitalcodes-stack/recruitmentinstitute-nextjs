"""add trainer remarks column and assessment reports table

Revision ID: 0006_add_trainer_remarks_and_assessment_reports
Revises: 0005_add_course_content_embeddings
Create Date: 2026-06-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("student_assessments", sa.Column("trainer_remarks", sa.Text(), nullable=True))

    op.create_table(
        "assessment_reports",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "student_assessment_id",
            sa.Integer(),
            sa.ForeignKey("student_assessments.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("file_path", sa.String(length=1024), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("celery_task_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_assessment_reports_student_assessment_id", "assessment_reports", ["student_assessment_id"], unique=True)
    op.create_index("ix_assessment_reports_status", "assessment_reports", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_assessment_reports_status", table_name="assessment_reports")
    op.drop_index("ix_assessment_reports_student_assessment_id", table_name="assessment_reports")
    op.drop_table("assessment_reports")
    op.drop_column("student_assessments", "trainer_remarks")
