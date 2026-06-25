from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai_health,
    assessment,
    auth,
    content_sync,
    meetings,
    placements,
    resumes,
    students,
    trainer_analytics,
)

v1_router = APIRouter()
v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
v1_router.include_router(students.router, prefix="/students", tags=["students"])
v1_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
v1_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
v1_router.include_router(placements.router, prefix="/placements", tags=["placements"])
v1_router.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
v1_router.include_router(ai_health.router, prefix="/ai", tags=["ai"])
v1_router.include_router(content_sync.router, prefix="/content", tags=["content"])
v1_router.include_router(trainer_analytics.router, prefix="/trainer-analytics", tags=["trainer-analytics"])
