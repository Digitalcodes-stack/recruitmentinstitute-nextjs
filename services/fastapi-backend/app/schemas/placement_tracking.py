from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PlacementTrackingRead(BaseModel):
    id: int
    student_id: int
    job_title: str
    company_name: str
    stage: str
    applied_at: datetime
    interview_at: datetime | None = None
    notes: str | None = None
    notified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

