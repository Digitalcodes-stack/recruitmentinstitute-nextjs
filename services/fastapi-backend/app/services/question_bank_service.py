from dataclasses import dataclass

from app.core.exceptions import ServiceError
from app.models.assessment import Assessment
from app.models.question_bank import QuestionBankItem
from app.repositories.assessment_repository import AssessmentRepository
from app.schemas.assessment import AssessmentSubmitRequest, TopicScoreInput
from app.schemas.question_bank import AssessmentGradeRequest, QuestionBankItemCreate
from app.services.assessment_service import AssessmentService


@dataclass
class QuestionBankService:
    repo: AssessmentRepository
    assessment_service: AssessmentService

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

        submit_payload = AssessmentSubmitRequest(assessment_id=payload.assessment_id, topic_scores=topic_scores)
        return await self.assessment_service.submit(student_id, submit_payload)
