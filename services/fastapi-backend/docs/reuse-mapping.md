# Reuse Mapping — Existing vs. New (Placement / Resume / Interview Prep / AI-readiness)

Companion to `migration-impact-report.md`. Scope: what already exists and must be reused as-is, versus what is genuinely new for the FastAPI-owned modules (Placement, Resume Builder, Interview Prep, Internal Communication extension, AI-readiness scaffolding).

## Existing Tables → Reuse (read-only from FastAPI, owned by Prisma)

| Prisma model | Table | Reused for |
|---|---|---|
| Student | `login_student` | Identity resolution from JWT claims; placement/resume/interview ownership |
| Trainer | `trainers` | Interview panel/mock-interview trainer assignment (if applicable) |
| AdminUser | `user_admin` | Admin actions on Employer/JobPosting/Application records |
| Candidate | `candidate_login` | Out of scope for placement (placement targets enrolled Students, not pre-enrollment Candidates) — confirm in Sprint 1 if Candidates should also access placement |
| Enrollment / Batch / Course | `enrollments` / `batches` / `courses` | Context on student dashboards ("completed X course") shown alongside placement/resume panels |
| Attendance / LessonProgress | `attendance` / `lms_lesson_progress` | Optional context signal for placement readiness (future) |
| NotificationTemplate / Notification / NotificationRecipient / NotificationSubscription | `notification_templates` / `notifications` / `notification_recipients` / `notification_subscriptions` | All placement/interview notifications dispatch through this system (see §7 of the architecture plan), not a new FastAPI notification table |
| Question / Answer | `questions` / `answers` | Sprint 5 — extend with a category/tag for placement-related Q&A instead of building 1:1 messaging |
| JobQueue | `job_queue` | Pattern reference only — FastAPI's Celery remains its own scheduler; JobQueue is not written to directly by FastAPI |

## Existing APIs → Reuse

| Existing route | Reused how |
|---|---|
| `lib/auth.ts` (`getUserSession`, `signToken`, `verifyToken`, `AuthSession` type) | FastAPI verifies the same JWT (shared `JWT_SECRET`) — no new auth system |
| `POST /api/internal/cron/tick` (pattern, not the route itself) | Template for the new `POST /api/internal/notifications/enqueue` route — same shared-secret-header convention |
| `/api/student/*`, `/api/trainer/*` route conventions | Pattern for how Next.js pages will proxy/call FastAPI server-side (fetch with forwarded Bearer token) |

## Existing UI Screens → Reuse (pattern, not code)

| Existing screen | Reused pattern for |
|---|---|
| `components/admin/AdminLayout.tsx` + `src/app/(admin)/admin/enrollments` | Shell + stat-card-row + table pattern for new `PlacementBoard`, `EmployerManager`, `JobPostingForm` admin screens |
| `components/trainer/TrainerLayout.tsx` + `src/app/(trainer)/trainer/dashboard` | Shell + stat-card pattern for `InterviewScheduleWidget` |
| `src/app/(site)/profile/page.tsx` + `components/site/StudentTrainingPanel.tsx` + `components/site/AssignmentsPanel.tsx` | Visual/structural template for `PlacementPanel`, `ResumeBuilderPanel`, `InterviewPrepPanel` (white cards, status badges, blue-slate palette — exact colors documented in architecture plan §10) |

## New Tables Required (FastAPI-owned, Alembic-managed — see architecture plan §3 for full column lists)

- `employers`, `job_postings`, `placement_applications`, `placement_application_events`
- `resume_profiles`, `resume_versions`, `resume_education`, `resume_experience`, `resume_skills`, `resume_projects`
- `interview_question_bank`, `mock_interview_sessions`, `mock_interview_responses`
- `ai_embeddings` (placeholder only, Sprint 6)

## New APIs Required (FastAPI, `/api/v1` prefix — see architecture plan §6 for full route list)

- `/employers`, `/job-postings`, `/applications` (+ `/applications/{id}/stage`)
- `/resume-profiles/me` (+ versions/education/experience/skills/projects sub-routes)
- `/interview/questions`, `/interview/mock-sessions` (+ responses/complete)
- New Next.js route: `POST /api/internal/notifications/enqueue` (the one new Next.js-side API this plan requires)

## New UI Screens Required

- Student: `src/app/(site)/profile/placement/page.tsx` (or a new tab/section on the existing profile page) rendering `PlacementPanel`, `ResumeBuilderPanel`, `InterviewPrepPanel`
- Admin: `src/app/(admin)/admin/placement/` — Kanban board, Employer manager, Job posting form
- Trainer: addition to existing trainer dashboard — `InterviewScheduleWidget` (no new top-level page)

## Open question carried into Sprint 1

Whether Candidates (pre-enrollment, `candidate_login`) should also get placement/resume access, or whether placement is strictly an enrolled-Student benefit. Not yet decided — flag for Sprint 1 kickoff, not blocking Sprint 0.
