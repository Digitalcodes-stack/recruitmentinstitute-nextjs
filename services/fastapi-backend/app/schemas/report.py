from pydantic import BaseModel, ConfigDict, Field


class ReportTriggerResponse(BaseModel):
    student_assessment_id: int
    task_id: str | None = None
    status: str


class ReportStatusRead(BaseModel):
    student_assessment_id: int
    status: str
    error_message: str | None = None
    model_config = ConfigDict(from_attributes=True)


class TrainerRemarksUpdate(BaseModel):
    remarks: str = Field(min_length=1, max_length=5000)
