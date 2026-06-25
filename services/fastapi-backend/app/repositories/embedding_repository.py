from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content_embedding import CourseContentEmbedding


class EmbeddingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_source_chunk(self, source_type: str, source_id: int, chunk_index: int) -> CourseContentEmbedding | None:
        res = await self.db.execute(
            select(CourseContentEmbedding).where(
                CourseContentEmbedding.source_type == source_type,
                CourseContentEmbedding.source_id == source_id,
                CourseContentEmbedding.chunk_index == chunk_index,
            )
        )
        return res.scalars().first()

    async def upsert(self, row: CourseContentEmbedding) -> CourseContentEmbedding:
        self.db.add(row)
        await self.db.flush()
        return row

    async def delete_stale_chunks(self, source_type: str, source_id: int, max_chunk_index: int) -> None:
        res = await self.db.execute(
            select(CourseContentEmbedding).where(
                CourseContentEmbedding.source_type == source_type,
                CourseContentEmbedding.source_id == source_id,
                CourseContentEmbedding.chunk_index > max_chunk_index,
            )
        )
        for row in res.scalars().all():
            await self.db.delete(row)
        await self.db.flush()

    async def list_by_course(self, course_id: int) -> list[CourseContentEmbedding]:
        res = await self.db.execute(select(CourseContentEmbedding).where(CourseContentEmbedding.course_id == course_id))
        return list(res.scalars().all())

    async def list_all(self) -> list[CourseContentEmbedding]:
        res = await self.db.execute(select(CourseContentEmbedding))
        return list(res.scalars().all())

    async def commit(self) -> None:
        await self.db.commit()
