# Migration Impact Report — FastAPI Debt Cleanup (Pre–Sprint 0)

Date: 2026-06-24. Scope: verify whether `fastapi_courses`, `fastapi_trainers`, `fastapi_enrollments`, `fastapi_notifications`, `fastapi_audit_logs`, `email_logs`, and `users` (FastAPI's own SQLAlchemy table, distinct from any Prisma model) are safe to remove, per the original plan's Sprint 0.

## 1. Live row counts (verified by direct query, 2026-06-24)

Every FastAPI-owned table — both the ones flagged for removal and the ones being kept — currently has **zero rows**:

| Table | Rows | Disposition |
|---|---|---|
| `users` | 0 | Remove (duplicate auth identity) |
| `fastapi_courses` | 0 | Remove (duplicate of Prisma `courses`) |
| `fastapi_trainers` | 0 | Remove (duplicate of Prisma `trainers`) |
| `fastapi_enrollments` | 0 | Remove (duplicate of Prisma `enrollments`) |
| `fastapi_notifications` | 0 | Remove (duplicate of Prisma `notifications`) |
| `fastapi_audit_logs` | 0 | Remove (duplicate of Prisma `audit_logs`) |
| `email_logs` | 0 | Remove (superseded by Prisma's notification delivery log) |
| `student_trainer_mapping` | 0 | Remove (depends only on removed tables — see §3) |
| `refresh_tokens` | 0 | Remove (only serves the removed `users`-based login) |
| `meetings` | 0 | **Keep** |
| `meeting_attendees` | 0 | **Keep** |
| `placement_tracking` | 0 | **Keep** (frozen for history, superseded by new pipeline) |
| `student_resumes` | 0 | **Keep** |

**This means there is zero data-loss risk from this cleanup.** The risk is entirely about code (FK constraints, broken imports, failing tests), not destroyed production data — there is no production data in any FastAPI-owned table yet.

## 2. Internal code-reference audit (why a naive "is it referenced" check gives the wrong answer)

A first-pass audit found that all 7 candidate tables ARE referenced — by FastAPI's own duplicate code:

- `users` ← AuthService (login/refresh/me), 8 FK relationships, Celery tasks, `app/api/v1/endpoints/auth.py`
- `fastapi_courses` ← CourseRepository/CourseService, `endpoints/courses.py`, FK from Enrollment/StudentTrainerMapping/Meeting
- `fastapi_trainers` ← TrainerRepository/TrainerService, `endpoints/trainers.py`, FK from Enrollment/StudentTrainerMapping/Meeting/MeetingAttendee, Celery reminder task
- `fastapi_enrollments` ← EnrollmentRepository/EnrollmentService, `endpoints/enrollments.py`, Celery notification task
- `fastapi_notifications` ← NotificationRepository/NotificationService, `endpoints/notifications.py`, EmailLog FK
- `fastapi_audit_logs` ← AuditService, called by auth/meeting/enrollment services
- `email_logs` ← NotificationRepository/PlacementRepository

**This is expected and does not mean these tables are safe to keep.** This is the duplicate authentication, duplicate course system, and duplicate trainer/enrollment system the original brief explicitly said not to build. The fact that FastAPI's own duplicate code depends on FastAPI's own duplicate tables is circular — it describes the debt, not a reason to preserve it. The correct question is whether anything **outside this duplicate subsystem** — real Next.js code, or genuinely-new FastAPI features we're keeping (Placement, Resume, Meetings) — depends on these tables. Per the full-codebase grep:

- **Zero references** to `fastapi_courses`, `fastapi_trainers`, `fastapi_enrollments`, `fastapi_notifications`, `fastapi_audit_logs`, `email_logs`, or a table literally named `users` exist anywhere in the Next.js codebase (`prisma/schema.prisma`, `src/`, `components/`, `lib/`, `scripts/`). Prisma's own models map to entirely different table names (`AdminUser`→`user_admin`, `Student`→`login_student`, etc. — confirmed via `@@map` directives) and Prisma has no model mapping to a table named `users`.
- `tests/test_integrity.py` asserts these tables/routers exist — this test must be updated as part of the removal, not treated as a dependency that blocks it.

## 3. The real dependency that matters: kept tables FK into removed tables

This is the one finding that actually changes the removal plan. Reading the SQLAlchemy models directly:

| Kept table | Foreign keys into a table being removed |
|---|---|
| `meetings` | `course_id` → `fastapi_courses.id`, `trainer_id` → `fastapi_trainers.id` |
| `meeting_attendees` | `user_id`/`student_id` → `users.id`, `trainer_id` → `fastapi_trainers.id` |
| `placement_tracking` | `student_id` → `users.id` |
| `student_resumes` | `student_id` → `users.id` |
| `fastapi_notifications.recipient_user_id` (being removed) → `users.id`; `email_logs.notification_id` (being removed) → `fastapi_notifications.id` | — |

**Implication:** a single `DROP TABLE users CASCADE` (or `fastapi_courses`/`fastapi_trainers` cascade) executed today, before any column changes, would either fail on FK constraint violation (without CASCADE) or silently cascade-null/cascade-delete columns on `meetings`, `meeting_attendees`, `placement_tracking`, and `student_resumes` (with CASCADE) — tables we are explicitly keeping. Since all tables are at 0 rows, no real data would be lost, but the **schema** would be left with dangling/incorrect FK definitions if done carelessly, and a straight `DROP TABLE ... CASCADE` in Alembic without first repointing the kept tables' FKs is the wrong order of operations.

## 4. Correct migration order (revised from the original plan)

The original plan's Sprint 0 ("one migration drops all 6 tables") is amended to a strictly ordered sequence:

1. **Add new FK columns** to `meetings`, `meeting_attendees`, `placement_tracking`, `student_resumes`: no schema change needed for the *target* — these will reference Prisma's `Student.id` / `Trainer.id` directly as plain integers (no enforced cross-schema FK, per the original plan's Decision A/C — validated at the application layer via the new identity repository), replacing the FK constraint to `users.id`/`fastapi_trainers.id`.
2. **Alter** the FK constraints on `meetings.course_id`/`trainer_id`, `meeting_attendees.user_id`/`student_id`/`trainer_id`, `placement_tracking.student_id`, `student_resumes.student_id` — drop the FK constraint (keep the column as a plain indexed integer), since the referenced tables are being removed and the new identity model intentionally has no DB-level cross-schema FK.
3. **Drop**, in dependency order (children before parents): `student_trainer_mapping`, `refresh_tokens`, `email_logs`, `fastapi_notifications`, `fastapi_enrollments`, then `fastapi_courses`, `fastapi_trainers`, finally `users`.
4. **Remove dead code**: `app/models/{course,trainer,enrollment,audit,user,token}.py`, their repositories/services, `app/api/v1/endpoints/{courses,trainers,enrollments}.py`, and the `/auth/login`+`/auth/refresh` handlers in `endpoints/auth.py` (per the auth-refactor decision already approved).
5. **Update `tests/test_integrity.py`** to stop asserting the removed routers/tables exist, and add an assertion for the new verify-only auth dependency instead.

This can be one Alembic migration file with multiple ordered `op.drop_constraint` / `op.drop_table` calls, or split into two for clarity (constraints first, drops second) — either is acceptable since no data exists to stage/backfill.

## 5. Verdict

**Safe to proceed with removal**, with the order corrected above. Zero rows exist anywhere, so there is no data-loss risk. The only real risk was FK ordering and dead-code cleanup completeness, both addressed in §4. No table outside the duplicate-auth/course/trainer subsystem (i.e., nothing in Next.js, and none of the kept FastAPI tables' actual *purpose*) depends on the 7 tables being removed — only their FK *columns* need repointing first.
