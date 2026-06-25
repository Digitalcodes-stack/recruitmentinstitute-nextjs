from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeRead(BaseModel):
    id: int
    student_id: int
    filename: str
    original_filename: str
    file_path: str
    mime_type: str
    file_size: int
    version: int
    is_active: bool
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

