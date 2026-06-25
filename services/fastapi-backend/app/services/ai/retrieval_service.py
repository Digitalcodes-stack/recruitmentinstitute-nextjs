from dataclasses import dataclass

import numpy as np

from app.repositories.embedding_repository import EmbeddingRepository
from app.services.ai.embeddings import embed_texts


@dataclass
class RetrievalResult:
    chunk_text: str
    source_type: str
    source_id: int
    score: float


@dataclass
class RetrievalService:
    embedding_repo: EmbeddingRepository

    async def retrieve(self, query: str, course_id: int | None = None, top_k: int = 5) -> list[RetrievalResult]:
        candidates = await self.embedding_repo.list_by_course(course_id) if course_id else await self.embedding_repo.list_all()
        if not candidates:
            return []

        query_vector = (await embed_texts([query]))[0]
        query_arr = np.array(query_vector)
        query_norm = np.linalg.norm(query_arr)

        scored: list[tuple[float, object]] = []
        for row in candidates:
            row_arr = np.array(row.embedding)
            denom = query_norm * np.linalg.norm(row_arr)
            sim = float(np.dot(query_arr, row_arr) / denom) if denom else 0.0
            scored.append((sim, row))

        scored.sort(key=lambda pair: pair[0], reverse=True)
        return [
            RetrievalResult(chunk_text=row.chunk_text, source_type=row.source_type, source_id=row.source_id, score=sim)
            for sim, row in scored[:top_k]
        ]
