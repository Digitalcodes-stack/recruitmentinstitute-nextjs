import hashlib
from dataclasses import dataclass

from app.models.content_embedding import CourseContentEmbedding
from app.repositories.content_repository import ContentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.services.ai.embeddings import chunk_text, embed_texts, extract_semantic_blocks, strip_html


def _to_indexable_text(html: str | None) -> str:
    """Outline-style content (heading + bullet list) is merged per-heading
    via extract_semantic_blocks so short bullets keep their module context;
    prose content without that structure falls back to flat strip_html."""
    blocks = extract_semantic_blocks(html)
    if blocks:
        return "\n\n".join(blocks)
    return strip_html(html)


@dataclass
class ContentSyncService:
    content_repo: ContentRepository
    embedding_repo: EmbeddingRepository

    async def sync_all(self) -> dict[str, int]:
        stats = {"courses": 0, "lessons": 0, "knowledge_items": 0, "faqs": 0, "chunks_written": 0, "chunks_skipped": 0}

        courses = await self.content_repo.list_courses()
        for course in courses:
            description = _to_indexable_text(course["description"])
            if description:
                await self._sync_source("course", course["id"], description, course["id"], stats)
                stats["courses"] += 1

        for course in courses:
            for lesson in await self.content_repo.list_lessons_for_course(course["id"]):
                body = _to_indexable_text(lesson["body_html"])
                if body:
                    await self._sync_source("lesson", lesson["id"], body, course["id"], stats)
                    stats["lessons"] += 1

        for item in await self.content_repo.list_knowledge_items():
            await self._sync_source("knowledge_item", item["id"], f"{item['question']}\n{item['answer']}", None, stats)
            stats["knowledge_items"] += 1

        for faq in await self.content_repo.list_faqs():
            await self._sync_source("faq", faq["id"], f"{faq['question']}\n{faq['answer']}", None, stats)
            stats["faqs"] += 1

        await self.embedding_repo.commit()
        return stats

    async def _sync_source(self, source_type: str, source_id: int, text: str, course_id: int | None, stats: dict) -> None:
        chunks = chunk_text(text)
        if not chunks:
            return

        pending: list[tuple[int, str, str, "CourseContentEmbedding | None"]] = []
        for idx, chunk in enumerate(chunks):
            content_hash = hashlib.sha256(chunk.encode()).hexdigest()
            existing = await self.embedding_repo.get_by_source_chunk(source_type, source_id, idx)
            if existing and existing.content_hash == content_hash:
                stats["chunks_skipped"] += 1
                continue
            pending.append((idx, chunk, content_hash, existing))

        if pending:
            vectors = await embed_texts([c[1] for c in pending])
            for (idx, chunk, content_hash, existing), vector in zip(pending, vectors):
                if existing:
                    existing.chunk_text = chunk
                    existing.embedding = vector
                    existing.content_hash = content_hash
                    existing.course_id = course_id
                    await self.embedding_repo.upsert(existing)
                else:
                    await self.embedding_repo.upsert(
                        CourseContentEmbedding(
                            source_type=source_type,
                            source_id=source_id,
                            course_id=course_id,
                            chunk_index=idx,
                            chunk_text=chunk,
                            embedding=vector,
                            content_hash=content_hash,
                        )
                    )
                stats["chunks_written"] += 1

        await self.embedding_repo.delete_stale_chunks(source_type, source_id, len(chunks) - 1)
