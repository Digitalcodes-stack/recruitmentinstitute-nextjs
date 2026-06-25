from pydantic import BaseModel


class BatchPerformanceRead(BaseModel):
    batch_id: int
    batch_name: str
    avg_score: float | None
    avg_percentage: float | None
    count: int


class WeakTopicTrendRead(BaseModel):
    topic_name: str
    occurrence_count: int


class CourseEffectivenessRead(BaseModel):
    course_id: int
    avg_score: float | None
    avg_percentage: float | None
    sample_size: int


class StudentRankingRead(BaseModel):
    student_id: int
    student_name: str | None
    avg_percentage: float | None


class TrainerRecommendationsRead(BaseModel):
    recommendations: list[str]
