# Recruitment Institute — Master System & Technical Architecture Documentation

This single master documentation file provides the complete technical architecture, technology stack, AI model ecosystem, Python libraries, data models, end-to-end workflows, configuration settings, and deployment instructions for the **Recruitment Institute Platform**.

---

## Table of Contents

1. [Executive Overview & System Architecture](#1-executive-overview--system-architecture)
2. [Technology Stack Matrix](#2-technology-stack-matrix)
3. [AI & Machine Learning Architecture](#3-ai--machine-learning-architecture)
   - 3.1 [Multi-Provider Adapter Engine](#31-multi-provider-adapter-engine)
   - 3.2 [Supported AI Models & Execution Modes](#32-supported-ai-models--execution-modes)
   - 3.3 [RAG (Retrieval-Augmented Generation) Pipeline](#33-rag-retrieval-augmented-generation-pipeline)
   - 3.4 [Automated Assessment & Question Generation](#34-automated-assessment--question-generation)
   - 3.5 [Diagnostic Performance Analyzer](#35-diagnostic-performance-analyzer)
   - 3.6 [AI Notes & 5-Day Study Plan Generators](#36-ai-notes--5-day-study-plan-generators)
4. [Python Libraries & Ecosystem Reference](#4-python-libraries--ecosystem-reference)
5. [Frontend & Node.js Libraries Reference](#5-frontend--nodejs-libraries-reference)
6. [Database Architecture & Schema Mapping](#6-database-architecture--schema-mapping)
7. [System Workflows & Mermaid Diagrams](#7-system-workflows--mermaid-diagrams)
   - 7.1 [System-Wide Request & Proxy Flow](#71-system-wide-request--proxy-flow)
   - 7.2 [Student AI Assessment & Auto-Grading Lifecycle](#72-student-ai-assessment--auto-grading-lifecycle)
   - 7.3 [RAG Content Ingestion & Vector Retrieval](#73-rag-content-ingestion--vector-retrieval)
   - 7.4 [PDF Report Generation Pipeline](#74-pdf-report-generation-pipeline)
   - 7.5 [Trainer Session & Meeting Synchronization](#75-trainer-session--meeting-synchronization)
8. [Configuration & Environment Variables Specification](#8-configuration--environment-variables-specification)
9. [API Route Surface Reference](#9-api-route-surface-reference)
10. [Local Development & Deployment Guide](#10-local-development--deployment-guide)

---

## 1. Executive Overview & System Architecture

The **Recruitment Institute** platform is built as a **hybrid micro-service architecture** combining a high-performance Next.js full-stack web application with a specialized FastAPI asynchronous Python microservice:

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        UI_Visitor["Visitors / Candidates"]
        UI_Student["Student Portal"]
        UI_Trainer["Trainer Portal"]
        UI_Admin["Admin Management Panel"]
    end

    subgraph "Next.js Full-Stack Application (Port 3000)"
        AppRouter["Next.js App Router (React 19, Turbopack)"]
        AuthLayer["Authentication & JWT Cookie Manager"]
        PrismaORM["Prisma ORM (Data Layer)"]
        ProxyRoutes["Next.js API Route Proxies (/api/assessment/*)"]
    end

    subgraph "FastAPI Microservice (Port 8000)"
        FastAPIEngine["FastAPI Async Engine (Python 3.11+)"]
        AI_Factory["AI Provider Factory & Reliable Wrapper"]
        RAG_Engine["RAG Vector Engine (Sentence-Transformers + PGVector)"]
        AssessmentService["Assessment & Question Bank Service"]
        ReportEngine["PDF Report Engine (ReportLab)"]
        AsyncWorkers["Celery Background Workers"]
    end

    subgraph "Data & Storage Layer"
        PostgresDB[("Shared PostgreSQL Database + PGVector")]
        RedisCache[("Redis (Broker, Cache & JWT Blacklist)")]
        LocalStorage[("Report PDF File Storage")]
    end

    UI_Visitor --> AppRouter
    UI_Student --> AppRouter
    UI_Trainer --> AppRouter
    UI_Admin --> AppRouter

    AppRouter --> PrismaORM
    AppRouter --> ProxyRoutes
    ProxyRoutes -->|Bearer JWT Header| FastAPIEngine

    PrismaORM --> PostgresDB
    FastAPIEngine --> PostgresDB
    FastAPIEngine --> RedisCache
    FastAPIEngine --> AI_Factory
    AI_Factory --> RAG_Engine
    FastAPIEngine --> ReportEngine
    ReportEngine --> LocalStorage
    FastAPIEngine --> AsyncWorkers
```

### Architectural Principles
1. **Separation of Concerns**: Next.js owns authentication, user session cookies, client-side rendering, public course storefront, and portal dashboards. FastAPI owns heavy compute domains: AI question generation, RAG vector searches, automated grading analytics, study plan generation, and PDF document rendering.
2. **Zero-Trust Token Bridging**: Browser clients communicate exclusively with Next.js over HTTP-only secure cookies (`ri_user_token`, `ri_admin_token`, `ri_trainer_token`). Next.js server actions and API route proxies forward requests to FastAPI with standard `Authorization: Bearer <token>` headers.
3. **Unified Single Database**: Both Prisma ORM (Next.js) and SQLAlchemy 2.0 Async (FastAPI) connect to the same PostgreSQL instance, ensuring zero data duplication and instant synchronization across services.

---

## 2. Technology Stack Matrix

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router, Turbopack) | `16.2.7` | Server-Side Rendering, Static Optimization, API routing |
| **UI Library** | React & React DOM | `19.2.4` | Component-driven declarative UI architecture |
| **Styling & Design System** | Tailwind CSS v4 & PostCSS | `^4.0` | Modern utility classes, glassmorphism, responsive styling |
| **Icons & Visuals** | Lucide React | `^1.17.0` | Comprehensive iconography |
| **Charts & Visualizations** | Recharts | `^3.9.0` | Interactive horizontal/vertical bar charts, progress visuals |
| **Markdown Rendering** | React Markdown & Remark GFM | `^10.1.0` / `^4.0.1` | Rich AI study notes and study plan markdown formatting |
| **Forms & Validation** | React Hook Form & Zod | `^7.77.0` / `^4.4.3` | Form state management and runtime schema validation |
| **Frontend ORM** | Prisma Client & PostgreSQL Adapter | `^7.8.0` | Type-safe database queries for Next.js models |
| **Backend Microservice** | FastAPI | `^0.115` | High-performance Python async REST API |
| **ASGI Web Server** | Uvicorn (Standard) | `^0.30` | Asynchronous server implementation |
| **Backend ORM** | SQLAlchemy 2.0 Async | `^2.0` | Async database mapper with connection pooling |
| **Database Driver** | Asyncpg & Psycopg3 | `^0.29` / `^3.2` | Native high-speed async PostgreSQL connectivity |
| **Schema Migrations** | Alembic | `^1.13` | Backend database schema revision management |
| **Data Validation** | Pydantic v2 & Pydantic-Settings | `^2.8` / `^2.4` | Request/response data models and `.env` parsing |
| **Vector Database** | PGVector (PostgreSQL Extension) | `pgvector` | High-dimensional embedding storage & cosine similarity |
| **NLP & Embeddings** | Sentence-Transformers | `^3.0.0` | Vector embeddings generation (`all-MiniLM-L6-v2`) |
| **Local NLP / Transformers** | HuggingFace Transformers | `^4.40` | Local summarization and text analysis models |
| **Keyword Extraction** | KeyBERT & NLTK & spaCy | `^0.8` / `^3.9` / `^3.7` | Topic extraction, grammar analysis, lemma processing |
| **Vector Search Index** | FAISS CPU | `^1.8` | In-memory similarity search for local vector caches |
| **PDF Document Engine** | ReportLab | `^4.2` | Dynamic PDF performance reports with custom canvas & charts |
| **Task Queue & Broker** | Celery & Redis | `^5.4` / `^5.0` | Asynchronous task scheduling and background jobs |
| **Retry & Reliability** | Tenacity | `^8.5` | Exponential backoff and automated provider retry logic |
| **Security & Cryptography** | Python-Jose & Passlib & Bcrypt | `^3.3` / `^1.7` | JWT decoding, bcrypt password hashing |

---

## 3. AI & Machine Learning Architecture

```mermaid
graph LR
    subgraph "AI Provider Layer (app/services/ai/)"
        A[ReliableAIProvider] -->|Primary| B[LocalAIProvider - Default]
        A -->|Fallback 1| C[LocalLLMProvider - Ollama]
        A -->|Fallback 2| D[ClaudeProvider - Anthropic]
        A -->|Fallback 3| E[GeminiProvider - Google]
        A -->|Fallback 4| F[OpenAIProvider - OpenAI]
    end

    subgraph "AI Capabilities"
        B --> Cap1[Generate 25-50 MCQs]
        B --> Cap2[Analyze Performance & Topics]
        B --> Cap3[Generate Markdown Notes]
        B --> Cap4[Build 5-Day Study Plan]
        B --> Cap5[Trainer Batch Analytics]
    end
```

### 3.1 Multi-Provider Adapter Engine

The AI subsystem implements the **Abstract Factory** and **Adapter** patterns via `AIProvider` in `services/fastapi-backend/app/services/ai/base.py`. Every provider implements six core asynchronous contracts:

```python
class AIProvider(ABC):
    @abstractmethod
    async def generate_questions(self, context_text: str, question_types: list[str], count: int) -> list[dict]: ...
    
    @abstractmethod
    async def analyze_performance(self, score: float, percentage: float, topic_scores: list[TopicScore]) -> PerformanceAnalysis: ...
    
    @abstractmethod
    async def generate_notes(self, topic_name: str, context_chunks: list[str] | None = None) -> str: ...
    
    @abstractmethod
    async def generate_study_plan(self, weak_topics: list[str], strong_topics: list[str], difficulty_breakdown: dict[str, float] | None = None) -> dict: ...
    
    @abstractmethod
    async def generate_recommendations(self, percentage: float) -> list[str]: ...
    
    @abstractmethod
    async def generate_trainer_recommendations(self, batch_summary: dict) -> list[str]: ...
```

### 3.2 Supported AI Models & Execution Modes

| Provider Identifier | Implementation File | AI Model / Engine | Network Requirement | Primary Use Case |
|---|---|---|---|---|
| **`local_ai`** *(Default)* | `providers/local_ai_provider.py` | Local NLP + KeyBERT + NLTK + Deterministic Recruitment Knowledge Base | **100% Offline (No API Keys needed)** | Zero-cost local development and offline production deployments |
| **`local_llm`** | `providers/local_llm_provider.py` | LLaMA 3 / Mistral via local **Ollama** server (`http://localhost:11434`) | Local network | Private on-premise LLM execution |
| **`claude`** | `providers/claude_provider.py` | **Anthropic Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`) | Internet (Anthropic API) | High-accuracy curriculum generation and advanced reasoning |
| **`openai`** | `providers/openai_provider.py` | **OpenAI GPT-4o / GPT-4o-mini** | Internet (OpenAI API) | High-speed structured JSON question synthesis |
| **`gemini`** | `providers/gemini_provider.py` | **Google Gemini 1.5 Pro / Flash** | Internet (Google GenAI API) | Multimodal analysis and high-context processing |
| **`mock`** | `providers/mock_provider.py` | Static deterministic test fixtures | None | Unit & integration test suites |

#### Fault-Tolerant Provider Wrapping (`reliable_provider.py`)
Configured through `AI_PROVIDER_FALLBACK_ORDER=local_ai,claude,openai,gemini`. When a request fails (e.g. rate limits or network issues), `ReliableAIProvider` utilizes **Tenacity** exponential backoff (retrying 3 times with 1.5s–6.0s delays) before falling back to the next available provider.

---

### 3.3 RAG (Retrieval-Augmented Generation) Pipeline

The RAG engine indexes recruitment curriculum modules, chapters, and lessons into vector representations:

1. **Document Chunking**: Lesson texts, module summaries, and knowledge base documents are chunked into 500-token segments with 50-token overlaps.
2. **Embedding Generation**: Text chunks are embedded using **`sentence-transformers/all-MiniLM-L6-v2`** (384-dimensional dense vectors) or **`BAAI/bge-small-en-v1.5`**.
3. **PGVector Indexing**: Vectors are saved in the `course_content_embeddings` table with an `HNSW` (Hierarchical Navigable Small World) cosine similarity index.
4. **Context Retrieval**: When generating assessments or notes, the top-k chunks ($k=5$) with cosine distance $< 0.35$ are fetched and provided to the prompt generator.

---

### 3.4 Automated Assessment & Question Generation

When an assessment is requested (`/api/v1/assessment/by-course/{course_id}`), the system:
1. Checks for existing assessments with $\ge 25$ questions in the question bank.
2. If none exist, builds course context from RAG embeddings or domain fallback.
3. Synthesizes **25 to 50 custom MCQs** covering recruitment syllabus topics:
   - *Sourcing & Candidate Attraction* (LinkedIn Recruiter, Boolean search, talent mapping).
   - *Screening & Interview Techniques* (STAR methodology, competency frameworks).
   - *ATS & HR Tech Operations* (Pipeline stages, Boolean filters, talent CRM).
   - *Offer Negotiation, Compliance & Onboarding*.
4. Writes records to both `assessment_questions` and `question_bank_items` (`option_a` through `option_d`, `correct_option`, and detailed `explanation`).

---

### 3.5 Diagnostic Performance Analyzer

When the student submits their test answers:
- Answers are evaluated against `correct_option`.
- Exact topic score statistics are computed:
  $$\text{Topic Percentage} = \left(\frac{\text{Correct Answers in Topic}}{\text{Total Questions in Topic}}\right) \times 100$$
- Classification:
  - **Strong Topics**: Accuracy $\ge 70\%$
  - **Moderate Topics**: Accuracy between $40\%$ and $69\%$
  - **Weak Topics**: Accuracy $< 40\%$
- Stores structured metadata in `ai_assessment_analysis` table under `analysis_json` (including `difficulty_breakdown`, `summary`, and raw `student_answers`).

---

### 3.6 AI Notes & 5-Day Study Plan Generators

For every identified weak topic:
1. **AI Study Notes (`ai_generated_notes`)**: Automatically generates formatted Markdown revision notes detailing:
   - Executive Overview & core definitions.
   - Key industry frameworks (e.g., Structured STAR interview scoring).
   - Step-by-step best practices.
   - Common pitfalls to avoid.
2. **5-Day Actionable Study Plan (`student_study_plans`)**: Generates structured daily sprints:
   - `Day 1: Diagnostics & Foundations` (Focus on primary weak topic).
   - `Day 2: Applied Techniques & Frameworks`.
   - `Day 3: Scenario-based Practice & Case Studies`.
   - `Day 4: Integration with Strong Topics`.
   - `Day 5: Mock Assessment & Certification Readiness`.

---

## 4. Python Libraries & Ecosystem Reference

The FastAPI backend utilizes the following curated Python libraries defined in [requirements.txt](file:///d:/xampp/htdocs/recruitmentinstitute-nextjs/services/fastapi-backend/requirements.txt):

| Package Name | Exact Version Constraint | Technical Role & Purpose |
|---|---|---|
| **`fastapi`** | `>=0.115, <1.0` | Core asynchronous web API framework with automatic OpenAPI documentation |
| **`uvicorn[standard]`** | `>=0.30, <1.0` | Lightning-fast ASGI production web server powered by `uvloop` and `httptools` |
| **`SQLAlchemy`** | `>=2.0, <3.0` | Declarative async ORM engine managing PostgreSQL connections and models |
| **`asyncpg`** | `>=0.29, <1.0` | Ultra-fast native PostgreSQL async database driver |
| **`psycopg[binary]`** | `>=3.2, <4.0` | Modern PostgreSQL driver supporting sync and async connection pools |
| **`alembic`** | `>=1.13, <2.0` | Database migration and versioning tool for SQLAlchemy schemas |
| **`pydantic`** | `>=2.8, <3.0` | High-performance data validation and serialization based on Rust core |
| **`pydantic-settings`** | `>=2.4, <3.0` | Environment variable parsing and type-safe configuration loading |
| **`email-validator`** | `>=2.2, <3.0` | Robust email address validation and normalization |
| **`python-jose[cryptography]`**| `>=3.3, <4.0` | JOSE/JWT token creation, validation, and RSA/HMAC decryption |
| **`passlib[bcrypt]`** | `>=1.7, <2.0` | Secure password hashing framework |
| **`bcrypt`** | `>=4.0, <4.1` | Native C-level bcrypt encryption backend compatible with passlib |
| **`python-multipart`** | `>=0.0.9, <1.0`| Streaming parser for form-data and file uploads |
| **`redis`** | `>=5.0, <6.0` | Asynchronous client for Redis cache, rate limiting, and token revocation |
| **`httpx`** | `>=0.27, <1.0` | Full-featured async HTTP client for outbound API requests and Ollama calls |
| **`tenacity`** | `>=8.5, <9.0` | Retrying library for building resilient fallback loops around AI calls |
| **`celery`** | `>=5.4, <6.0` | Distributed asynchronous task queue for email dispatches and PDF tasks |
| **`aiofiles`** | `>=24.1, <25.0` | Asynchronous file I/O operations for disk storage |
| **`aiosmtplib`** | `>=3.0, <4.0` | Asynchronous SMTP client for dispatching email notifications |
| **`Jinja2`** | `>=3.1, <4.0` | HTML templating engine for transactional email generation |
| **`numpy`** | `>=1.26, <2.0` | Array operations, dot products, and vector arithmetic for RAG calculations |
| **`reportlab`** | `>=4.2, <5.0` | Programmatic PDF canvas builder creating official assessment reports |
| **`sentence-transformers`** | `>=3.0.0, <4.0` | PyTorch embedding generation from transformer models |
| **`transformers`** | `>=4.40, <5.0` | HuggingFace model hub integration for NLP summarization and classification |
| **`keybert`** | `>=0.8, <1.0` | Minimal keyword extraction leveraging transformer embeddings |
| **`nltk`** | `>=3.9, <4.0` | Tokenization, sentence splitting, and stop-word removal utilities |
| **`spacy`** | `>=3.7, <4.0` | Fast industrial-strength NLP, entity recognition, and POS tagging |
| **`faiss-cpu`** | `>=1.8, <2.0` | Efficient similarity search and clustering of dense vectors |
| **`beautifulsoup4`** | `>=4.12, <5.0`| HTML parsing and stripping for embedding course content |
| **`pytest` & `pytest-asyncio`** | `>=8.2` / `>=0.24` | Comprehensive test runner for async unit and integration tests |

---

## 5. Frontend & Node.js Libraries Reference

Defined in [package.json](file:///d:/xampp/htdocs/recruitmentinstitute-nextjs/package.json):

| Package Name | Version | Role & Description |
|---|---|---|
| **`next`** | `16.2.7` | Next.js full-stack framework with React Server Components (RSC) and Turbopack |
| **`react` & `react-dom`** | `19.2.4` | React 19 core library featuring enhanced transitions and server actions |
| **`@prisma/client` & `prisma`**| `^7.8.0` | Next-generation type-safe Node.js ORM for relational databases |
| **`@prisma/adapter-pg` & `pg`**| `^7.8.0` / `^8.21.0` | Native PostgreSQL connection pool adapter for Prisma |
| **`tailwindcss` & `@tailwindcss/postcss`** | `^4.0` | Tailwind CSS v4 engine for utility styling |
| **`recharts`** | `^3.9.0` | Composable charting library built on React components and SVG |
| **`lucide-react`** | `^1.17.0` | Modern SVG icons optimized for tree-shaking |
| **`react-markdown` & `remark-gfm`** | `^10.1.0` / `^4.0.1` | Markdown parser supporting GitHub Flavored Markdown (tables, checklists) |
| **`react-hook-form` & `@hookform/resolvers`** | `^7.77.0` / `^5.4.0` | Uncontrolled form validation engine |
| **`zod`** | `^4.4.3` | TypeScript-first schema declaration and validation |
| **`jsonwebtoken`** | `^9.0.3` | Sign and verify JWT authentication tokens on Next.js edge and server |
| **`bcryptjs`** | `^3.0.3` | Password hashing for student and candidate authentication |
| **`nodemailer`** | `^8.0.10` | Email sender for lead alerts and contact forms |
| **`sharp`** | `^0.34.5` | High-performance image processing engine for Next.js Image optimization |
| **`date-fns`** | `^4.4.0` | Modular JavaScript date utility library |
| **`react-hot-toast`** | `^2.6.0` | Lightweight notification toast alerts |
| **`googleapis`** | `^173.0.0` | Google Calendar & Meet integration SDK |
| **`clsx` & `tailwind-merge`** | `^2.1.1` / `^3.6.0` | Utility for merging Tailwind CSS class names without collisions |

---

## 6. Database Architecture & Schema Mapping

The database uses PostgreSQL with the `pgvector` extension enabled.

```mermaid
erDiagram
    users ||--o{ student_assessments : takes
    courses ||--o{ assessments : has
    courses ||--o{ course_content_embeddings : contains
    assessments ||--o{ question_bank_items : contains
    assessments ||--o{ assessment_questions : contains
    assessments ||--o{ student_assessments : attempts
    student_assessments ||--|| ai_assessment_analysis : produces
    student_assessments ||--o{ ai_generated_notes : generates
    student_assessments ||--|| student_study_plans : generates
    student_assessments ||--o| assessment_reports : creates

    courses {
        int id PK
        string title
        string description
        int course_category_id
        timestamp created_at
    }

    assessments {
        int id PK
        int course_id FK
        string assessment_name
        int total_marks
        int duration_minutes
        timestamp created_at
    }

    question_bank_items {
        int id PK
        int assessment_id FK
        string topic_name
        string question_text
        string option_a
        string option_b
        string option_c
        string option_d
        string correct_option
        string explanation
        int sort_order
    }

    student_assessments {
        int id PK
        int student_id FK
        int assessment_id FK
        float score
        float percentage
        string status
        timestamp started_at
        timestamp completed_at
    }

    ai_assessment_analysis {
        int id PK
        int student_id FK
        int assessment_id FK
        float score
        float percentage
        json strong_topics
        json weak_topics
        json analysis_json
        timestamp created_at
    }

    ai_generated_notes {
        int id PK
        int student_id FK
        int assessment_id FK
        string topic_name
        text notes_content
        timestamp created_at
    }

    student_study_plans {
        int id PK
        int student_id FK
        int assessment_id FK
        json plan_json
        timestamp created_at
    }

    assessment_reports {
        int student_assessment_id PK
        string status
        string file_path
        string celery_task_id
        timestamp created_at
    }

    course_content_embeddings {
        int id PK
        int course_id FK
        string content_type
        text chunk_text
        vector embedding
        json metadata_json
    }
```

---

## 7. System Workflows & Mermaid Diagrams

### 7.1 System-Wide Request & Proxy Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant NextProxy as Next.js Server (/api/assessment/*)
    participant FastAuth as FastAPI Auth Guard (deps.py)
    participant FastSvc as Assessment Service
    participant DB as PostgreSQL (SQLAlchemy)

    Student->>NextProxy: GET /api/assessment/course/19 (Cookie: ri_user_token)
    NextProxy->>NextProxy: Read HTTP-only cookie 'ri_user_token'
    NextProxy->>FastAuth: GET /api/v1/assessment/by-course/19 (Header: Bearer <token>)
    FastAuth->>FastAuth: Decode JWT & Extract Principal (user_id, role)
    FastAuth->>FastSvc: get_or_auto_generate_for_course(19)
    FastSvc->>DB: Query existing assessments & questions
    DB-->>FastSvc: Return Assessment entity
    FastSvc-->>NextProxy: 200 OK (ResponseEnvelope: { success: true, data: {...} })
    NextProxy-->>Student: 200 OK ({ success: true, data: {...} })
```

---

### 7.2 Student AI Assessment & Auto-Grading Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as TestTakingClient.tsx
    participant Proxy as Next.js Route Proxy
    participant Backend as FastAPI AssessmentService
    participant AI as ReliableAIProvider
    participant DB as PostgreSQL

    Student->>UI: Navigates to /profile/assessments/take/19
    UI->>Proxy: GET /api/assessment/course/19
    Proxy->>Backend: GET /api/v1/assessment/by-course/19
    Backend-->>UI: Assessment Info (id: 39, duration: 78m, total: 39 marks)
    UI->>Proxy: GET /api/assessment/39/start
    Proxy->>Backend: GET /api/v1/assessment/39/start
    Backend-->>UI: Array of 39 MCQs (Options A, B, C, D)
    
    Note over Student,UI: Student completes interactive timed quiz
    
    Student->>UI: Clicks "Submit Assessment"
    UI->>Proxy: POST /api/assessment/39/grade-and-submit (Answers Payload)
    Proxy->>Backend: POST /api/v1/assessment/39/grade-and-submit
    
    Backend->>Backend: Score answers & compute Topic Percentages
    Backend->>AI: analyze_performance(score, pct, topic_scores)
    AI-->>Backend: PerformanceAnalysis (Strong, Weak, Summary)
    Backend->>DB: Insert StudentAssessment & AIAssessmentAnalysis
    
    par Concurrent AI Generation
        Backend->>AI: generate_notes(weak_topic_1..N)
        Backend->>AI: generate_study_plan(weak_topics, strong_topics)
        Backend->>AI: generate_recommendations(pct)
    end
    
    AI-->>Backend: Generated Notes, 5-Day Plan JSON, Recommendations
    Backend->>DB: Insert Notes & Study Plan
    Backend-->>UI: 201 Created ({ student_assessment_id: 24 })
    UI->>Student: Redirects to /profile/assessments/24 (Executive Diagnostic View)
```

---

### 7.3 RAG Content Ingestion & Vector Retrieval

```mermaid
graph TD
    A[Course Lessons / Modules / Knowledge Base] --> B[Text Preprocessing & HTML Stripping]
    B --> C[Sentence Chunking - 500 tokens / 50 overlap]
    C --> D[HuggingFace Sentence-Transformers Model]
    D --> E[384-dimensional dense vector embeddings]
    E --> F[(PGVector in PostgreSQL: course_content_embeddings)]
    
    G[Assessment / Notes Generation Request] --> H[Query Text Embedding]
    H --> I[Cosine Similarity Search: embedding <=> query_vector]
    F --> I
    I --> J[Top-5 Semantic Context Chunks]
    J --> K[AI Prompt Injection & Synthesis]
```

---

### 7.4 PDF Report Generation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant Button as PDFDownloadButton.tsx
    participant Proxy as /api/assessment/[id]/report
    participant Backend as ReportService (FastAPI)
    participant PDF as ReportLab Canvas Engine
    participant Disk as Local File Storage

    Student->>Button: Clicks "Download PDF Report"
    Button->>Proxy: POST /api/assessment/24/report
    Proxy->>Backend: POST /api/v1/assessment/report/24/run-now
    Backend->>Backend: Fetch StudentAssessment, Analysis, Notes, Study Plan
    Backend->>PDF: Generate Assessment Report PDF
    PDF->>PDF: Draw Brand Headers, Score Wheel, Topic Breakdown Tables
    PDF->>Disk: Save to storage/reports/assessment_report_24.pdf
    Backend-->>Button: 200 OK ({ status: "ready" })
    Button->>Proxy: Open /api/assessment/24/report/download
    Proxy->>Backend: GET /api/v1/assessment/report/24/download
    Backend-->>Student: Stream application/pdf (assessment-report-24.pdf)
```

---

### 7.5 Trainer Session & Meeting Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor Trainer as Trainer
    participant Portal as /trainer/sessions
    participant API as /api/trainer/sessions
    participant Celery as Celery Task Queue
    participant GMeet as Google Calendar / Meet API
    participant DB as PostgreSQL

    Trainer->>Portal: Schedules new class (Date, Time, Batch)
    Portal->>API: POST /api/trainer/sessions (Title, StartTime, BatchId)
    API->>DB: Insert Session Record (status: SCHEDULED, meet_link: null)
    API->>Celery: Queue sync_calendar_event(session_id)
    Celery->>GMeet: Create Calendar Event + Conference Data (Google Meet)
    GMeet-->>Celery: Returns Event ID & Meet URL (https://meet.google.com/xyz)
    Celery->>DB: Update Session with meet_link
    DB-->>Portal: Live Meet Link appears for Trainer & Enrolled Students
```

---

## 8. Configuration & Environment Variables Specification

### 8.1 Next.js Environment Configuration (`.env`)

```env
# Database Connection (Prisma)
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_institute?schema=public"

# Authentication Secrets
JWT_SECRET="your-super-secret-jwt-token-key-change-in-production"
ADMIN_JWT_SECRET="your-super-secret-admin-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# FastAPI Microservice Integration
FASTAPI_SERVICE_URL="http://localhost:8000"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SMTP Email Configuration
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="smtp-username"
SMTP_PASS="smtp-password"
SMTP_FROM="support@recruitmentinstitute.in"

# Google Calendar Integration (Optional for Auto-Meet links)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GOOGLE_REFRESH_TOKEN="your-google-oauth-refresh-token"
```

### 8.2 FastAPI Microservice Configuration (`services/fastapi-backend/.env`)

```env
# Service Settings
ENVIRONMENT="development"
PROJECT_NAME="Recruitment Institute FastAPI Service"
API_V1_STR="/api/v1"

# Database Connection (SQLAlchemy Async)
DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/recruitment_institute"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-token-key-change-in-production"
JWT_ALGORITHM="HS256"

# Redis Cache & Celery Broker
REDIS_URL="redis://localhost:6379/0"
CELERY_BROKER_URL="redis://localhost:6379/1"
CELERY_RESULT_BACKEND="redis://localhost:6379/2"

# AI Provider Configuration
# Options: local_ai (Default, 100% offline), local_llm (Ollama), claude, openai, gemini, mock
AI_PROVIDER="local_ai"
AI_PROVIDER_FALLBACK_ORDER="local_ai,claude,openai,gemini"

# Optional Cloud AI API Keys (Only needed if using cloud providers)
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""
GEMINI_API_KEY=""
OLLAMA_BASE_URL="http://localhost:11434"

# RAG & Embedding Settings
EMBEDDING_MODEL_NAME="sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION=384

# Storage Paths
REPORTS_STORAGE_ROOT="./storage/reports"
```

---

## 9. API Route Surface Reference

### 9.1 Next.js API Routes (Server-Side Proxies & Domain Handlers)

| Method | Next.js API Route | Backend Target / Handler | Purpose |
|---|---|---|---|
| `GET` | `/api/assessment/course/[courseId]` | `GET /api/v1/assessment/by-course/{id}` | Fetch or auto-generate course assessment |
| `GET` | `/api/assessment/[id]/start` | `GET /api/v1/assessment/{id}/start` | Retrieve question bank for quiz delivery |
| `POST` | `/api/assessment/[id]/grade-and-submit` | `POST /api/v1/assessment/{id}/grade-and-submit` | Submit answers and trigger AI analysis |
| `POST` | `/api/assessment/[id]/report` | `POST /api/v1/assessment/report/{id}/run-now` | Generate PDF performance report |
| `GET` | `/api/assessment/[id]/report` | `GET /api/v1/assessment/report/{id}/status` | Check PDF generation status |
| `GET` | `/api/assessment/[id]/report/download` | `GET /api/v1/assessment/report/{id}/download` | Stream generated PDF file |
| `POST` | `/api/auth/login` | Next.js Auth Handler | Authenticate user & issue cookie |
| `GET` | `/api/auth/me` | Next.js Auth Handler | Current user session payload |
| `POST` | `/api/trainer/sessions` | `prisma.session` | Create scheduled trainer class |
| `GET` | `/api/student/enrollments` | `prisma.enrollment` | Student active batch enrollments |

### 9.2 FastAPI Microservice Endpoints (`/api/v1/*`)

| Method | FastAPI Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/assessment/by-course/{course_id}` | Student / Any | Get or auto-generate assessment for course |
| `GET` | `/api/v1/assessment/{id}/start` | Student | Return sanitized questions for test-taking |
| `POST` | `/api/v1/assessment/{id}/grade-and-submit` | Student | Evaluate answers, run AI diagnostics, store notes |
| `GET` | `/api/v1/assessment/my` | Student | List all assessment attempts for current student |
| `GET` | `/api/v1/assessment/result/{id}` | Student / Trainer / Admin | Get full score diagnostic and analysis object |
| `GET` | `/api/v1/assessment/notes/{id}` | Student / Trainer / Admin | Retrieve AI-generated revision notes |
| `GET` | `/api/v1/assessment/study-plan/{id}` | Student / Trainer / Admin | Retrieve 5-day personalized study plan |
| `GET` | `/api/v1/assessment/result/{id}/test` | Student / Trainer / Admin | View full question bank with answer rationales |
| `POST` | `/api/v1/assessment/report/{id}/run-now` | Student / Trainer / Admin | Trigger synchronous/async PDF generation |
| `GET` | `/api/v1/assessment/report/{id}/status` | Student / Trainer / Admin | Check PDF build readiness |
| `GET` | `/api/v1/assessment/report/{id}/download` | Student / Trainer / Admin | Download compiled PDF binary |
| `GET` | `/api/v1/trainer/analytics/{id}/batch-performance`| Trainer / Admin | Aggregated student batch analytics |
| `GET` | `/api/v1/trainer/analytics/{id}/weak-topics` | Trainer / Admin | Batch-wide weak competency breakdown |
| `GET` | `/api/v1/trainer/analytics/{id}/batches/{bid}/recommendations` | Trainer / Admin | AI curriculum interventions for trainer |

---

## 10. Local Development & Deployment Guide

### 10.1 Running Locally in Development

#### 1. Start the FastAPI Microservice
```bash
# Navigate to backend directory
cd services/fastapi-backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies (if not installed)
pip install -r requirements.txt

# Start FastAPI with live reload on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*FastAPI Interactive OpenAPI Docs will be live at `http://127.0.0.1:8000/docs`.*

#### 2. Start the Next.js Frontend
```bash
# In the project root directory
npm install

# Generate Prisma Client
npx prisma generate

# Start Next.js Development Server with Turbopack on port 3000
npm run dev
```
*Next.js Application will be live at `http://localhost:3000`.*

---

### 10.2 Production Container Deployment (Docker & Cloud Run)

The repository includes optimized multi-stage Dockerfiles:
- **Next.js Frontend Container**: [docker/Dockerfile.nextjs](file:///d:/xampp/htdocs/recruitmentinstitute-nextjs/docker/Dockerfile.nextjs) (Node.js 20 Alpine, standalone build output).
- **FastAPI Backend Container**: [docker/Dockerfile.fastapi](file:///d:/xampp/htdocs/recruitmentinstitute-nextjs/docker/Dockerfile.fastapi) (Python 3.11 Slim, pre-downloaded sentence-transformers).

```bash
# Build and run with Docker Compose
docker compose -f docker/docker-compose.yml up --build
```
