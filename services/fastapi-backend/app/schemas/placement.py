from pydantic import BaseModel, Field


class PlacementTrackingCreate(BaseModel):
    student_id: int = Field(gt=0)
    job_title: str = Field(min_length=2)
    company_name: str = Field(min_length=2)


class NotificationCreate(BaseModel):
    title: str = Field(min_length=2)
    body: str = Field(min_length=2)

