from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class TrainerCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    specialization: str | None = None
    phone: str | None = None
    bio: str | None = None
    is_active: bool = True


class TrainerRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    specialization: str | None = None
    phone: str | None = None
    bio: str | None = None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TrainerAssignmentRequest(BaseModel):
    student_id: int = Field(gt=0)
    trainer_id: int = Field(gt=0)


class TrainerAssignmentRead(BaseModel):
    id: int
    student_id: int
    trainer_id: int
    course_id: int | None = None
    batch_id: int | None = None
    assigned_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AssignedTrainerResponse(BaseModel):
    trainer: TrainerRead | None = None


class TrainerStudentsResponse(BaseModel):
    items: list[TrainerAssignmentRead]
