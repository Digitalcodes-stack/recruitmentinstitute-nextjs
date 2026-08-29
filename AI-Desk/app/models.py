"""
SQLAlchemy 2.0 ORM models for AI Desk.

Design notes:
- JSONB columns hold semi-structured profile content (FAQs, slots, scopes)
  rather than exploding into a dozen child tables — this data is always
  read/written as a whole with its parent, never queried by sub-field, so
  normalizing it would add joins for zero benefit.
- UUID primary keys (portable, no leaking sequential IDs).
- All timestamps are timezone-aware UTC.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


# --------------------------------------------------------------------------
# User (owner / operator of the AI Desk account)
# --------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = _uuid_pk()
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    executives: Mapped[list["VirtualExecutive"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


# --------------------------------------------------------------------------
# Virtual Executive Profile
# --------------------------------------------------------------------------
class VirtualExecutive(Base):
    """A configurable AI persona (recruiter, receptionist, sales agent, ...)."""

    __tablename__ = "virtual_executives"

    id: Mapped[uuid.UUID] = _uuid_pk()
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # --- Identity ---
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(120), nullable=False)
    company: Mapped[str] = mapped_column(String(180), nullable=False)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # --- Behaviour ---
    introduction: Mapped[str] = mapped_column(Text, nullable=False, default="")
    goals: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    scopes: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)  # what it CAN do
    donts: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)  # hard constraints
    languages: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)  # e.g. ["Hindi", "English", "Hinglish"]
    speech_style: Mapped[str] = mapped_column(
        Text, nullable=False, default="Warm, concise, professional. Short spoken sentences."
    )

    # --- Content ---
    products_services: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)  # or open roles
    faqs: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)  # [{question, answer}]
    action_slots: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)  # bookable interview/action slots

    # --- Business hours: {"mon": {"start": "09:00", "end": "18:00"}, ...} ---
    business_hours: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Kolkata")

    # --- Structured data extraction schema for post-conversation summary ---
    # e.g. [{"field": "candidate_interested", "type": "boolean"}, ...]
    extraction_schema: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner: Mapped["User"] = relationship(back_populates="executives")
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="executive", cascade="all, delete-orphan")


# --------------------------------------------------------------------------
# Conversation (one browser voice-chat session with an executive)
# --------------------------------------------------------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = _uuid_pk()
    executive_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("virtual_executives.id", ondelete="CASCADE"), nullable=False)

    caller_name: Mapped[str] = mapped_column(String(180), nullable=False)
    caller_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    caller_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    transcript: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)  # [{role, text}]
    extracted_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)  # per executive.extraction_schema

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    executive: Mapped["VirtualExecutive"] = relationship(back_populates="conversations")
