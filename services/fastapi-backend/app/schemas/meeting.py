from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class MeetingCreate(BaseModel):
    title: str = Field(min_length=2)
    description: str | None = None
    start_time: datetime
    end_time: datetime
    provider: str = Field(default="google_meet")
    external_meeting_id: str | None = None
    meeting_url: str | None = None
    course_id: int | None = Field(default=None, gt=0)
    trainer_id: int | None = Field(default=None, gt=0)
    batch_id: int | None = Field(default=None, gt=0)


class MeetingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    provider: str | None = None
    external_meeting_id: str | None = None
    meeting_url: str | None = None
    is_cancelled: bool | None = None


class MeetingRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    provider: str
    meeting_url: str | None = None
    is_cancelled: bool
    model_config = ConfigDict(from_attributes=True)
