from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class CourseBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    thumbnail_url: str | None = None
    duration_weeks: int | None = Field(default=None, ge=1)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool = True


class CourseCreate(CourseBase):
    model_config = ConfigDict(extra="forbid")


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    thumbnail_url: str | None = None
    duration_weeks: int | None = Field(default=None, ge=1)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None


class CourseRead(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
