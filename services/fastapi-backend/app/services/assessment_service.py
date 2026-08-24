import logging
from dataclasses import dataclass

from app.core.cache import create_redis_client
from app.core.exceptions import ServiceError
from app.models.ai_assessment import AIAssessmentAnalysis, AIGeneratedNote, StudentStudyPlan
from app.models.assessment import StudentAssessment, Assessment, AssessmentQuestion
from app.models.question_bank import QuestionBankItem
from app.repositories.assessment_repository import AssessmentRepository
from app.schemas.assessment import AssessmentSubmitRequest
from app.services.ai.ai_service import get_reliable_ai_provider
from app.services.ai.base import TopicScore
from app.services.ai.retrieval_service import RetrievalService
from app.services.ai.rag import RAGService

NOTES_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7


@dataclass
class AssessmentService:
    repo: AssessmentRepository
    retrieval: RetrievalService | None = None
    rag: RAGService | None = None
    logger = logging.getLogger(__name__)

    async def generate_assessment(
        self,
        course_id: int,
        name: str,
        topics: list[str],
        types: list[str],
        count: int,
        context_text: str | None = None,
    ) -> Assessment:
        provider = get_reliable_ai_provider()

        if context_text is None:
            if not self.rag:
                from app.repositories.embedding_repository import EmbeddingRepository
                self.rag = RAGService(EmbeddingRepository(self.repo.db))

            seen_chunks: set[str] = set()
            context_parts: list[str] = []
            for topic in topics:
                chunk = await self.rag.retrieve_context(course_id, topic, k=3)
                if chunk and chunk not in seen_chunks:
                    seen_chunks.add(chunk)
                    context_parts.append(chunk)

            context_text = "\n\n".join(context_parts)
            if not context_text.strip():
                context_text = "General recruitment principles and basic HR knowledge."

        questions_data = await provider.generate_questions(context_text, types, count)

        # Drop duplicates and anything that can't be stored as a 4-option
        # question before counting, so total_marks/duration reflect what's
        # actually persisted rather than the raw generator output.
        deduped: list[dict] = []
        seen_question_texts: set[str] = set()
        for q_data in questions_data:
            question_text = q_data["question_text"]
            if question_text in seen_question_texts:
                continue
            options = q_data.get("options") or []
            if len(options) != 4:
                # QuestionBankItem (the table the student quiz actually reads
                # from) requires exactly 4 non-null options, so true_false/
                # descriptive/option-less questions can't be stored there yet.
                continue
            seen_question_texts.add(question_text)
            deduped.append(q_data)

        assessment = await self.repo.add_assessment(
            Assessment(
                course_id=course_id,
                assessment_name=name,
                total_marks=len(deduped),
                duration_minutes=max(len(deduped) * 2, 1)
            )
        )

        for sort_order, q_data in enumerate(deduped):
            question_text = q_data["question_text"]
            options = q_data["options"]

            await self.repo.add_assessment_question(
                AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_type=q_data["question_type"],
                    topic=q_data["topic"],
                    question_text=question_text,
                    options=options,
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data.get("explanation"),
                    difficulty=q_data.get("difficulty", "medium"),
                    bloom_level=q_data.get("bloom_level"),
                    estimated_time_seconds=q_data.get("estimated_time_seconds"),
                    generated_by="local_ai",
                    points=1
                )
            )

            correct_answer = q_data["correct_answer"]
            letters = ["A", "B", "C", "D"]
            try:
                correct_option = letters[options.index(correct_answer)]
            except (ValueError, IndexError):
                correct_option = "A"

            await self.repo.add_question(
                QuestionBankItem(
                    assessment_id=assessment.id,
                    topic_name=q_data["topic"],
                    question_text=question_text,
                    option_a=options[0],
                    option_b=options[1],
                    option_c=options[2],
                    option_d=options[3],
                    correct_option=correct_option,
                    explanation=q_data.get("explanation"),
                    difficulty=q_data.get("difficulty", "medium"),
                    bloom_level=q_data.get("bloom_level"),
                    estimated_time_seconds=q_data.get("estimated_time_seconds"),
                    generated_by="local_ai",
                    sort_order=sort_order,
                )
            )
        await self.repo.commit()
        await self.repo.db.refresh(assessment)
        return assessment

    async def submit(self, student_id: int, payload: AssessmentSubmitRequest):
        assessment = await self.repo.get_assessment(payload.assessment_id)
        if not assessment:
            raise ServiceError("Assessment not found", 404)

        total_correct = sum(t.correct for t in payload.topic_scores)
        total_questions = sum(t.total for t in payload.topic_scores)
        percentage = (total_correct / total_questions * 100) if total_questions else 0.0
        score = (total_correct / total_questions) * assessment.total_marks if total_questions else 0.0

        student_assessment = await self.repo.add_student_assessment(
            StudentAssessment(
                student_id=student_id,
                assessment_id=payload.assessment_id,
                score=score,
                percentage=percentage,
                status="completed",
            )
        )

        topic_scores = [
            TopicScore(
                topic_name=t.topic_name,
                correct=t.correct,
                total=t.total,
                percentage=(t.correct / t.total * 100) if t.total else 0.0,
            )
            for t in payload.topic_scores
        ]

        provider = get_reliable_ai_provider()
        analysis_result = await provider.analyze_performance(score, percentage, topic_scores)

        analysis = await self.repo.add_analysis(
            AIAssessmentAnalysis(
                student_id=student_id,
                assessment_id=student_assessment.id,
                score=score,
                percentage=percentage,
                strong_topics=analysis_result.strong_topics,
                weak_topics=analysis_result.weak_topics,
                analysis_json={
                    "difficulty_breakdown": analysis_result.difficulty_breakdown,
                    "summary": analysis_result.summary,
                    "student_answers": payload.student_answers or []
                },
            )
        )

        import asyncio
        notes_tasks = [
            self._generate_notes_cached(provider, topic_name, assessment.course_id)
            for topic_name in analysis_result.weak_topics
        ]

        # Run time-consuming AI generation tasks concurrently
        notes_contents, plan_json, recommendations = await asyncio.gather(
            asyncio.gather(*notes_tasks),
            provider.generate_study_plan(
                analysis_result.weak_topics, analysis_result.strong_topics, analysis_result.difficulty_breakdown
            ),
            provider.generate_recommendations(percentage)
        )

        note_rows = [
            AIGeneratedNote(
                student_id=student_id,
                assessment_id=student_assessment.id,
                topic_name=topic_name,
                notes_content=content,
            )
            for topic_name, content in zip(analysis_result.weak_topics, notes_contents)
        ]
        notes = await self.repo.add_notes(note_rows) if note_rows else []

        study_plan = await self.repo.add_study_plan(
            StudentStudyPlan(student_id=student_id, assessment_id=student_assessment.id, plan_json=plan_json)
        )

        await self.repo.commit()
        for row in (student_assessment, analysis, *notes, study_plan):
            await self.repo.db.refresh(row)

        return student_assessment, analysis, notes, study_plan, recommendations

    async def _generate_notes_cached(self, provider, topic_name: str, course_id: int | None) -> str:
        cache_key = f"ai:notes:{course_id}:{topic_name.lower().strip()}"
        redis_client = create_redis_client()
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                return cached
        except Exception:
            self.logger.exception("Redis unavailable for notes cache lookup; generating fresh")

        context_chunks: list[str] = []
        if self.retrieval:
            try:
                results = await self.retrieval.retrieve(topic_name, course_id=course_id, top_k=5)
                context_chunks = [r.chunk_text for r in results]
            except Exception:
                self.logger.exception("Retrieval failed for topic=%s; falling back to ungrounded notes", topic_name)

        notes_content = await provider.generate_notes(topic_name, context_chunks=context_chunks or None)
        try:
            await redis_client.set(cache_key, notes_content, ex=NOTES_CACHE_TTL_SECONDS)
        except Exception:
            self.logger.exception("Failed to write notes cache for topic=%s", topic_name)
        return notes_content

    async def list_my_assessments(self, student_id: int) -> list[StudentAssessment]:
        return await self.repo.list_student_assessments(student_id)

    @staticmethod
    def _assert_can_view(owner_student_id: int, principal) -> None:
        if principal.type in ("admin", "trainer"):
            return
        if principal.user_id != owner_student_id:
            raise ServiceError("Assessment result not found", 404)

    async def get_result(self, student_assessment_id: int, principal):
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        self._assert_can_view(student_assessment.student_id, principal)
        analysis = await self.repo.get_analysis_by_student_assessment(student_assessment_id)
        if not analysis:
            raise ServiceError("Analysis not found for this assessment", 404)
        return student_assessment, analysis

    async def get_notes(self, student_assessment_id: int, principal) -> list[AIGeneratedNote]:
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        self._assert_can_view(student_assessment.student_id, principal)
        return await self.repo.get_notes_by_student_assessment(student_assessment_id)

    async def get_study_plan(self, student_assessment_id: int, principal) -> StudentStudyPlan:
        student_assessment = await self.repo.get_student_assessment(student_assessment_id)
        if not student_assessment:
            raise ServiceError("Assessment result not found", 404)
        self._assert_can_view(student_assessment.student_id, principal)
        plan = await self.repo.get_study_plan_by_student_assessment(student_assessment_id)
        if not plan:
            raise ServiceError("Study plan not found for this assessment", 404)
        return plan
