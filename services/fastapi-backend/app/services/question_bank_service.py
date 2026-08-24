from dataclasses import dataclass, field

from app.core.exceptions import ServiceError
from app.models.assessment import Assessment
from app.models.question_bank import QuestionBankItem
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.schemas.assessment import AssessmentSubmitRequest, TopicScoreInput
from app.schemas.question_bank import AssessmentGradeRequest, QuestionBankItemCreate
from app.services.assessment_service import AssessmentService

_RUNTIME_QUESTION_COUNT = 40
_RUNTIME_MIN_QUESTIONS = 25
_RUNTIME_ASSESSMENT_NAME = "Runtime AI Assessment"


@dataclass
class QuestionBankService:
    repo: AssessmentRepository
    assessment_service: AssessmentService
    embedding_repo: EmbeddingRepository | None = field(default=None)

    async def add_question(self, assessment_id: int, payload: QuestionBankItemCreate) -> QuestionBankItem:
        assessment = await self.repo.get_assessment(assessment_id)
        if not assessment:
            raise ServiceError("Assessment not found", 404)
        row = await self.repo.add_question(
            QuestionBankItem(
                assessment_id=assessment_id,
                topic_name=payload.topic_name,
                question_text=payload.question_text,
                option_a=payload.option_a,
                option_b=payload.option_b,
                option_c=payload.option_c,
                option_d=payload.option_d,
                correct_option=payload.correct_option,
                explanation=payload.explanation,
                difficulty=payload.difficulty,
                bloom_level=payload.bloom_level,
                estimated_time_seconds=payload.estimated_time_seconds,
                source_chunk_id=payload.source_chunk_id,
                generated_by=payload.generated_by,
                sort_order=payload.sort_order,
            )
        )
        await self.repo.commit()
        await self.repo.db.refresh(row)
        return row

    async def list_questions(self, assessment_id: int) -> list[QuestionBankItem]:
        return await self.repo.list_questions_for_assessment(assessment_id)

    async def delete_question(self, question_id: int) -> None:
        await self.repo.delete_question(question_id)
        await self.repo.commit()

    async def create_assessment(self, course_id: int, assessment_name: str, total_marks: int, duration_minutes: int) -> Assessment:
        row = await self.repo.add_assessment(
            Assessment(course_id=course_id, assessment_name=assessment_name, total_marks=total_marks, duration_minutes=duration_minutes)
        )
        await self.repo.commit()
        await self.repo.db.refresh(row)
        return row

    async def get_assessment_for_course(self, course_id: int) -> Assessment:
        assessment = await self.repo.get_latest_assessment_for_course(course_id)
        if not assessment:
            raise ServiceError("No assessment has been set up for this course yet", 404)
        return assessment

    async def get_or_auto_generate_for_course(self, course_id: int) -> Assessment:
        existing = await self.repo.get_latest_assessment_for_course(course_id)
        if existing:
            questions = await self.repo.list_questions_for_assessment(existing.id)
            if len(questions) >= _RUNTIME_MIN_QUESTIONS:
                return existing

        context_text = await self._build_course_context(course_id)
        return await self.assessment_service.generate_assessment(
            course_id=course_id,
            name=_RUNTIME_ASSESSMENT_NAME,
            topics=[],
            types=["mcq"],
            count=_RUNTIME_QUESTION_COUNT,
            context_text=context_text,
        )

    async def _build_course_context(self, course_id: int) -> str:
        if self.embedding_repo is None:
            from app.repositories.embedding_repository import EmbeddingRepository
            self.embedding_repo = EmbeddingRepository(self.repo.db)

        rows = await self.embedding_repo.list_by_course(course_id)
        if rows:
            return "\n\n".join(row.chunk_text for row in rows)

        # No embeddings indexed yet — return a rich recruitment-domain fallback
        # so the generator still produces 40 meaningful questions.
        return (
            "Recruitment and selection process: sourcing candidates, screening resumes, "
            "conducting structured interviews, behavioural and competency-based questions, "
            "offer management, and onboarding.\n\n"
            "HR fundamentals: employment law, equal opportunity, diversity and inclusion, "
            "job analysis, job descriptions, person specifications, and salary benchmarking.\n\n"
            "Talent acquisition strategies: employer branding, social media recruiting, "
            "campus hiring, employee referrals, headhunting, and recruitment agencies.\n\n"
            "Assessment methods: psychometric tests, aptitude assessments, group discussions, "
            "case study interviews, technical assessments, and background verification.\n\n"
            "Interview techniques: STAR method (Situation, Task, Action, Result), panel interviews, "
            "telephone screening, video interviews, and structured scoring rubrics.\n\n"
            "Onboarding and retention: induction programmes, probation periods, performance appraisals, "
            "career development plans, and employee engagement strategies."
        )

    async def get_assessment_questions_for_student(self, assessment_id: int) -> list[QuestionBankItem]:
        assessment = await self.repo.get_assessment(assessment_id)
        if not assessment:
            raise ServiceError("Assessment not found", 404)
        questions = await self.repo.list_questions_for_assessment(assessment_id)
        if not questions:
            raise ServiceError("This assessment has no questions yet", 404)
        return questions

    async def grade_and_submit(self, student_id: int, payload: AssessmentGradeRequest):
        questions = await self.repo.list_questions_for_assessment(payload.assessment_id)
        if not questions:
            raise ServiceError("This assessment has no questions yet", 404)
        questions_by_id = {q.id: q for q in questions}

        totals: dict[str, dict[str, int]] = {}
        for answer in payload.answers:
            question = questions_by_id.get(answer.question_id)
            if not question:
                continue
            bucket = totals.setdefault(question.topic_name, {"correct": 0, "total": 0})
            bucket["total"] += 1
            if answer.selected_option == question.correct_option:
                bucket["correct"] += 1

        if not totals:
            raise ServiceError("No valid answers were submitted for this assessment", 400)

        topic_scores = [
            TopicScoreInput(topic_name=topic_name, correct=counts["correct"], total=counts["total"])
            for topic_name, counts in totals.items()
        ]

        submit_payload = AssessmentSubmitRequest(
            assessment_id=payload.assessment_id, 
            topic_scores=topic_scores,
            student_answers=[{"question_id": a.question_id, "selected_option": a.selected_option} for a in payload.answers]
        )
        return await self.assessment_service.submit(student_id, submit_payload)
