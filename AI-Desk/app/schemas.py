"""
Pydantic v2 schemas for request/response bodies. Kept 1:1 with models.py
where possible — no separate "domain layer" for a project this size.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Virtual Executive
# ---------------------------------------------------------------------------
class FAQItem(BaseModel):
    question: str
    answer: str


class ActionSlot(BaseModel):
    label: str  # e.g. "Tue 2 PM - 2:30 PM"
    date: str  # ISO date
    start_time: str  # "14:00"
    end_time: str  # "14:30"
    is_booked: bool = False


class ExtractionField(BaseModel):
    field: str
    type: str = "string"  # string | boolean | number | enum
    description: str = ""


class DayHours(BaseModel):
    start: str = "09:00"
    end: str = "18:00"
    closed: bool = False


class ExecutiveBase(BaseModel):
    name: str
    role: str
    company: str
    address: str | None = None
    avatar_url: str | None = None
    introduction: str = ""
    goals: list[str] = Field(default_factory=list)
    scopes: list[str] = Field(default_factory=list)
    donts: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=lambda: ["English", "Hindi", "Marathi", "Hinglish"])
    speech_style: str = "Warm, concise, professional. Short spoken sentences."
    products_services: list[dict] = Field(default_factory=list)
    faqs: list[FAQItem] = Field(default_factory=list)
    action_slots: list[ActionSlot] = Field(default_factory=list)
    business_hours: dict[str, DayHours] = Field(default_factory=dict)
    timezone: str = "Asia/Kolkata"
    extraction_schema: list[ExtractionField] = Field(default_factory=list)


class ExecutiveCreate(ExecutiveBase):
    pass


class ExecutiveUpdate(BaseModel):
    """All optional — PATCH semantics."""
    name: str | None = None
    role: str | None = None
    company: str | None = None
    address: str | None = None
    avatar_url: str | None = None
    introduction: str | None = None
    goals: list[str] | None = None
    scopes: list[str] | None = None
    donts: list[str] | None = None
    languages: list[str] | None = None
    speech_style: str | None = None
    products_services: list[dict] | None = None
    faqs: list[FAQItem] | None = None
    action_slots: list[ActionSlot] | None = None
    business_hours: dict[str, DayHours] | None = None
    timezone: str | None = None
    extraction_schema: list[ExtractionField] | None = None
    is_active: bool | None = None


class ExecutiveOut(ExecutiveBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    owner_id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------
class ConversationSummary(BaseModel):
    """Lightweight row for the conversation history list."""
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    executive_id: uuid.UUID
    caller_name: str
    caller_phone: str | None
    caller_email: str | None
    started_at: datetime
    ended_at: datetime | None


class ConversationOut(ConversationSummary):
    transcript: list[dict]
    extracted_data: dict


class SendEmailRequest(BaseModel):
    to_email: str


class JDTextOut(BaseModel):
    text: str
