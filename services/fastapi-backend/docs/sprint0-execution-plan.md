# Sprint 0 — Final Execution Plan

This is the authoritative, step-by-step execution document for Sprint 0. It supersedes nothing in `migration-impact-report.md`, `reuse-mapping.md`, or `sprint0-migration-sequence.md` — it sequences their conclusions into exact, runnable steps. No schema change executes outside this document.

**Pre-flight blocker found during planning (must fix first, see §6):** `services/fastapi-backend/.env` currently has `DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/recruitmentinstitute` — verified live to fail (`password authentication failed for user "postgres"`). The actual working credential, matching Next.js's `.env`, is `postgres:postgres`. **Alembic cannot run at all until this is fixed.** This was already flagged as a config item to fix during Sprint 0; it is now confirmed to be a hard blocker, not optional cleanup.

---

## 1. Exact Alembic migration filename and order

- Existing: `alembic/versions/0001_initial.py` (head, unchanged, not modified).
- New: `alembic/versions/0002_sprint0_repoint_and_drop_debt.py` — single migration file, generated via `uv run alembic revision -m "sprint0_repoint_and_drop_debt"`. One file is sufficient because every table involved is at 0 rows (no staged/multi-deploy data migration is needed) and Alembic's `upgrade()` runs statements in the order written, which is what guarantees correctness here — not file count.

## 2. Constraint removal order (inside `upgrade()`, executed first)

Exact constraint names, verified live via `information_schema` (`sprint0-migration-sequence.md` §3):

```python
def upgrade():
    op.drop_constraint('meetings_course_id_fkey', 'meetings', type_='foreignkey')
    op.drop_constraint('meetings_trainer_id_fkey', 'meetings', type_='foreignkey')
    op.drop_constraint('meeting_attendees_user_id_fkey', 'meeting_attendees', type_='foreignkey')
    op.drop_constraint('meeting_attendees_student_id_fkey', 'meeting_attendees', type_='foreignkey')
    op.drop_constraint('meeting_attendees_trainer_id_fkey', 'meeting_attendees', type_='foreignkey')
    op.drop_constraint('placement_tracking_student_id_fkey', 'placement_tracking', type_='foreignkey')
    op.drop_constraint('student_resumes_student_id_fkey', 'student_resumes', type_='foreignkey')
```

(`meeting_attendees_meeting_id_fkey` is deliberately excluded — internal to kept tables, must remain.)

## 3. Table removal order (inside `upgrade()`, executed second, children before parents)

```python
    op.drop_table('student_trainer_mapping')
    op.drop_table('refresh_tokens')
    op.drop_table('email_logs')
    op.drop_table('fastapi_notifications')
    op.drop_table('fastapi_enrollments')
    op.drop_table('fastapi_courses')
    op.drop_table('fastapi_trainers')
    op.drop_table('fastapi_audit_logs')
    op.drop_table('users')
```

## 4. `downgrade()` (symmetric, schema-only — no data to restore, per `sprint0-migration-sequence.md` §6)

```python
def downgrade():
    # Recreate tables, parents before children — column defs copied from
    # the pre-migration model files (available in git history of this commit's parent).
    op.create_table('users', ...)
    op.create_table('fastapi_audit_logs', ...)
    op.create_table('fastapi_trainers', ...)
    op.create_table('fastapi_courses', ...)
    op.create_table('fastapi_enrollments', ...)
    op.create_table('fastapi_notifications', ...)
    op.create_table('email_logs', ...)
    op.create_table('refresh_tokens', ...)
    op.create_table('student_trainer_mapping', ...)

    # Restore the 7 FK constraints
    op.create_foreign_key('meetings_course_id_fkey', 'meetings', 'fastapi_courses', ['course_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('meetings_trainer_id_fkey', 'meetings', 'fastapi_trainers', ['trainer_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('meeting_attendees_user_id_fkey', 'meeting_attendees', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('meeting_attendees_student_id_fkey', 'meeting_attendees', 'users', ['student_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('meeting_attendees_trainer_id_fkey', 'meeting_attendees', 'fastapi_trainers', ['trainer_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('placement_tracking_student_id_fkey', 'placement_tracking', 'users', ['student_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('student_resumes_student_id_fkey', 'student_resumes', 'users', ['student_id'], ['id'], ondelete='CASCADE')
```

Full column definitions for `create_table(...)` will be filled in verbatim from the current `app/models/{course,trainer,enrollment,audit,user,token}.py` at the moment the migration file is authored (those files still exist in the working tree until step 5 below runs) — not reconstructed from memory.

## 5. Endpoint / service / repository deletion checklist

Executed in the **same commit** as the migration (per rollback plan §6 of `sprint0-migration-sequence.md` — `git revert` must undo code and schema together):

- [ ] Delete `app/models/course.py`, `app/models/trainer.py`, `app/models/enrollment.py`, `app/models/audit.py`, `app/models/user.py`, `app/models/token.py`
- [ ] Delete `app/repositories/course_repository.py`, `app/repositories/trainer_repository.py`, `app/repositories/enrollment_repository.py`, `app/repositories/audit_repository.py`, `app/repositories/token_repository.py`
- [ ] Delete `app/services/course_service.py`, `app/services/trainer_service.py`, `app/services/enrollment_service.py`, `app/services/audit_service.py`
- [ ] Delete `app/api/v1/endpoints/courses.py`, `app/api/v1/endpoints/trainers.py`, `app/api/v1/endpoints/enrollments.py`
- [ ] Remove their router registrations from `app/api/v1/router.py` (currently includes `courses.router`, `enrollments.router`, `trainers.router`)
- [ ] In `app/models/placement.py`: remove the `Notification` and `EmailLog` classes (the `fastapi_notifications`/`email_logs` ORM models); keep `PlacementTracking` (table kept)
- [ ] In `app/models/meeting.py`: keep `Meeting`/`MeetingAttendee` classes, but update their FK-typed columns (`course_id`, `trainer_id`, `user_id`, `student_id`) to plain `Integer` (no `ForeignKey(...)`), matching the constraint drops in §2
- [ ] In `app/models/resume.py` / `app/models/placement.py` (`StudentResume`, `PlacementTracking`): same column-type update for `student_id`
- [ ] Delete `app/repositories/notification_repository.py` calls to `create_email_log`/the email-log path (keep in-app notification queuing only if still referenced by kept features — otherwise delete the file if nothing else uses it)
- [ ] Delete `app/api/v1/endpoints/notifications.py` if its only purpose was the dropped `fastapi_notifications` queue (confirm against architecture plan §7 — new notifications route through Next.js, not a FastAPI endpoint)

## 6. JWT refactor checklist

- [ ] Fix `services/fastapi-backend/.env`: change `DATABASE_URL` password from `password` to `postgres` (confirmed live as the actual working credential) — **do this first, before running any Alembic command**
- [ ] Set `services/fastapi-backend/.env` `JWT_SECRET` (or `jwt_secret` per `app/core/config.py`'s field name) to the **exact same value** as the root `.env`'s `JWT_SECRET` (currently `dev-secret-key-for-local-development-only-change-in-prod`)
- [ ] Document this shared-secret requirement in both `.env.example` files (root and `services/fastapi-backend/`)
- [ ] Create `app/core/nextjs_auth.py` with `decode_nextjs_token(token: str)` per architecture plan §5 (python-jose, `algorithms=["HS256"]`, no `jti`/`iat` requirement)
- [ ] Create `app/repositories/identity_repository.py` with read-only lookups against `login_student`, `candidate_login`, `trainers`, `user_admin`
- [ ] Update `app/api/deps.py`: replace any existing `get_token_context`/local-auth dependency with `get_current_principal()` per architecture plan §5
- [ ] Delete `/auth/login` and `/auth/refresh` handlers in `app/api/v1/endpoints/auth.py`; reduce `/auth/me` to a decode-and-echo diagnostic
- [ ] Delete `app/core/security.py`'s local token-issuance functions if nothing else uses them after the above changes

## 7. Configuration changes checklist

- [ ] `services/fastapi-backend/.env`: `DATABASE_URL` password fix (§6, first item — blocking)
- [ ] `services/fastapi-backend/.env`: `JWT_SECRET` aligned with Next.js (§6)
- [ ] `services/fastapi-backend/.env.example`: document both of the above as required-to-match-Next.js
- [ ] Root `.env.example`: add a comment noting `JWT_SECRET` is shared with the FastAPI service
- [ ] No Prisma schema changes (confirmed not required anywhere in Sprint 0)
- [ ] No Next.js `.env` changes required for Sprint 0 itself (the `POST /api/internal/notifications/enqueue` route and its `service_api_key` wiring is Sprint 1+ scope per architecture plan §7, not Sprint 0)

## 8. Validation checklist (run immediately after migration, before considering Sprint 0 done)

1. [ ] `uv run alembic upgrade head` completes with no errors (now that §6's DB password fix is in place)
2. [ ] Re-run the live `information_schema.table_constraints` query from `sprint0-migration-sequence.md` §1 — confirm the 7 constraints are gone, and confirm `meeting_attendees_meeting_id_fkey` still exists
3. [ ] Confirm `meetings`, `meeting_attendees`, `placement_tracking`, `student_resumes` still exist as tables with all original columns (just minus the FK constraint) — `\d meetings` etc. via psql, or an `information_schema.columns` query
4. [ ] Confirm `fastapi_courses`, `fastapi_trainers`, `fastapi_enrollments`, `fastapi_notifications`, `email_logs`, `fastapi_audit_logs`, `users`, `student_trainer_mapping`, `refresh_tokens` no longer exist (`information_schema.tables` query returns nothing for these 9 names)
5. [ ] `uv run pytest` — all tests pass, with `tests/test_integrity.py` updated to match the new table/router set (no assertions referencing dropped tables/routers remain)
6. [ ] `uv run uvicorn app.main:app --reload` boots without import errors (proves no dangling import of a deleted model/repository/service)
7. [ ] `curl http://127.0.0.1:8000/health` → 200 OK
8. [ ] `curl http://127.0.0.1:8000/docs` → 200 OK, and the dropped routes (`/courses`, `/trainers`, `/enrollments`, old `/auth/login`, `/auth/refresh`) no longer appear in the Swagger UI
9. [ ] Log in via Next.js (`/student-login` or any portal), copy the `ri_user_token` cookie, call `GET /api/v1/auth/me` on FastAPI with it as `Authorization: Bearer <token>` — returns decoded claims matching the logged-in user, with zero FastAPI-side DB writes

## 9. Rollback execution steps (if step 8 fails)

1. `uv run alembic downgrade -1` — reverts the schema to pre-migration state (recreates the 9 tables, restores the 7 FK constraints, per §4)
2. `git revert <sprint0-commit-sha>` — restores the deleted Python files (models/repositories/services/endpoints) in the same operation, since Alembic downgrade alone does not restore deleted code
3. Re-run §8 step 1, 5, 6 (alembic state, pytest, app boot) to confirm the revert itself is clean
4. Do not proceed to Sprint 1 until the root cause of the Sprint 0 failure is understood and either fixed or the revert is confirmed stable

---

## Approval gate

No command in §2–§7 has been executed. This document is the complete plan for review. Execution begins only on explicit approval, starting with §6's database-password fix (blocking prerequisite), then the migration (§1–§4), then code deletion (§5), then validation (§8).
