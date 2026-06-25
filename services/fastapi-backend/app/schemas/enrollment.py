from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EnrollmentCreate(BaseModel):
    student_id: int = Field(gt=0)
    course_id: int = Field(gt=0)
    batch_id: int | None = Field(default=None, gt=0)


class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    batch_id: int | None
    status: str
    requested_at: datetime
    reviewed_at: datetime | None = None
    review_note: str | None = None
    model_config = ConfigDict(from_attributes=True)
