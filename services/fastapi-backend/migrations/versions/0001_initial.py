"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-23
"""

from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
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

    op.create_table(
        "meetings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("course_id", sa.Integer(), sa.ForeignKey("fastapi_courses.id", ondelete="SET NULL"), nullable=True),
        sa.Column("batch_id", sa.Integer(), nullable=True),
        sa.Column("trainer_id", sa.Integer(), sa.ForeignKey("fastapi_trainers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("provider", sa.String(length=32), nullable=False, server_default="google_meet"),
        sa.Column("external_meeting_id", sa.String(length=255), nullable=True),
        sa.Column("meeting_url", sa.String(length=1024), nullable=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_cancelled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_24h_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_1h_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_meetings_start_time", "meetings", ["start_time"], unique=False)
    op.create_index("ix_meetings_provider", "meetings", ["provider"], unique=False)

    op.create_table(
        "meeting_attendees",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("meeting_id", sa.Integer(), sa.ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("trainer_id", sa.Integer(), sa.ForeignKey("fastapi_trainers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_meeting_attendees_email", "meeting_attendees", ["email"], unique=False)
    op.create_index("ix_meeting_attendees_meeting_id", "meeting_attendees", ["meeting_id"], unique=False)

    op.create_table(
        "student_resumes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("file_path", sa.String(length=1024), nullable=False),
        sa.Column("mime_type", sa.String(length=128), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("notified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_student_resumes_student_id", "student_resumes", ["student_id"], unique=False)

    op.create_table(
        "placement_tracking",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_title", sa.String(length=255), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("stage", sa.String(length=32), nullable=False, server_default="applied"),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("interview_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_placement_tracking_student_id", "placement_tracking", ["student_id"], unique=False)
    op.create_index("ix_placement_tracking_stage", "placement_tracking", ["stage"], unique=False)

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


def downgrade() -> None:
    op.drop_index("ix_fastapi_audit_logs_entity_type", table_name="fastapi_audit_logs")
    op.drop_index("ix_fastapi_audit_logs_action", table_name="fastapi_audit_logs")
    op.drop_index("ix_fastapi_audit_logs_actor_user_id", table_name="fastapi_audit_logs")
    op.drop_table("fastapi_audit_logs")
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_token_jti", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index("ix_email_logs_status", table_name="email_logs")
    op.drop_index("ix_email_logs_to_email", table_name="email_logs")
    op.drop_table("email_logs")
    op.drop_index("ix_fastapi_notifications_status", table_name="fastapi_notifications")
    op.drop_table("fastapi_notifications")
    op.drop_index("ix_placement_tracking_stage", table_name="placement_tracking")
    op.drop_index("ix_placement_tracking_student_id", table_name="placement_tracking")
    op.drop_table("placement_tracking")
    op.drop_index("ix_student_resumes_student_id", table_name="student_resumes")
    op.drop_table("student_resumes")
    op.drop_index("ix_meeting_attendees_meeting_id", table_name="meeting_attendees")
    op.drop_index("ix_meeting_attendees_email", table_name="meeting_attendees")
    op.drop_table("meeting_attendees")
    op.drop_index("ix_meetings_provider", table_name="meetings")
    op.drop_index("ix_meetings_start_time", table_name="meetings")
    op.drop_table("meetings")
    op.drop_index("ix_student_trainer_mapping_trainer_id", table_name="student_trainer_mapping")
    op.drop_index("ix_student_trainer_mapping_student_id", table_name="student_trainer_mapping")
    op.drop_table("student_trainer_mapping")
    op.drop_index("ix_fastapi_enrollments_status", table_name="fastapi_enrollments")
    op.drop_index("ix_fastapi_enrollments_course_id", table_name="fastapi_enrollments")
    op.drop_index("ix_fastapi_enrollments_student_id", table_name="fastapi_enrollments")
    op.drop_table("fastapi_enrollments")
    op.drop_index("ix_fastapi_trainers_email", table_name="fastapi_trainers")
    op.drop_table("fastapi_trainers")
    op.drop_index("ix_fastapi_courses_title", table_name="fastapi_courses")
    op.drop_table("fastapi_courses")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
