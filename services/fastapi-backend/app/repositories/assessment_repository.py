from collections import Counter

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc

from app.models.ai_assessment import AIAssessmentAnalysis, AIGeneratedNote, StudentStudyPlan
from app.models.assessment import Assessment, StudentAssessment, AssessmentQuestion, AssessmentAnswer
from app.models.question_bank import QuestionBankItem
from app.models.report import AssessmentReport


class AssessmentRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_assessment(self, assessment_id: int) -> Assessment | None:
        return await self.db.get(Assessment, assessment_id)

    async def add_assessment(self, row: Assessment) -> Assessment:
        self.db.add(row)
        await self.db.flush()
        return row

    async def get_latest_assessment_for_course(self, course_id: int) -> Assessment | None:
        res = await self.db.execute(
            select(Assessment).where(Assessment.course_id == course_id).order_by(desc(Assessment.created_at))
        )
        return res.scalars().first()

    async def add_question(self, row: QuestionBankItem) -> QuestionBankItem:
        self.db.add(row)
        await self.db.flush()
        return row

    async def add_assessment_question(self, row: AssessmentQuestion) -> AssessmentQuestion:
        self.db.add(row)
        await self.db.flush()
        return row

    async def list_questions_for_assessment(self, assessment_id: int) -> list[QuestionBankItem]:
        res = await self.db.execute(
            select(QuestionBankItem)
            .where(QuestionBankItem.assessment_id == assessment_id)
            .order_by(QuestionBankItem.sort_order, QuestionBankItem.id)
        )
        return list(res.scalars().all())

    async def list_assessment_questions(self, assessment_id: int) -> list[AssessmentQuestion]:
        res = await self.db.execute(
            select(AssessmentQuestion)
            .where(AssessmentQuestion.assessment_id == assessment_id)
            .order_by(AssessmentQuestion.id)
        )
        return list(res.scalars().all())

    async def get_question(self, question_id: int) -> QuestionBankItem | None:
        return await self.db.get(QuestionBankItem, question_id)

    async def delete_question(self, question_id: int) -> None:
        question = await self.get_question(question_id)
        if question:
            await self.db.delete(question)
            await self.db.flush()

    async def add_student_assessment(self, row: StudentAssessment) -> StudentAssessment:
        self.db.add(row)
        await self.db.flush()
        return row

    async def get_student_assessment(self, student_assessment_id: int) -> StudentAssessment | None:
        return await self.db.get(StudentAssessment, student_assessment_id)

    async def list_student_assessments(self, student_id: int) -> list[StudentAssessment]:
        res = await self.db.execute(
            select(StudentAssessment)
            .where(StudentAssessment.student_id == student_id)
            .order_by(desc(StudentAssessment.started_at))
        )
        return list(res.scalars().all())

    async def add_analysis(self, row: AIAssessmentAnalysis) -> AIAssessmentAnalysis:
        self.db.add(row)
        await self.db.flush()
        return row

    async def add_notes(self, rows: list[AIGeneratedNote]) -> list[AIGeneratedNote]:
        self.db.add_all(rows)
        await self.db.flush()
        return rows

    async def add_study_plan(self, row: StudentStudyPlan) -> StudentStudyPlan:
        self.db.add(row)
        await self.db.flush()
        return row

    async def commit(self) -> None:
        await self.db.commit()

    async def get_analysis_by_student_assessment(self, student_assessment_id: int) -> AIAssessmentAnalysis | None:
        res = await self.db.execute(
            select(AIAssessmentAnalysis).where(AIAssessmentAnalysis.assessment_id == student_assessment_id)
        )
        return res.scalars().first()

    async def get_notes_by_student_assessment(self, student_assessment_id: int) -> list[AIGeneratedNote]:
        res = await self.db.execute(
            select(AIGeneratedNote).where(AIGeneratedNote.assessment_id == student_assessment_id)
        )
        return list(res.scalars().all())

    async def get_study_plan_by_student_assessment(self, student_assessment_id: int) -> StudentStudyPlan | None:
        res = await self.db.execute(
            select(StudentStudyPlan).where(StudentStudyPlan.assessment_id == student_assessment_id)
        )
        return res.scalars().first()

    async def set_trainer_remarks(self, student_assessment_id: int, remarks: str) -> StudentAssessment:
        student_assessment = await self.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ValueError(f"StudentAssessment {student_assessment_id} not found")
        student_assessment.trainer_remarks = remarks
        await self.db.flush()
        return student_assessment

    async def get_report(self, student_assessment_id: int) -> AssessmentReport | None:
        res = await self.db.execute(
            select(AssessmentReport).where(AssessmentReport.student_assessment_id == student_assessment_id)
        )
        return res.scalars().first()

    async def upsert_report(self, row: AssessmentReport) -> AssessmentReport:
        self.db.add(row)
        await self.db.flush()
        return row

    async def batch_performance(self, student_ids: list[int]) -> dict:
        if not student_ids:
            return {"avg_score": None, "avg_percentage": None, "count": 0}
        query = (
            select(
                func.avg(StudentAssessment.score).label("avg_score"),
                func.avg(StudentAssessment.percentage).label("avg_percentage"),
                func.count(StudentAssessment.id).label("count"),
            )
            .where(StudentAssessment.student_id.in_(student_ids), StudentAssessment.status == "completed")
        )
        row = (await self.db.execute(query)).mappings().first()
        return dict(row) if row else {"avg_score": None, "avg_percentage": None, "count": 0}

    async def weak_topic_trends(self, student_ids: list[int]) -> list[dict]:
        if not student_ids:
            return []
        query = select(AIAssessmentAnalysis.weak_topics).where(AIAssessmentAnalysis.student_id.in_(student_ids))
        rows = (await self.db.execute(query)).scalars().all()
        counter = Counter(topic for weak_topics in rows for topic in weak_topics)
        return [{"topic_name": topic, "occurrence_count": count} for topic, count in counter.most_common()]

    async def course_effectiveness(self, student_ids: list[int], course_id: int) -> dict:
        if not student_ids:
            return {"course_id": course_id, "avg_score": None, "avg_percentage": None, "sample_size": 0}
        query = (
            select(
                func.avg(StudentAssessment.score).label("avg_score"),
                func.avg(StudentAssessment.percentage).label("avg_percentage"),
                func.count(StudentAssessment.id).label("sample_size"),
            )
            .join(Assessment, Assessment.id == StudentAssessment.assessment_id)
            .where(
                StudentAssessment.student_id.in_(student_ids),
                Assessment.course_id == course_id,
                StudentAssessment.status == "completed",
            )
        )
        row = (await self.db.execute(query)).mappings().first()
        result = dict(row) if row else {"avg_score": None, "avg_percentage": None, "sample_size": 0}
        return {"course_id": course_id, **result}

    async def student_ranking(self, student_ids: list[int]) -> list[dict]:
        if not student_ids:
            return []
        query = (
            select(
                StudentAssessment.student_id,
                func.avg(StudentAssessment.percentage).label("avg_pct"),
            )
            .where(StudentAssessment.student_id.in_(student_ids), StudentAssessment.status == "completed")
            .group_by(StudentAssessment.student_id)
            .order_by(func.avg(StudentAssessment.percentage).desc())
        )
        rows = (await self.db.execute(query)).mappings().all()
        return [dict(row) for row in rows]
