from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TopicScoreInput(BaseModel):
    topic_name: str = Field(min_length=1)
    correct: int = Field(ge=0)
    total: int = Field(gt=0)


class AssessmentGenerateRequest(BaseModel):
    course_id: int
    name: str = "AI Generated Assessment"
    topics: list[str] = Field(default_factory=list)
    question_types: list[str] = Field(default=["mcq"])
    question_count: int = 10


class AssessmentSubmitRequest(BaseModel):
    assessment_id: int = Field(gt=0)
    topic_scores: list[TopicScoreInput] = Field(min_length=1)
    student_answers: list[dict] | None = None


class AIAssessmentAnalysisRead(BaseModel):
    id: int
    student_id: int
    assessment_id: int
    score: float
    percentage: float
    strong_topics: list[str]
    weak_topics: list[str]
    analysis_json: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AIGeneratedNoteRead(BaseModel):
    id: int
    student_id: int
    assessment_id: int
    topic_name: str
    notes_content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StudentStudyPlanRead(BaseModel):
    id: int
    student_id: int
    assessment_id: int
    plan_json: dict
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StudentAssessmentRead(BaseModel):
    id: int
    student_id: int
    assessment_id: int
    started_at: datetime
    completed_at: datetime | None = None
    score: float | None = None
    percentage: float | None = None
    status: str
    trainer_remarks: str | None = None
    model_config = ConfigDict(from_attributes=True)


class AssessmentSubmitResult(BaseModel):
    student_assessment_id: int
    analysis: AIAssessmentAnalysisRead
    notes: list[AIGeneratedNoteRead]
    study_plan: StudentStudyPlanRead
    recommendations: list[str]


class AssessmentResultRead(BaseModel):
    student_assessment: StudentAssessmentRead
    analysis: AIAssessmentAnalysisRead


from app.schemas.question_bank import QuestionBankItemRead

class TestReviewItemRead(QuestionBankItemRead):
    student_answer: str | None = None
