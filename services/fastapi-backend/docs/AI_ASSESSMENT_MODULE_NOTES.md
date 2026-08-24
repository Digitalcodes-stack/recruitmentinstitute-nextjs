# AI Assessment Module — Deep Reference Notes

How the FastAPI AI-assessment system actually works, end to end, as of
2026-06-25. Written from direct inspection of the current code (not from
memory of the original spec — several things evolved past the original
plan, noted inline where it matters).

---

## 1. The big picture

This is a FastAPI microservice (`services/fastapi-backend/`) bolted onto a
Next.js + Prisma application. FastAPI does **not** own login — it trusts
JWTs issued by Next.js (`Authorization: Bearer <ri_user_token>`), decoded
in `app/api/deps.py` via `decode_nextjs_token`. Next.js calls FastAPI
server-side only; the browser never talks to FastAPI directly.

Two systems live side by side inside "assessment":

1. **Question Bank** (`question_bank_items` table / `QuestionBankItem`
   model) — the table the *student-facing* flow actually reads from.
   Proper MCQ shape: `option_a/b/c/d` + `correct_option` (a single
   `A`/`B`/`C`/`D` letter) + `sort_order`.
2. **AI-Generated Questions** (`assessment_questions` table /
   `AssessmentQuestion` model) — written by the AI/RAG generation pipeline.
   Looser shape: `options` (JSON list) + `correct_answer` (the answer
   text, not a letter) + `question_type` + `topic`.

**These were originally disconnected** — `POST /generate` wrote only to
table 2, but `/start` and `/grade-and-submit` only ever read from table 1.
Fixed 2026-06-25 in `assessment_service.py::generate_assessment`: it now
writes a `QuestionBankItem` row for every `AssessmentQuestion` it creates,
mapping `options[i]` → `option_a..d` and resolving `correct_answer`'s
index into a letter. If you ever add a new way to generate questions,
remember it must populate `QuestionBankItem` too, or the student UI will
silently 404 with "no questions yet."

---

## 2. Data model map

```
assessments                     (the test "shell": name, course_id, total_marks, duration)
  ├─ question_bank_items        (MCQ shape, what /start serves to students)
  ├─ assessment_questions       (AI-generation output shape)
  └─ student_assessments        (one row per student attempt: score, percentage, status)
       ├─ ai_assessment_analysis   (strong/weak topics, difficulty breakdown, summary)
       ├─ ai_generated_notes       (one row per weak topic, AI-written notes)
       ├─ student_study_plans      (5-day plan_json)
       └─ assessment_reports       (PDF generation status/path, trainer_remarks lives on student_assessments itself)

course_content_embeddings       (RAG corpus: chunked + embedded course/lesson/FAQ/knowledge-base text)
```

Key FK fact: `ai_assessment_analysis`, `ai_generated_notes`,
`student_study_plans` all FK to **`student_assessments.id`** (the
per-attempt row), not `assessments.id` (the shared template) — a score
and its weak topics belong to one student's one attempt, never to the
test definition itself.

---

## 3. The AI provider layer (adapter pattern)

`app/services/ai/base.py` defines the `AIProvider` ABC — every concrete
provider must implement all six methods:

```python
generate_questions(context_text, question_types, count) -> list[dict]
analyze_performance(score, percentage, topic_scores) -> PerformanceAnalysis
generate_notes(topic_name, context_chunks=None) -> str
generate_study_plan(weak_topics, strong_topics) -> dict
generate_recommendations(percentage) -> list[str]
generate_trainer_recommendations(batch_summary) -> list[str]
```

Concrete providers in `app/services/ai/providers/`:

| Provider | File | What it actually does |
|---|---|---|
| `ClaudeProvider` | `claude_provider.py` | Real Anthropic SDK calls, structured JSON-schema outputs, prompt caching |
| `OpenAIProvider` | `openai_provider.py` | Real OpenAI SDK, `response_format` JSON schema strict mode |
| `GeminiProvider` | `gemini_provider.py` | Real `google-genai` SDK |
| `LocalLLMProvider` | `local_llm_provider.py` | Real Ollama call via `httpx`, for a self-hosted LLM |
| `LocalAIProvider` | `local_ai_provider.py` | **Fully offline, no network, no API key.** Rule-based analysis/recommendations/study-plans, local `transformers` summarization model for notes, local NLP-based question generation. See §4. |
| `MockProvider` | `mock_provider.py` | Deterministic canned output, for tests |

### Selection (`ai_service.py`)

```python
AI_PROVIDER=local_ai   # this is the DEFAULT — not "claude"
```

`get_ai_provider()` reads `settings.ai_provider`, defaults to `"local_ai"`
if unset — **this is a correction to earlier notes that assumed Claude was
the default.** It is not; the system is designed to work with zero API
keys out of the box.

`get_reliable_ai_provider()` wraps the primary provider plus an ordered
fallback chain (`AI_PROVIDER_FALLBACK_ORDER`, comma-separated provider
names) in `ReliableAIProvider` (`reliable_provider.py`), which retries each
provider with exponential backoff (`tenacity`) before falling through to
the next. This is why generating an assessment "succeeded" even with a
blank `CLAUDE_API_KEY` — it silently fell through to `local_ai` and
produced rule-based, lower-quality output instead of erroring. Check
`GET /api/v1/ai/health` (or call `check_provider_health()` directly) to
see which providers are actually configured/reachable before trusting
output quality.

**Practical implication:** if you want real AI-quality questions/notes,
set `CLAUDE_API_KEY` (or another real provider's key) **and** set
`AI_PROVIDER=claude` explicitly — otherwise `local_ai` quietly wins by
default.

---

## 4. The offline RAG + question-generation pipeline

This is the most architecturally interesting part and didn't exist in the
original spec — it was built to make the whole system function with zero
external API dependency.

### 4.1 Content sync (`sync_service.py` → `ContentSyncService`)

Pulls real content straight from Prisma's tables (via `ContentRepository`,
read-only raw SQL — same cross-schema-without-FK pattern used everywhere
else in this service): course descriptions, lesson bodies, knowledge-base
items, FAQs. Strips HTML, chunks each source (`embeddings.py::chunk_text`,
~2000 chars with 200-char overlap, paragraph-aware), embeds each chunk
(`embed_texts`, via a local `sentence-transformers` model in
`local_models.py`), and upserts into `course_content_embeddings`,
content-hash-deduplicated so re-syncing is cheap and idempotent. Stale
chunks (left over from edited/shortened source content) are deleted by
chunk-index cutoff.

This needs to be run (`POST /api/v1/content/sync` — check
`content_sync.py` for the exact route) before a course has any real
context for RAG retrieval to find. Without it, `RAGService.retrieve_context`
returns `""` and the generator falls back to generic recruitment/HR
boilerplate context — which is exactly what happened for course 19's
"Certification Courses" assessment (its questions were extracted almost
verbatim from the raw course description text because no real chunked
corpus existed yet).

### 4.2 Retrieval (`rag.py` → `RAGService`)

In-memory FAISS index per course (`FAISSVectorIndex`, cosine similarity
via `IndexFlatIP` + L2-normalized vectors), built lazily and cached by
course id + row count (cheap invalidation: rebuild if the row count
changed since last build). `retrieve_context(course_id, query, k)` embeds
the query with the same sentence-transformer model, searches the index,
and joins the top-k chunk texts. Swappable behind the abstract
`VectorIndex` class if you ever want pgvector instead of FAISS — the
seam is intentional, noted in the file's own docstring.

### 4.3 Question generation (`question_generator.py`)

Used by `LocalAIProvider.generate_questions` — local NLP-based extraction
that turns retrieved context into fill-in-the-blank-style MCQs by masking
key terms and generating plausible-but-wrong distractor options from
other terms in the corpus. This is **not** a generative LLM — it's why the
course-19 questions read as mechanical "Fill in the blank: ___" text
lifted from the source material rather than naturally-phrased questions a
human (or a real LLM) would write. A real provider (Claude/OpenAI/Gemini)
asked to `generate_questions` would produce normal-sounding MCQs instead.

### 4.4 Notes generation, offline mode

`LocalAIProvider.generate_notes` — if RAG found real context chunks for
the topic, it runs them through a local summarization model
(`local_models.py::get_summarizer`, a `transformers` pipeline) truncated to
3000 chars, falls back to naive first-3-sentences extraction if the model
errors. If no context chunks exist for the topic (course never synced, or
topic name doesn't match anything in the corpus), it returns a canned
"no grounded material found, sync your content" message rather than
fabricating notes — a deliberate honesty choice over hallucinating.

---

## 5. The submit() workflow (transactional core)

`AssessmentService.submit()` in `assessment_service.py` — the heart of the
"take an assessment, get AI feedback" flow:

```
1. Look up the Assessment (404 if missing)
2. Compute score/percentage from topic_scores
3. INSERT student_assessments row                       (flush, not commit)
4. provider.analyze_performance() -> strong/weak topics
5. INSERT ai_assessment_analysis row                     (flush)
6. For each weak topic: fetch-or-generate notes           (Redis-cached, 7-day TTL)
   INSERT ai_generated_notes row(s)                       (flush)
7. provider.generate_study_plan()
   INSERT student_study_plans row                         (flush)
8. provider.generate_recommendations()
9. commit()  <- the ONLY commit in the whole flow
10. refresh all returned ORM objects
```

**Why this matters:** every DB write before step 9 uses `flush()`, not
`commit()`. If any AI provider call (steps 4, 6, 7, 8) raises — e.g. no
API key configured, rate limit, network failure — nothing written during
that request is ever persisted. The whole attempt rolls back atomically;
there is no such thing as a half-finished "completed" assessment row with
no analysis behind it.

This was a real bug once (verified 2026-06-24): an early version called
`db.commit()` after every individual write, so a failure midway through
left an orphaned, half-finished `student_assessments` row. Fixed by
switching every repository write method to `flush()`-only and adding a
single `repo.commit()` call at the very end of `submit()`. Verified via:
direct service-layer call, in-process ASGI call (bypassing uvicorn
entirely), and a live HTTP call against a freshly-started server — all
showed zero orphaned rows on AI failure, plus a `pg_stat_activity` check
confirming Postgres actually issued `ROLLBACK`.

**Caching detail:** notes are cached in Redis under
`ai:notes:<topic_name lowercased/stripped>` for 7 days. If Redis is down,
the cache read/write is wrapped in try/except and logged — generation
still proceeds, it's just never cached. Cache is shared across students;
the first student to hit a weak topic "pays" for generation, everyone
after gets the cached version until TTL expires.

---

## 6. API surface (prefix `/api/v1/assessment`)

| Method & path | Who | What |
|---|---|---|
| `POST /generate` | admin, trainer | AI/RAG-generates a whole assessment for a course |
| `POST /` | admin | Manually create an empty assessment shell |
| `POST /{id}/questions` | admin | Manually add one `QuestionBankItem` |
| `GET /{id}/questions` | admin | List question bank items (with correct answers — admin only) |
| `DELETE /{id}/questions/{qid}` | admin | Remove a question |
| `GET /by-course/{course_id}` | any authenticated | Latest assessment for a course (what the student page calls first) |
| `GET /{id}/start` | any authenticated | Questions **without** correct answers, for taking the test |
| `POST /{id}/grade-and-submit` | any authenticated | Grades raw A/B/C/D answers against `QuestionBankItem.correct_option`, buckets by topic, calls `submit()` internally |
| `POST /submit` | any authenticated | Lower-level: caller already knows topic_scores (used by `grade-and-submit` indirectly, or directly if you have pre-computed scores) |
| `GET /my` | student | List all of the caller's own attempts |
| `GET /result/{id}` | owner, admin, trainer | Attempt + analysis |
| `GET /notes/{id}` | owner, admin, trainer | Generated notes for that attempt |
| `GET /study-plan/{id}` | owner, admin, trainer | Generated study plan |
| `PATCH /{id}/remarks` | admin, trainer | Add free-text trainer remarks to an attempt |
| `POST /report/{id}` | owner, admin, trainer | Queue async PDF generation (Celery task) |
| `POST /report/{id}/run-now` | owner, admin, trainer | Generate PDF synchronously instead |
| `GET /report/{id}/status` | owner, admin, trainer | Poll generation status |
| `GET /report/{id}/download` | owner, admin, trainer | Download the finished PDF |

Access control note: result/notes/study-plan/report endpoints all check
`ReportService._assert_can_access` / equivalent — a student can only see
their own attempts; admin/trainer can see anyone's.

---

## 7. PDF report generation

`report_service.py::ReportService.generate_pdf` — builds a real PDF via
`reportlab` (not an external AI call): student info table, strong/weak
topics, the AI analysis summary, all generated notes (their limited
markdown — `### headers`, `**bold**`, `- bullets` — converted to
reportlab's inline HTML-like markup), the study plan as a table, and
trainer remarks if any. Triggered either synchronously
(`/report/{id}/run-now`) or asynchronously via a Celery task
(`generate_assessment_report` in `app/workers/tasks.py`, queued by
`/report/{id}`), with status tracked in the `assessment_reports` table
(`generating` → `ready`/`failed`).

---

## 8. Trainer analytics

`trainer_analytics.py` (router) + `LocalAIProvider.generate_trainer_recommendations`
— batch-level rollups (avg percentage, common weak topics across a batch)
feed into AI-generated coaching suggestions for trainers, separate from
the per-student recommendations. Worth reading `trainer_analytics.py`
directly if you need the exact aggregation queries — not detailed here
since it wasn't touched/verified in the sessions that produced this
document.

---

## 9. Known gaps / things to check before relying on this in production

1. **`CLAUDE_API_KEY` (and all other provider keys) are blank** in `.env`
   as of this writing. The system runs entirely on `LocalAIProvider`
   fallback — functional, but template/rule-based quality, not true
   generative AI. Set a real key + `AI_PROVIDER=claude` to upgrade output
   quality.
2. **Content sync must be run per course** before RAG-based question
   generation produces grounded, well-phrased questions instead of
   boilerplate. Check whether `course_content_embeddings` has rows for a
   course before trusting `/generate`'s output quality for it.
3. **Two question tables** (`question_bank_items` vs `assessment_questions`)
   — only the former is read by the student-facing flow. Any future
   question-creation path must write to both, or only to
   `question_bank_items` if `assessment_questions` is ever fully retired.
4. Stale background `uvicorn` processes have caused confusing debugging
   sessions twice now (a process invisible to `ps`/`wmic`/`Get-Process`
   stayed bound to a port and served pre-fix code). After any backend
   code change, explicitly verify which PID owns port 8000
   (`netstat -ano | findstr :8000` then `Get-Process -Id <pid>`) before
   trusting a live test result.
