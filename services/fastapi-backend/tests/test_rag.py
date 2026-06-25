import pytest

from app.models.assessment import Assessment
from app.repositories.assessment_repository import AssessmentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.schemas.assessment import AssessmentSubmitRequest, TopicScoreInput
from app.services.ai.base import PerformanceAnalysis
from app.services.ai.embeddings import chunk_text
from app.services.ai.rag import RAGService
from app.services.ai.retrieval_service import RetrievalResult, RetrievalService
from app.services.ai.sync_service import ContentSyncService
from app.services.assessment_service import AssessmentService


def test_chunk_text_splits_on_paragraphs_and_respects_max_chars():
    text = "Paragraph one.\n\n" + ("word " * 600) + "\n\nParagraph three."
    chunks = chunk_text(text, max_chars=2000, overlap_chars=200)

    assert len(chunks) >= 1
    assert all(len(c) <= 2000 for c in chunks)
    assert "Paragraph one." in chunks[0]


def test_chunk_text_returns_empty_for_blank_input():
    assert chunk_text("   \n\n  ") == []


class FakeContentRepository:
    def __init__(self, courses, lessons_by_course, knowledge_items, faqs):
        self._courses = courses
        self._lessons_by_course = lessons_by_course
        self._knowledge_items = knowledge_items
        self._faqs = faqs

    async def list_courses(self):
        return self._courses

    async def list_lessons_for_course(self, course_id):
        return self._lessons_by_course.get(course_id, [])

    async def list_knowledge_items(self):
        return self._knowledge_items

    async def list_faqs(self):
        return self._faqs


@pytest.mark.anyio
async def test_sync_all_embeds_and_skips_unchanged(db_session, monkeypatch):
    content_repo = FakeContentRepository(
        courses=[{"id": 1, "title": "HR Basics", "description": "Recruitment lifecycle overview."}],
        lessons_by_course={1: [{"id": 10, "title": "Lesson 1", "body_html": "<p>Interview scheduling steps.</p>"}]},
        knowledge_items=[{"id": 100, "question": "What is sourcing?", "answer": "Finding candidates."}],
        faqs=[{"id": 200, "question": "What is onboarding?", "answer": "Process after hiring.", "course_category_id": None}],
    )

    async def fake_embed_texts(texts):
        return [[0.1] * 1536 for _ in texts]

    monkeypatch.setattr("app.services.ai.sync_service.embed_texts", fake_embed_texts)

    sync_service = ContentSyncService(content_repo, EmbeddingRepository(db_session))

    first_stats = await sync_service.sync_all()
    assert first_stats["chunks_written"] > 0
    assert first_stats["chunks_skipped"] == 0

    second_stats = await sync_service.sync_all()
    assert second_stats["chunks_written"] == 0
    assert second_stats["chunks_skipped"] == first_stats["chunks_written"]


@pytest.mark.anyio
async def test_sync_all_updates_existing_row_when_content_changes(db_session, monkeypatch):
    from app.models.content_embedding import CourseContentEmbedding

    content_repo = FakeContentRepository(
        courses=[{"id": 2, "title": "HR Basics", "description": "Original description text."}],
        lessons_by_course={}, knowledge_items=[], faqs=[],
    )

    async def fake_embed_texts(texts):
        return [[0.2] * 1536 for _ in texts]

    monkeypatch.setattr("app.services.ai.sync_service.embed_texts", fake_embed_texts)
    sync_service = ContentSyncService(content_repo, EmbeddingRepository(db_session))

    first_stats = await sync_service.sync_all()
    assert first_stats["chunks_written"] == 1

    content_repo._courses[0]["description"] = "Updated description text, completely different."
    second_stats = await sync_service.sync_all()
    assert second_stats["chunks_written"] == 1
    assert second_stats["chunks_skipped"] == 0

    res = await db_session.execute(
        CourseContentEmbedding.__table__.select().where(
            CourseContentEmbedding.source_type == "course", CourseContentEmbedding.source_id == 2
        )
    )
    rows = res.fetchall()
    assert len(rows) == 1
    assert "Updated description" in rows[0].chunk_text


@pytest.mark.anyio
async def test_retrieval_returns_top_k_by_cosine_similarity(db_session, monkeypatch):
    from app.models.content_embedding import CourseContentEmbedding

    near = [1.0, 0.0, 0.0]
    orthogonal_a = [0.0, 1.0, 0.0]
    orthogonal_b = [0.0, 0.0, 1.0]

    repo = EmbeddingRepository(db_session)
    test_course_id = 424242
    await repo.upsert(CourseContentEmbedding(
        source_type="lesson", source_id=1, course_id=test_course_id, chunk_index=0,
        chunk_text="closest match", embedding=near, content_hash="a",
    ))
    await repo.upsert(CourseContentEmbedding(
        source_type="lesson", source_id=2, course_id=test_course_id, chunk_index=0,
        chunk_text="decoy a", embedding=orthogonal_a, content_hash="b",
    ))
    await repo.upsert(CourseContentEmbedding(
        source_type="lesson", source_id=3, course_id=test_course_id, chunk_index=0,
        chunk_text="decoy b", embedding=orthogonal_b, content_hash="c",
    ))
    await repo.commit()

    async def fake_embed_texts(texts):
        return [near]

    monkeypatch.setattr("app.services.ai.retrieval_service.embed_texts", fake_embed_texts)

    results = await RetrievalService(repo).retrieve("query", course_id=test_course_id, top_k=2)

    assert results[0].chunk_text == "closest match"
    assert results[0].score > results[1].score


@pytest.mark.anyio
async def test_retrieval_returns_empty_when_no_embeddings_exist(db_session):
    results = await RetrievalService(EmbeddingRepository(db_session)).retrieve("query", course_id=999)
    assert results == []


class FakeProviderCapturingContext:
    def __init__(self) -> None:
        self.received_context_chunks: list[str] | None = "not_called"

    async def analyze_performance(self, score, percentage, topic_scores):
        return PerformanceAnalysis(strong_topics=["Python Basics"], weak_topics=["OOP"], difficulty_breakdown={}, summary="x")

    async def generate_notes(self, topic_name, context_chunks=None):
        self.received_context_chunks = context_chunks
        return f"# Notes for {topic_name}"

    async def generate_study_plan(self, weak_topics, strong_topics):
        return {"day_1": "OOP", "day_2": "x", "day_3": "x", "day_4": "x", "day_5": "x"}

    async def generate_recommendations(self, percentage):
        return ["rec"]


class FakeRedis:
    async def get(self, key):
        return None

    async def set(self, key, value, ex=None):
        return True


class FakeRetrievalService:
    def __init__(self, results):
        self._results = results

    async def retrieve(self, query, course_id=None, top_k=5):
        return self._results


class FailingRetrievalService:
    async def retrieve(self, query, course_id=None, top_k=5):
        raise RuntimeError("retrieval backend down")


async def _submit_with_retrieval(db_session, monkeypatch, retrieval):
    db_session.add(Assessment(course_id=1, assessment_name="Python Basics", total_marks=100, duration_minutes=30))
    await db_session.commit()
    assessment = (await db_session.execute(Assessment.__table__.select())).fetchone()

    provider = FakeProviderCapturingContext()
    monkeypatch.setattr("app.services.assessment_service.get_reliable_ai_provider", lambda: provider)
    monkeypatch.setattr("app.services.assessment_service.create_redis_client", lambda: FakeRedis())

    payload = AssessmentSubmitRequest(
        assessment_id=assessment.id,
        topic_scores=[TopicScoreInput(topic_name="OOP", correct=4, total=10)],
    )
    await AssessmentService(AssessmentRepository(db_session), retrieval).submit(7002, payload)
    return provider


@pytest.mark.anyio
async def test_generate_notes_grounds_with_retrieved_chunks(db_session, monkeypatch):
    retrieval = FakeRetrievalService([RetrievalResult(chunk_text="Course material on OOP.", source_type="lesson", source_id=1, score=0.9)])
    provider = await _submit_with_retrieval(db_session, monkeypatch, retrieval)
    assert provider.received_context_chunks == ["Course material on OOP."]


@pytest.mark.anyio
async def test_generate_notes_degrades_gracefully_when_retrieval_empty(db_session, monkeypatch):
    retrieval = FakeRetrievalService([])
    provider = await _submit_with_retrieval(db_session, monkeypatch, retrieval)
    assert provider.received_context_chunks is None


@pytest.mark.anyio
async def test_generate_notes_degrades_gracefully_when_retrieval_fails(db_session, monkeypatch):
    provider = await _submit_with_retrieval(db_session, monkeypatch, FailingRetrievalService())
    assert provider.received_context_chunks is None


@pytest.mark.anyio
async def test_rag_service_retrieve_context_returns_closest_chunk_via_faiss(db_session, monkeypatch):
    from app.models.content_embedding import CourseContentEmbedding

    near = [1.0, 0.0, 0.0]
    orthogonal = [0.0, 1.0, 0.0]
    test_course_id = 555555

    repo = EmbeddingRepository(db_session)
    await repo.upsert(CourseContentEmbedding(
        source_type="lesson", source_id=101, course_id=test_course_id, chunk_index=0,
        chunk_text="closest faiss match", embedding=near, content_hash="faiss-a",
    ))
    await repo.upsert(CourseContentEmbedding(
        source_type="lesson", source_id=102, course_id=test_course_id, chunk_index=0,
        chunk_text="faiss decoy", embedding=orthogonal, content_hash="faiss-b",
    ))
    await repo.commit()

    rag = RAGService(repo)
    monkeypatch.setattr(rag, "_embed_query", lambda query: near)

    context = await rag.retrieve_context(test_course_id, "query", k=1)

    assert context == "closest faiss match"


@pytest.mark.anyio
async def test_rag_service_retrieve_context_returns_empty_when_no_embeddings_exist(db_session):
    rag = RAGService(EmbeddingRepository(db_session))
    context = await rag.retrieve_context(999999, "query", k=3)
    assert context == ""


@pytest.mark.anyio
async def test_rag_service_retrieve_context_degrades_gracefully_on_error(db_session, monkeypatch):
    rag = RAGService(EmbeddingRepository(db_session))
    monkeypatch.setattr(rag, "_get_or_build_index", _raise_runtime_error)
    context = await rag.retrieve_context(1, "query", k=3)
    assert context == ""


async def _raise_runtime_error(*args, **kwargs):
    raise RuntimeError("index build failed")
