from pydantic import BaseModel


class ContentSyncTriggerResponse(BaseModel):
    task_id: str


class ContentSyncStatusResponse(BaseModel):
    state: str
    result: dict | None = None


class ContentSyncStatsRead(BaseModel):
    courses: int
    lessons: int
    knowledge_items: int
    faqs: int
    chunks_written: int
    chunks_skipped: int
