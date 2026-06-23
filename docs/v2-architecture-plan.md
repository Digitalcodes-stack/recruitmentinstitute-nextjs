# Recruitment Institute Platform V2 — ERP + LMS + Virtual Classroom + Placement

Architecture & sprint plan for extending the existing Next.js 16 / React 19 / Prisma / PostgreSQL
platform into a full training ERP. This document **extends** the current system — it does not
replace `(site)`, `(admin)`, auth, or the 25 existing models. New models reuse existing
`AdminUser`, `Student`, `Candidate` rather than introducing parallel user tables.

## How this reconciles with `Implementation Plan recruitment.pdf`

That PDF describes a standalone RTMS (separate React+FastAPI app) and is the agreed **V1
baseline**: manual Google Meet links pasted by a trainer, email-only reminders, no AI, free-tier
hosting. Its 15 modules map onto this plan as follows — nothing in V1 is rebuilt, it's absorbed:

| PDF V1 module | Lands in this plan as |
|---|---|
| users (roles ADMIN/TRAINER/CANDIDATE) | Reuse `AdminUser` (+role), add `Trainer`, reuse `Candidate`/`Student` (Phase 0) |
| candidates, trainers | Phase 0 (Trainer model), existing `Candidate`/`Student` |
| courses | Extend existing `Course`/`CourseCategory` with LMS structure (Phase 1) |
| batches | Phase 2 — Batch Management |
| candidate_enrollments | Phase 2 — `Enrollment` model |
| sessions + manual Meet link | Phase 2 — `Session.meetLink` is a plain string field on day one; Phase 4 swaps it for automated creation behind the same field, no schema change |
| notifications (email only) | Phase 2 reminder cron; WhatsApp/push are additive channels in Phase 13, not replacements |
| session_notes, materials | Phase 1 — `Lesson`/`Resource` models |
| attendance | Phase 2 — `Attendance` model |
| reports | Phase 2/15 — reuses existing `/admin/dashboard` chart pattern |

So the sequencing below treats **Phase 0–2 as the V1 MVP** (manual Meet links, email reminders,
no AI — buildable now, free-tier friendly), and Phases 4+ as explicitly optional automation/AI
layers added later behind the same data model.

---

## 1. Guiding Constraints (from stakeholder decisions)

1. **No new runtime.** Everything stays inside the existing Next.js app — new Prisma models,
   new `app/api/**/route.ts` handlers or Server Actions, new `(admin)`/`(site)` route groups.
   No FastAPI, no separate microservices, no RabbitMQ.
2. **Background work uses what the platform already has room for** — Vercel Cron / a single
   Node cron entrypoint for reminders and certificate checks. Heavier async jobs (transcription,
   AI notes) are queued in-database (a `JobQueue` table polled by a cron-triggered worker route)
   rather than introducing Redis/Celery. This is a deliberate simplification versus the original
   FastAPI/Celery/RabbitMQ ask — revisit only if job volume actually outgrows polling.
3. **All third-party integrations (OpenAI/Whisper, Google Calendar/Meet, WhatsApp Business,
   Razorpay/Stripe) are pluggable adapters.** No credentials exist yet. Every integration point
   is an interface with a `lib/integrations/<name>/` implementation and a no-op/manual fallback,
   so the rest of the system works without them (this is exactly the PDF's V1 posture).
4. **Extend, don't duplicate.** `AdminUser`, `Student`, `Candidate`, `Course`, `CourseCategory`
   already exist — new modules reference them via foreign keys, never re-model them.

---

## 2. New Domain Model (additions to `prisma/schema.prisma`)

Naming follows existing convention: PascalCase models, `@map` to snake_case tables, `@@map` for
table names, Decimal for money, soft `isActive`/`status` flags where the codebase already uses
them.

### Phase 1 — LMS structure

```prisma
model Module {
  id          Int      @id @default(autoincrement())
  courseId    Int      @map("course_id")
  title       String
  description String?
  sortOrder   Int      @default(0) @map("sort_order")
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  chapters    Chapter[]

  @@map("lms_modules")
}

model Chapter {
  id        Int      @id @default(autoincrement())
  moduleId  Int      @map("module_id")
  title     String
  sortOrder Int      @default(0) @map("sort_order")
  module    Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  topics    Topic[]

  @@map("lms_chapters")
}

model Topic {
  id        Int      @id @default(autoincrement())
  chapterId Int      @map("chapter_id")
  title     String
  sortOrder Int      @default(0) @map("sort_order")
  chapter   Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  lessons   Lesson[]

  @@map("lms_topics")
}

model Lesson {
  id          Int        @id @default(autoincrement())
  topicId     Int        @map("topic_id")
  title       String
  type        LessonType @default(VIDEO)
  videoUrl    String?    @map("video_url")
  durationSec Int?       @map("duration_sec")
  bodyHtml    String?    @map("body_html")
  sortOrder   Int        @default(0) @map("sort_order")
  isPreview   Boolean    @default(false) @map("is_preview")
  topic       Topic      @relation(fields: [topicId], references: [id], onDelete: Cascade)
  resources   Resource[]
  progress    LessonProgress[]

  @@map("lms_lessons")
}

model Resource {
  id       Int          @id @default(autoincrement())
  lessonId Int?         @map("lesson_id")
  sessionId Int?        @map("session_id")
  title    String
  fileUrl  String       @map("file_url")
  fileType ResourceType @default(PDF)
  lesson   Lesson?      @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  session  Session?     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  createdAt DateTime    @default(now()) @map("created_at")

  @@map("lms_resources")
}

model LessonProgress {
  id          Int       @id @default(autoincrement())
  studentId   Int       @map("student_id")
  lessonId    Int       @map("lesson_id")
  isCompleted Boolean   @default(false) @map("is_completed")
  completedAt DateTime? @map("completed_at")
  student     Student   @relation(fields: [studentId], references: [id])
  lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([studentId, lessonId])
  @@map("lms_lesson_progress")
}

enum LessonType {
  VIDEO
  PDF
  PPT
  ASSIGNMENT
  QUIZ
  DOWNLOAD
}

enum ResourceType {
  PDF
  PPT
  DOC
  ZIP
  VIDEO
  OTHER
}
```

### Phase 0 / 2 / 3 — Trainer, Batch, Enrollment, Session, Attendance

```prisma
model Trainer {
  id             Int       @id @default(autoincrement())
  name           String
  email          String    @unique
  password       String
  phone          String?
  specialization String?
  bio            String?
  image          String?
  isActive       Boolean   @default(true) @map("status")
  createdAt      DateTime  @default(now()) @map("created_at")
  batches        Batch[]
  sessions       Session[]

  @@map("trainers")
}

model Batch {
  id         Int           @id @default(autoincrement())
  name       String
  courseId   Int           @map("course_id")
  trainerId  Int           @map("trainer_id")
  capacity   Int           @default(30)
  mode       BatchMode     @default(ONLINE)
  startDate  DateTime      @map("start_date") @db.Date
  endDate    DateTime?     @map("end_date") @db.Date
  schedule   String?
  status     BatchStatus   @default(UPCOMING)
  course     Course        @relation(fields: [courseId], references: [id])
  trainer    Trainer       @relation(fields: [trainerId], references: [id])
  enrollments Enrollment[]
  sessions   Session[]

  @@map("batches")
}

model Enrollment {
  id             Int              @id @default(autoincrement())
  studentId      Int              @map("student_id")
  batchId        Int              @map("batch_id")
  enrolledAt     DateTime         @default(now()) @map("enrolled_at")
  status         EnrollmentStatus @default(ENROLLED)
  student        Student          @relation(fields: [studentId], references: [id])
  batch          Batch            @relation(fields: [batchId], references: [id])
  attendance     Attendance[]
  certificate    Certificate?

  @@unique([studentId, batchId])
  @@map("enrollments")
}

model Session {
  id          Int           @id @default(autoincrement())
  batchId     Int           @map("batch_id")
  trainerId   Int           @map("trainer_id")
  title       String
  description String?
  sessionDate DateTime      @map("session_date") @db.Date
  startTime   DateTime      @map("start_time")
  endTime     DateTime      @map("end_time")
  meetLink    String?       @map("meet_link")
  calendarEventId String?   @map("calendar_event_id")
  recordingUrl String?      @map("recording_url")
  status      SessionStatus @default(UPCOMING)
  batch       Batch         @relation(fields: [batchId], references: [id])
  trainer     Trainer       @relation(fields: [trainerId], references: [id])
  resources   Resource[]
  attendance  Attendance[]
  transcript  Transcript?
  aiNotes     AiSessionNote?
  assignments Assignment[]

  @@map("sessions")
}

model Attendance {
  id            Int        @id @default(autoincrement())
  enrollmentId  Int        @map("enrollment_id")
  sessionId     Int        @map("session_id")
  joinedAt      DateTime?  @map("joined_at")
  leftAt        DateTime?  @map("left_at")
  present       Boolean    @default(false)
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id])
  session       Session    @relation(fields: [sessionId], references: [id])

  @@unique([enrollmentId, sessionId])
  @@map("attendance")
}

enum BatchMode {
  ONLINE
  OFFLINE
  HYBRID
}

enum BatchStatus {
  UPCOMING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum EnrollmentStatus {
  ENROLLED
  COMPLETED
  DROPPED
}

enum SessionStatus {
  UPCOMING
  LIVE
  COMPLETED
  CANCELLED
}
```

### Phase 5 — Virtual classroom intelligence

```prisma
model Transcript {
  id        Int      @id @default(autoincrement())
  sessionId Int      @unique @map("session_id")
  rawText   String   @db.Text
  provider  String
  createdAt DateTime @default(now()) @map("created_at")
  session   Session  @relation(fields: [sessionId], references: [id])

  @@map("transcripts")
}

model AiSessionNote {
  id              Int      @id @default(autoincrement())
  sessionId       Int      @unique @map("session_id")
  summary         String   @db.Text
  keyPoints       Json     @map("key_points")
  questionsAsked  Json     @map("questions_asked")
  actionItems     Json     @map("action_items")
  importantLinks  Json     @map("important_links")
  createdAt       DateTime @default(now()) @map("created_at")
  session         Session  @relation(fields: [sessionId], references: [id])

  @@map("ai_session_notes")
}
```

### Phase 6/7 — Assignments & assessments

```prisma
model Assignment {
  id          Int                  @id @default(autoincrement())
  sessionId   Int?                 @map("session_id")
  batchId     Int                  @map("batch_id")
  title       String
  description String?
  fileUrl     String?              @map("file_url")
  dueAt       DateTime             @map("due_at")
  createdAt   DateTime             @default(now()) @map("created_at")
  session     Session?             @relation(fields: [sessionId], references: [id])
  submissions AssignmentSubmission[]

  @@map("assignments")
}

model AssignmentSubmission {
  id            Int        @id @default(autoincrement())
  assignmentId  Int        @map("assignment_id")
  studentId     Int        @map("student_id")
  fileUrl       String     @map("file_url")
  submittedAt   DateTime   @default(now()) @map("submitted_at")
  aiScore       Decimal?   @map("ai_score") @db.Decimal(5, 2)
  aiFeedback    String?    @map("ai_feedback") @db.Text
  trainerScore  Decimal?   @map("trainer_score") @db.Decimal(5, 2)
  trainerNote   String?    @map("trainer_note")
  assignment    Assignment @relation(fields: [assignmentId], references: [id])
  student       Student    @relation(fields: [studentId], references: [id])

  @@unique([assignmentId, studentId])
  @@map("assignment_submissions")
}

model Assessment {
  id          Int              @id @default(autoincrement())
  batchId     Int              @map("batch_id")
  title       String
  type        AssessmentType
  durationMin Int              @map("duration_min")
  totalMarks  Int              @map("total_marks")
  questions   AssessmentQuestion[]
  attempts    AssessmentAttempt[]

  @@map("assessments")
}

model AssessmentQuestion {
  id            Int            @id @default(autoincrement())
  assessmentId  Int            @map("assessment_id")
  type          QuestionType
  prompt        String         @db.Text
  options       Json?
  correctAnswer String?        @map("correct_answer")
  marks         Int            @default(1)
  assessment    Assessment     @relation(fields: [assessmentId], references: [id])

  @@map("assessment_questions")
}

model AssessmentAttempt {
  id           Int        @id @default(autoincrement())
  assessmentId Int        @map("assessment_id")
  studentId    Int        @map("student_id")
  score        Decimal?   @db.Decimal(5, 2)
  passed       Boolean?
  answers      Json
  startedAt    DateTime   @map("started_at")
  submittedAt  DateTime?  @map("submitted_at")
  assessment   Assessment @relation(fields: [assessmentId], references: [id])
  student      Student    @relation(fields: [studentId], references: [id])

  @@map("assessment_attempts")
}

enum AssessmentType {
  MCQ
  DESCRIPTIVE
  CODING
  APTITUDE
  TECHNICAL
}

enum QuestionType {
  MCQ
  DESCRIPTIVE
  CODE
}
```

### Phase 8 — Placement / ATS

```prisma
model PlacementProfile {
  id              Int      @id @default(autoincrement())
  studentId       Int      @unique @map("student_id")
  resumeUrl       String?  @map("resume_url")
  skills          Json?
  projects        Json?
  readinessScore  Decimal? @map("readiness_score") @db.Decimal(5, 2)
  isOpenToWork    Boolean  @default(true) @map("is_open_to_work")
  student         Student  @relation(fields: [studentId], references: [id])
  applications    JobApplication[]

  @@map("placement_profiles")
}

model Company {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  website   String?
  logo      String?
  isVerified Boolean @default(false) @map("is_verified")
  createdAt DateTime @default(now()) @map("created_at")
  jobs      Job[]

  @@map("companies")
}

model Job {
  id          Int       @id @default(autoincrement())
  companyId   Int       @map("company_id")
  title       String
  description String    @db.Text
  skills      Json?
  location    String?
  salaryMin   Decimal?  @map("salary_min") @db.Decimal(10, 2)
  salaryMax   Decimal?  @map("salary_max") @db.Decimal(10, 2)
  isActive    Boolean   @default(true) @map("status")
  createdAt   DateTime  @default(now()) @map("created_at")
  company     Company   @relation(fields: [companyId], references: [id])
  applications JobApplication[]

  @@map("jobs")
}

model JobApplication {
  id          Int               @id @default(autoincrement())
  jobId       Int               @map("job_id")
  profileId   Int               @map("profile_id")
  stage       PipelineStage     @default(APPLIED)
  appliedAt   DateTime          @default(now()) @map("applied_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  job         Job               @relation(fields: [jobId], references: [id])
  profile     PlacementProfile  @relation(fields: [profileId], references: [id])
  interviews  Interview[]

  @@unique([jobId, profileId])
  @@map("job_applications")
}

model Interview {
  id            Int              @id @default(autoincrement())
  applicationId Int              @map("application_id")
  scheduledAt   DateTime         @map("scheduled_at")
  meetLink      String?          @map("meet_link")
  feedback      String?          @db.Text
  result        InterviewResult? 
  application   JobApplication   @relation(fields: [applicationId], references: [id])

  @@map("interviews")
}

enum PipelineStage {
  APPLIED
  SCREENING
  SHORTLISTED
  INTERVIEW
  FINAL_ROUND
  SELECTED
  JOINED
  REJECTED
}

enum InterviewResult {
  PASS
  FAIL
  PENDING
}
```

### Phase 10 — AI mock interviews

```prisma
model MockInterview {
  id          Int               @id @default(autoincrement())
  studentId   Int               @map("student_id")
  type        MockInterviewType
  transcript  Json
  score       Decimal?          @db.Decimal(5, 2)
  analysis    String?           @db.Text
  weakAreas   Json?             @map("weak_areas")
  createdAt   DateTime          @default(now()) @map("created_at")
  student     Student           @relation(fields: [studentId], references: [id])

  @@map("mock_interviews")
}

enum MockInterviewType {
  HR
  TECHNICAL
  RECRUITMENT
}
```

### Phase 12 — Certificates

```prisma
model Certificate {
  id           Int        @id @default(autoincrement())
  enrollmentId Int        @unique @map("enrollment_id")
  certNumber   String     @unique @map("cert_number")
  pdfUrl       String     @map("pdf_url")
  qrCode       String     @map("qr_code")
  issuedAt     DateTime   @default(now()) @map("issued_at")
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])

  @@map("certificates")
}
```

### Phase 13/14 — Communication & finance

```prisma
model NotificationLog {
  id        Int                @id @default(autoincrement())
  userType  String              @map("user_type")
  userId    Int                 @map("user_id")
  channel   NotificationChannel
  template  String
  payload   Json
  status    String              @default("queued")
  sentAt    DateTime?           @map("sent_at")
  createdAt DateTime            @default(now()) @map("created_at")

  @@map("notification_logs")
}

model Payment {
  id            Int           @id @default(autoincrement())
  studentId     Int           @map("student_id")
  enrollmentId  Int?          @map("enrollment_id")
  amount        Decimal       @db.Decimal(10, 2)
  installmentNo Int?          @map("installment_no")
  gateway       String
  gatewayRef    String?       @map("gateway_ref")
  status        PaymentStatus @default(PENDING)
  invoiceUrl    String?       @map("invoice_url")
  createdAt     DateTime      @default(now()) @map("created_at")
  student       Student       @relation(fields: [studentId], references: [id])

  @@map("payments")
}

enum NotificationChannel {
  EMAIL
  WHATSAPP
  SMS
  PUSH
  IN_APP
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### Job queue (replaces Celery/RabbitMQ)

```prisma
model JobQueue {
  id          Int       @id @default(autoincrement())
  type        String
  payload     Json
  status      String    @default("pending")
  attempts    Int       @default(0)
  error       String?
  runAfter    DateTime  @default(now()) @map("run_after")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("job_queue")
}
```

`Student` and `Course` gain back-relations (`enrollments Enrollment[]`, `lessonProgress
LessonProgress[]`, etc.) added to the existing models — additive only, no breaking changes.

---

## 3. ER Diagram (new modules only)

```
AdminUser ──< AuditLog (existing, unchanged)

Course ──< Module ──< Chapter ──< Topic ──< Lesson ──< Resource
                                              │
                                              └──< LessonProgress >── Student

Trainer ──< Batch >── Course
Batch ──< Enrollment >── Student
Batch ──< Session ──< Resource
Session ──< Attendance >── Enrollment
Session ──1── Transcript
Session ──1── AiSessionNote
Session ──< Assignment ──< AssignmentSubmission >── Student
Batch ──< Assessment ──< AssessmentQuestion
Assessment ──< AssessmentAttempt >── Student

Student ──1── PlacementProfile ──< JobApplication >── Job >── Company
JobApplication ──< Interview

Student ──< MockInterview
Enrollment ──1── Certificate

Student ──< Payment
(*) ──< NotificationLog
(*) ──< JobQueue
```

Full Mermaid version goes in `docs/er-diagram.md` as a second `## V2 Additions` section,
following the existing file's format — not duplicated here.

---

## 4. API Architecture

All new endpoints follow the existing `app/api/**/route.ts` + Zod validation + JWT session
convention (see `lib/validations.ts`, `lib/auth.ts`). No new auth system — `Trainer` and
`Company` get their own session `type` values (`'trainer'`, `'company'`) in the same
`AuthSession` union, reusing `signToken`/`verifyToken`/cookie helpers.

| Area | Routes |
|---|---|
| LMS | `GET/POST /api/admin/modules`, `.../chapters`, `.../topics`, `.../lessons`; `GET /api/lms/courses/[id]/tree`; `POST /api/lms/progress` |
| Batches | `GET/POST /api/admin/batches`, `PUT/DELETE /api/admin/batches/[id]`; `POST /api/admin/batches/[id]/allocate` (auto-allocation rule engine) |
| Trainer portal | `POST /api/auth/trainer/login`; `GET /api/trainer/dashboard`, `/api/trainer/sessions`, `/api/trainer/students` |
| Sessions | `GET/POST /api/admin/sessions`; `POST /api/admin/sessions/[id]/schedule` (triggers Meet adapter); `POST /api/sessions/[id]/join` (records attendance) |
| Reminders | Internal: cron-triggered `POST /api/internal/cron/reminders` (Vercel Cron, secret-header gated) |
| Virtual classroom AI | `POST /api/internal/jobs/transcribe`, `POST /api/internal/jobs/generate-notes` (both pop `JobQueue`) |
| Assignments | `GET/POST /api/trainer/assignments`; `POST /api/student/assignments/[id]/submit`; `POST /api/internal/jobs/review-assignment` |
| Assessments | `GET/POST /api/admin/assessments`; `POST /api/student/assessments/[id]/start`, `/submit`; `GET /api/admin/assessments/[id]/leaderboard` |
| Placement | `POST /api/company/register`, `/jobs`; `GET /api/jobs`, `POST /api/jobs/[id]/apply`; `PUT /api/admin/applications/[id]/stage` |
| Resume builder | `POST /api/student/resume/generate` (AI adapter → PDF via existing `sharp`/a PDF lib) |
| Mock interview | `POST /api/student/mock-interview/start`, `/api/student/mock-interview/[id]/answer` |
| Knowledge AI assistant | `POST /api/student/assistant/ask` (RAG over `Lesson`, `AiSessionNote`, `Assignment` content) |
| Certificates | `POST /api/internal/jobs/issue-certificate` (cron, checks attendance/assignment/assessment rules); `GET /verify/[certNumber]` public page |
| Communication | `POST /api/internal/notify` (fan-out to channel adapters), logged to `NotificationLog` |
| Finance | `POST /api/student/payments/checkout`, `POST /api/webhooks/razorpay`, `/api/webhooks/stripe` |
| Analytics | `GET /api/admin/analytics/revenue|placements|engagement`; `GET /api/trainer/analytics`; `GET /api/student/analytics` |

---

## 5. Integration Adapter Pattern (pluggable, no credentials yet)

```
lib/integrations/
  calendar/
    types.ts         // CalendarProvider interface: createEvent(), createMeetLink()
    google.ts        // real Google Calendar/Meet implementation (TBD creds)
    manual.ts         // V1 fallback: admin pastes a link, satisfies same interface
    index.ts          // picks provider via env var INTEGRATION_CALENDAR=manual|google
  ai/
    types.ts          // AiProvider interface: transcribe(), summarize(), score(), chat()
    openai.ts
    noop.ts            // returns "pending integration" placeholders
  messaging/
    types.ts           // Notifier interface: send(channel, to, template, payload)
    email.ts            // wraps existing lib/email.ts — already real
    whatsapp.ts          // TBD creds
    sms.ts                // TBD creds
  payments/
    types.ts             // PaymentGateway interface: createOrder(), verifyWebhook()
    razorpay.ts
    stripe.ts
```

Every feature in Phases 4–14 is written against the interface, not the vendor SDK. Selecting
`manual`/`noop` providers via env var means the whole platform — including session scheduling,
reminders, and even "AI notes" (manually entered by trainer as a fallback) — works today with
zero paid accounts, matching the PDF's V1 constraint. Flipping a single env var turns on real
automation once credentials exist.

---

## 6. Background Job Architecture (in-platform, no Redis/Celery)

- `JobQueue` table holds work items (`type`: `transcribe`, `generate_notes`,
  `review_assignment`, `send_reminder`, `issue_certificate`, `sync_calendar`).
- A single Vercel Cron hits `POST /api/internal/cron/tick` every 1–5 minutes; it claims a batch
  of `pending` rows (`UPDATE ... SET status='processing' WHERE id IN (...) RETURNING *`,
  transactional claim to avoid double-processing), executes the matching adapter, writes
  `completed`/`failed` + `error`.
- Reminder jobs (24h/1h/15min before a `Session`) are enqueued when a `Session` is created/
  rescheduled, not computed by a separate scheduler — keeps logic co-located with session CRUD.
- If job volume ever exceeds what polling can handle (rough rule of thumb: hundreds, not
  thousands, of jobs/minute), revisit a real queue — not before.

---

## 7. Folder Structure (additions only)

```
src/app/
  (site)/
    jobs/                      # public job board
      page.tsx
      [id]/page.tsx
    verify/[certNumber]/page.tsx   # public certificate verification
  (student)/                   # new route group, parallel to (admin)
    student/
      dashboard/page.tsx        # progress, upcoming classes, attendance, certificates
      courses/[id]/page.tsx     # LMS player
      assignments/page.tsx
      assessments/[id]/page.tsx
      notes/page.tsx            # AI notes center, searchable
      resume/page.tsx           # AI resume builder
      mock-interview/page.tsx
      placement/page.tsx
  (trainer)/
    trainer/
      dashboard/page.tsx
      sessions/page.tsx
      assignments/page.tsx
  (company)/
    company/
      dashboard/page.tsx
      jobs/page.tsx
      candidates/page.tsx
  (admin)/admin/
    batches/
    trainers/
    sessions/
    assignments/
    assessments/
    placements/
    companies/
    payments/
    certificates/
  api/
    admin/{batches,sessions,assignments,assessments,...}/route.ts
    trainer/...
    student/...
    company/...
    internal/cron/tick/route.ts
    internal/jobs/*/route.ts
    webhooks/{razorpay,stripe}/route.ts

lib/
  integrations/{calendar,ai,messaging,payments}/...
  jobs/                       # job handlers invoked by internal/cron/tick
    transcribe.ts
    generateNotes.ts
    reviewAssignment.ts
    issueCertificate.ts
    sendReminder.ts
```

---

## 8. Sprint Plan (phase-wise, sequenced on dependencies)

| Sprint | Phase(s) | Scope | Depends on |
|---|---|---|---|
| 1 | 0 | `Trainer` model + auth, admin Trainer CRUD | — |
| 2 | 2 (core) | Batch, Enrollment, Session (manual `meetLink` field), Attendance — **this is the PDF's V1 MVP** | Sprint 1 |
| 3 | 2 (reminders) | `JobQueue` + cron tick + email reminders (24h/1h/15min) | Sprint 2 |
| 4 | 1 | Module→Chapter→Topic→Lesson→Resource, student LMS player, progress tracking | Sprint 1 (Course exists already) |
| 5 | 2 (dashboards) | Student dashboard upgrade (progress/attendance/upcoming), Trainer dashboard | Sprints 2–4 |
| 6 | 6 | Assignment CRUD + submission (no AI review yet — manual trainer scoring) | Sprint 4 |
| 7 | 7 | Assessment engine (MCQ/descriptive/coding/aptitude), leaderboard | Sprint 1 |
| 8 | 12 | Certificate rules engine + PDF + QR (no AI) | Sprints 3, 6, 7 |
| 9 | 4 | Calendar adapter interface + Google Calendar/Meet real implementation (creds permitting) | Sprint 2 |
| 10 | 5 | Recording capture, transcript adapter, AI notes generator, student notes center | Sprint 9 (needs real session recordings) |
| 11 | 6 (AI) | AI assignment review layered onto Sprint 6 | Sprint 10 (reuses AI adapter) |
| 12 | 8 | Placement profiles, Company portal, Job board, pipeline stages | Sprint 4 (skills/scores feed readiness) |
| 13 | 9 | AI resume builder | Sprint 12 |
| 14 | 10 | AI mock interview | Sprint 10 (AI adapter), 12 |
| 15 | 11 | Knowledge AI assistant (RAG over lessons/notes/assignments) | Sprints 4, 10 |
| 16 | 13 | WhatsApp/SMS/push adapters, notification center, in-app notifications | Sprint 3 (pattern exists) |
| 17 | 14 | Razorpay/Stripe, installments, GST invoices, refunds | — (parallelizable any time after Sprint 1) |
| 18 | 15 | Advanced analytics dashboards (admin/trainer/student) | All prior — aggregates everything |

Sprints 1–8 are the buildable-now, no-paid-API core (matches PDF V1 + LMS). Sprints 9+ require
the integration decisions from §1.3 to actually activate, but the code ships behind adapters
regardless.

---

## 9. Cost Estimation (rough, India-market freelance/small-team rates)

| Sprint group | Effort (dev-weeks) | Notes |
|---|---|---|
| 1–8 (V1 MVP + LMS + assignments/assessments/certs) | 14–18 | Core CRUD-heavy, matches PDF V1 scope plus LMS |
| 9–11 (Meet automation + AI notes/transcription) | 8–10 | Gated on Google Cloud + OpenAI account setup; transcription cost ~$0.006/min audio (Whisper API) at scale |
| 12–14 (Placement + resume + mock interview) | 8–10 | AI cost per resume/interview is per-token, negligible at pilot scale |
| 15 (Knowledge assistant) | 4–5 | Needs embeddings; pgvector extension on existing Postgres avoids a separate vector DB |
| 16–17 (Communication + Finance) | 6–8 | WhatsApp Business API has approval lead time (1–3 weeks) — start early if committed |
| 18 (Analytics) | 3–4 | Mostly aggregation queries + chart components, reuses existing admin chart pattern |
| **Total** | **43–55 dev-weeks** | Single full-stack dev: ~10–13 months. Two devs in parallel (one on core, one on AI/integrations from Sprint 9 onward): ~6–7 months. |

Recurring costs once live (rough, monthly, at small scale — a few hundred active students):
OpenAI usage $20–100, Google Workspace (if needed for Calendar API quota) ~$0–12/user,
WhatsApp Business API ~$0.01–0.05/message via a BSP, Razorpay/Stripe standard transaction fees
(~2%), hosting unchanged (existing Vercel/Postgres).

---

## 10. AWS Deployment Architecture (if/when moving off current hosting)

The app currently builds `output: 'standalone'` — this maps cleanly to containerized AWS
deployment without code changes:

```
Route53 → CloudFront → ALB → ECS Fargate (Next.js standalone, 2+ tasks, autoscale on CPU/RPS)
                                   │
                                   ├─→ RDS PostgreSQL (Multi-AZ, pgvector enabled for Phase 11)
                                   ├─→ S3 (uploads/, recordings/, certificates/, resumes/)
                                   │     + CloudFront distribution for public asset delivery
                                   ├─→ EventBridge Scheduler → Lambda or ECS scheduled task
                                   │     (replaces Vercel Cron for /api/internal/cron/tick)
                                   ├─→ SES (transactional email, replaces/extends Nodemailer SMTP)
                                   └─→ Secrets Manager (JWT_SECRET, OPENAI_API_KEY, gateway keys)
```

- **Why ECS Fargate over Lambda for the app itself**: Next.js standalone server has persistent
  connections (Prisma pool) that don't fit Lambda's cold-start model well at this traffic level.
- **File storage**: move `public/uploads/` to S3 behind CloudFront; update `next.config.ts`
  `images.remotePatterns` to the CloudFront domain — the existing image-optimization config
  already anticipates a remote pattern, so this is a config change, not a rewrite.
  recordings/transcripts (Phase 5) are large — S3 lifecycle rules to Glacier after N months.
- **pgvector** on RDS Postgres avoids introducing a separate vector database for Phase 11.
- **Background jobs**: same `JobQueue` polling pattern, just triggered by EventBridge instead of
  Vercel Cron — no architectural change, only the trigger mechanism.

## 11. Production Scaling Strategy

1. **Read-heavy public pages** (courses, blog, job board) — already server-rendered; add
   `revalidate` / ISR where not already present, CloudFront/Vercel edge cache in front.
2. **Database**: current 25 tables + ~35 new ones is still well within single-Postgres-instance
   territory. Add indexes on every new FK (`batchId`, `studentId`, `sessionId`, etc.) and on
   `JobQueue.status` + `runAfter` (the polling hot path). Read replica only once admin
   analytics queries start contending with live traffic — not needed at launch.
3. **JobQueue → real queue migration trigger**: when polling latency or claim contention becomes
   measurable (job volume in the thousands/minute), swap the polling implementation for SQS
   behind the same `lib/jobs/*` handler functions — handlers don't change, only the
   enqueue/dequeue plumbing.
4. **AI cost control**: cache transcript→notes results keyed by `sessionId` (already modeled via
   `@unique` on `Transcript.sessionId` / `AiSessionNote.sessionId`), never re-run on repeat views.
5. **Video**: do not self-host video infra. Google Meet handles the live call; for recordings,
   store the Meet-provided recording link/Drive export rather than re-encoding — only ingest for
   transcription, not for serving playback at scale.
6. **Horizontal scaling**: stateless Next.js app behind ALB/CloudFront scales by adding tasks;
   the only shared state is Postgres and S3, both already designed for concurrent access.

---

## 12. What's explicitly deferred / not designed yet

Per the PDF's own "Future Scope" list and this session's stated priorities, the following have
adapter interfaces reserved but no implementation in the sprint plan above: mobile app, live
in-call attendance tracking via Meet API (V1 uses join-click timestamps, per PDF Module 14),
multi-tenant support (if ever white-labeling the platform for other institutes). Flag these
explicitly if priorities shift before Sprint 12.
