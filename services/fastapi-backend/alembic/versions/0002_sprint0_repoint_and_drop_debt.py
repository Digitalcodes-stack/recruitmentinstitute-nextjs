"""sprint0 repoint and drop debt

Revision ID: 0002_sprint0_repoint_and_drop_debt
Revises: 0001_initial
Create Date: 2026-06-24
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_sprint0_repoint_and_drop_debt"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Step 1: drop FK constraints on kept tables that point into tables
    # being removed below. Verified live via information_schema.table_constraints
    # (see docs/sprint0-migration-sequence.md). meeting_attendees_meeting_id_fkey
    # is deliberately NOT dropped -- it is internal to kept tables.
    op.drop_constraint("meetings_course_id_fkey", "meetings", type_="foreignkey")
    op.drop_constraint("meetings_trainer_id_fkey", "meetings", type_="foreignkey")
    op.drop_constraint("meeting_attendees_user_id_fkey", "meeting_attendees", type_="foreignkey")
    op.drop_constraint("meeting_attendees_student_id_fkey", "meeting_attendees", type_="foreignkey")
    op.drop_constraint("meeting_attendees_trainer_id_fkey", "meeting_attendees", type_="foreignkey")
    op.drop_constraint("placement_tracking_student_id_fkey", "placement_tracking", type_="foreignkey")
    op.drop_constraint("student_resumes_student_id_fkey", "student_resumes", type_="foreignkey")

    # --- Step 2: drop debt tables, children before parents.
    op.drop_table("student_trainer_mapping")
    op.drop_table("refresh_tokens")
    op.drop_table("email_logs")
    op.drop_table("fastapi_notifications")
    op.drop_table("fastapi_enrollments")
    op.drop_table("fastapi_courses")
    op.drop_table("fastapi_trainers")
    op.drop_table("fastapi_audit_logs")
    op.drop_table("users")


def downgrade() -> None:
    # --- Step 1 (reverse): recreate dropped tables, parents before children.
    # Column definitions copied verbatim from 0001_initial.py.
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("student_id", sa.Integer(), nullable=True),
        sa.Column("trainer_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "fastapi_audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("actor_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("entity_type", sa.String(length=64), nullable=False),
        sa.Column("entity_id", sa.String(length=64), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_fastapi_audit_logs_actor_user_id", "fastapi_audit_logs", ["actor_user_id"], unique=False)
    op.create_index("ix_fastapi_audit_logs_action", "fastapi_audit_logs", ["action"], unique=False)
    op.create_index("ix_fastapi_audit_logs_entity_type", "fastapi_audit_logs", ["entity_type"], unique=False)

    op.create_table(
        "fastapi_trainers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("specialization", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_fastapi_trainers_email", "fastapi_trainers", ["email"], unique=True)

    op.create_table(
        "fastapi_courses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("thumbnail_url", sa.String(length=512), nullable=True),
        sa.Column("duration_weeks", sa.Integer(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_fastapi_courses_title", "fastapi_courses", ["title"], unique=False)

    op.create_table(
        "fastapi_enrollments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("fastapi_courses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("trainer_id", sa.Integer(), sa.ForeignKey("fastapi_trainers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_note", sa.Text(), nullable=True),
        sa.Column("decision_notified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("student_id", "course_id", name="uq_enrollment_student_course"),
    )
    op.create_index("ix_fastapi_enrollments_student_id", "fastapi_enrollments", ["student_id"], unique=False)
    op.create_index("ix_fastapi_enrollments_course_id", "fastapi_enrollments", ["course_id"], unique=False)
    op.create_index("ix_fastapi_enrollments_status", "fastapi_enrollments", ["status"], unique=False)

    op.create_table(
        "fastapi_notifications",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("recipient_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("recipient_role", sa.String(length=32), nullable=True),
        sa.Column("channel", sa.String(length=32), nullable=False, server_default="in_app"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="queued"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_fastapi_notifications_status", "fastapi_notifications", ["status"], unique=False)

    op.create_table(
        "email_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("notification_id", sa.Integer(), sa.ForeignKey("fastapi_notifications.id", ondelete="SET NULL"), nullable=True),
        sa.Column("to_email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("provider_message_id", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="queued"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_email_logs_to_email", "email_logs", ["to_email"], unique=False)
    op.create_index("ix_email_logs_status", "email_logs", ["status"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_jti", sa.String(length=64), nullable=False, unique=True),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False)
    op.create_index("ix_refresh_tokens_token_jti", "refresh_tokens", ["token_jti"], unique=True)
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"], unique=False)

    op.create_table(
        "student_trainer_mapping",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trainer_id", sa.Integer(), sa.ForeignKey("fastapi_trainers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("fastapi_courses.id", ondelete="SET NULL"), nullable=True),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_student_trainer_mapping_student_id", "student_trainer_mapping", ["student_id"], unique=False)
    op.create_index("ix_student_trainer_mapping_trainer_id", "student_trainer_mapping", ["trainer_id"], unique=False)

    # --- Step 2 (reverse): restore the 7 FK constraints dropped in upgrade().
    op.create_foreign_key(
        "meetings_course_id_fkey", "meetings", "fastapi_courses", ["course_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        "meetings_trainer_id_fkey", "meetings", "fastapi_trainers", ["trainer_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        "meeting_attendees_user_id_fkey", "meeting_attendees", "users", ["user_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        "meeting_attendees_student_id_fkey", "meeting_attendees", "users", ["student_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        "meeting_attendees_trainer_id_fkey", "meeting_attendees", "fastapi_trainers", ["trainer_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        "placement_tracking_student_id_fkey", "placement_tracking", "users", ["student_id"], ["id"], ondelete="CASCADE"
    )
    op.create_foreign_key(
        "student_resumes_student_id_fkey", "student_resumes", "users", ["student_id"], ["id"], ondelete="CASCADE"
    )
