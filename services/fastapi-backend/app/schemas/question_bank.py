from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class QuestionBankItemCreate(BaseModel):
    topic_name: str = Field(min_length=1, max_length=255)
    question_text: str = Field(min_length=1)
    option_a: str = Field(min_length=1, max_length=500)
    option_b: str = Field(min_length=1, max_length=500)
    option_c: str = Field(min_length=1, max_length=500)
    option_d: str = Field(min_length=1, max_length=500)
    correct_option: str = Field(pattern=r"^[A-D]$")
    explanation: str | None = None
    difficulty: str = Field(default="medium", pattern=r"^(easy|medium|hard)$")
    bloom_level: str | None = None
    estimated_time_seconds: int | None = None
    source_chunk_id: int | None = None
    generated_by: str = "local_ai"
    sort_order: int = 0


class QuestionBankItemRead(BaseModel):
    id: int
    assessment_id: int
    topic_name: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str | None
    difficulty: str
    bloom_level: str | None = None
    estimated_time_seconds: int | None = None
    source_chunk_id: int | None = None
    generated_by: str = "local_ai"
    sort_order: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AssessmentQuestionRead(BaseModel):
    id: int
    assessment_id: int
    topic_name: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    difficulty: str = "medium"
    bloom_level: str | None = None
    estimated_time_seconds: int | None = None
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


class AssessmentAnswerInput(BaseModel):
    question_id: int
    selected_option: str = Field(pattern=r"^[A-D]$")


class AssessmentGradeRequest(BaseModel):
    assessment_id: int = Field(gt=0)
    answers: list[AssessmentAnswerInput] = Field(min_length=1)


class AssessmentSummaryRead(BaseModel):
    id: int
    course_id: int
    assessment_name: str
    total_marks: int
    duration_minutes: int
    model_config = ConfigDict(from_attributes=True)


class AssessmentCreate(BaseModel):
    course_id: int = Field(gt=0)
    assessment_name: str = Field(min_length=1, max_length=255)
    total_marks: int = Field(gt=0)
    duration_minutes: int = Field(gt=0)
