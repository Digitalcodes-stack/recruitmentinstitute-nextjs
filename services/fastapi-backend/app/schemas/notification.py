from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    id: int
    recipient_user_id: int | None = None
    recipient_role: str | None = None
    channel: str
    title: str
    body: str
    payload_json: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

