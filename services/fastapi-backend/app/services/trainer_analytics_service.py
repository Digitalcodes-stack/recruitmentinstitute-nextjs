from dataclasses import dataclass

from app.core.exceptions import ServiceError
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.trainer_analytics_repository import TrainerAnalyticsRepository
from app.services.ai.ai_service import get_reliable_ai_provider


@dataclass
class TrainerAnalyticsService:
    analytics_repo: TrainerAnalyticsRepository
    assessment_repo: AssessmentRepository

    @staticmethod
    def _assert_trainer_scope(principal, trainer_id: int) -> None:
        if principal.type == "admin":
            return
        if principal.type == "trainer" and principal.user_id == trainer_id:
            return
        raise ServiceError("Forbidden", 403)

    async def batch_performance_for_trainer(self, trainer_id: int, principal) -> list[dict]:
        self._assert_trainer_scope(principal, trainer_id)
        batches = await self.analytics_repo.get_batches_for_trainer(trainer_id)
        results = []
        for batch in batches:
            students = await self.analytics_repo.get_students_in_batch(batch["id"])
            student_ids = [s["id"] for s in students]
            perf = await self.assessment_repo.batch_performance(student_ids)
            results.append({"batch_id": batch["id"], "batch_name": batch["name"], **perf})
        return results

    async def weak_topic_trends_for_trainer(self, trainer_id: int, principal) -> list[dict]:
        self._assert_trainer_scope(principal, trainer_id)
        batches = await self.analytics_repo.get_batches_for_trainer(trainer_id)
        student_ids: list[int] = []
        for batch in batches:
            students = await self.analytics_repo.get_students_in_batch(batch["id"])
            student_ids.extend(s["id"] for s in students)
        return await self.assessment_repo.weak_topic_trends(student_ids)

    async def course_effectiveness_for_trainer(self, trainer_id: int, course_id: int, principal) -> dict:
        self._assert_trainer_scope(principal, trainer_id)
        batches = await self.analytics_repo.get_batches_for_trainer(trainer_id)
        student_ids: list[int] = []
        for batch in batches:
            if batch["course_id"] != course_id:
                continue
            students = await self.analytics_repo.get_students_in_batch(batch["id"])
            student_ids.extend(s["id"] for s in students)
        return await self.assessment_repo.course_effectiveness(student_ids, course_id)

    async def student_ranking_for_batch(self, trainer_id: int, batch_id: int, principal) -> list[dict]:
        self._assert_trainer_scope(principal, trainer_id)
        if principal.type != "admin" and not await self.analytics_repo.verify_batch_belongs_to_trainer(batch_id, trainer_id):
            raise ServiceError("Batch not found", 404)
        students = await self.analytics_repo.get_students_in_batch(batch_id)
        ranking = await self.assessment_repo.student_ranking([s["id"] for s in students])
        name_by_id = {s["id"]: s["name"] for s in students}
        return [
            {"student_id": r["student_id"], "student_name": name_by_id.get(r["student_id"]), "avg_percentage": r["avg_pct"]}
            for r in ranking
        ]

    async def generate_recommendations(self, trainer_id: int, batch_id: int, principal) -> list[str]:
        self._assert_trainer_scope(principal, trainer_id)
        if principal.type != "admin" and not await self.analytics_repo.verify_batch_belongs_to_trainer(batch_id, trainer_id):
            raise ServiceError("Batch not found", 404)
        students = await self.analytics_repo.get_students_in_batch(batch_id)
        student_ids = [s["id"] for s in students]
        summary = {
            "batch_performance": await self.assessment_repo.batch_performance(student_ids),
            "weak_topics": await self.assessment_repo.weak_topic_trends(student_ids),
        }
        provider = get_reliable_ai_provider()
        return await provider.generate_trainer_recommendations(summary)
