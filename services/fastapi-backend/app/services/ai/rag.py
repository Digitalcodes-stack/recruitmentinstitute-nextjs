"""FAISS-backed retrieval over CourseContentEmbedding rows.

Kept behind the same method name RAGService always exposed (retrieve_context)
so callers (AssessmentService.generate_assessment) only need an `await` added,
not a logic rewrite. The VectorIndex abstraction below is the seam a future
pgvector-backed implementation can be swapped into via config, without
touching business logic.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

import numpy as np

from app.repositories.embedding_repository import EmbeddingRepository
from app.services.ai.local_models import get_sentence_embedder


class VectorIndex(ABC):
    @abstractmethod
    def search(self, query_vector: list[float], k: int) -> list[tuple[int, float]]:
        """Return list of (row_index_into_corpus, score) sorted by score desc."""
        raise NotImplementedError


class FAISSVectorIndex(VectorIndex):
    def __init__(self, vectors: np.ndarray) -> None:
        import faiss

        self._faiss = faiss
        dim = vectors.shape[1] if vectors.size else get_sentence_embedder().get_sentence_embedding_dimension()
        self._index = faiss.IndexFlatIP(dim)
        if vectors.size:
            faiss.normalize_L2(vectors)
            self._index.add(vectors)

    def search(self, query_vector: list[float], k: int) -> list[tuple[int, float]]:
        if self._index.ntotal == 0:
            return []
        query = np.array([query_vector], dtype="float32")
        self._faiss.normalize_L2(query)
        scores, indices = self._index.search(query, min(k, self._index.ntotal))
        return [(int(idx), float(score)) for idx, score in zip(indices[0], scores[0]) if idx != -1]


@dataclass
class RAGService:
    embedding_repo: EmbeddingRepository
    _course_indexes: dict[int, tuple[VectorIndex, list[str], int]] = field(default_factory=dict)

    def _embed_query(self, query: str) -> list[float]:
        model = get_sentence_embedder()
        return model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0].tolist()

    @staticmethod
    def _build_index(rows: list) -> tuple[VectorIndex, list[str]]:
        texts = [row.chunk_text for row in rows]
        vectors = np.array([row.embedding for row in rows], dtype="float32") if rows else np.zeros((0, 384), dtype="float32")
        return FAISSVectorIndex(vectors), texts

    async def _get_or_build_index(self, course_id: int) -> tuple[VectorIndex, list[str]]:
        rows = await self.embedding_repo.list_by_course(course_id)
        cached = self._course_indexes.get(course_id)
        if cached and cached[2] == len(rows):
            return cached[0], cached[1]
        index, texts = self._build_index(rows)
        self._course_indexes[course_id] = (index, texts, len(rows))
        return index, texts

    async def retrieve_context(self, course_id: int, query: str, k: int = 5) -> str:
        try:
            index, texts = await self._get_or_build_index(course_id)
            if not texts:
                return ""
            query_vector = self._embed_query(query)
            hits = index.search(query_vector, k)
            return "\n\n".join(texts[i] for i, _score in hits)
        except Exception:
            return ""
