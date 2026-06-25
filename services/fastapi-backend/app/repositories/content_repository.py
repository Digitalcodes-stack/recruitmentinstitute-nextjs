from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class ContentRepository:
    """Read-only lookups against Prisma-owned course content tables.
    FastAPI does not own these tables and must never write to them.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_courses(self) -> list[dict]:
        result = await self.db.execute(text("SELECT id, title, description, course_category_id FROM courses"))
        return [dict(row) for row in result.mappings().all()]

    async def list_lessons_for_course(self, course_id: int) -> list[dict]:
        result = await self.db.execute(
            text(
                """
                SELECT l.id AS id, l.title AS title, l.body_html AS body_html, m.course_id AS course_id
                FROM lms_lessons l
                JOIN lms_topics t ON l.topic_id = t.id
                JOIN lms_chapters c ON t.chapter_id = c.id
                JOIN lms_modules m ON c.module_id = m.id
                WHERE m.course_id = :course_id
                """
            ),
            {"course_id": course_id},
        )
        return [dict(row) for row in result.mappings().all()]

    async def list_knowledge_items(self) -> list[dict]:
        result = await self.db.execute(text("SELECT question_id AS id, question, answer FROM knowledge_items"))
        return [dict(row) for row in result.mappings().all()]

    async def list_faqs(self) -> list[dict]:
        result = await self.db.execute(text("SELECT f_id AS id, question, answer, course_category_id FROM faq"))
        return [dict(row) for row in result.mappings().all()]
