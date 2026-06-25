# Sprint 0 — Final Migration Sequence & Dependency Matrix

Supersedes the FK-ordering section of `migration-impact-report.md` with **verified, queryable facts** (live `information_schema` query against the actual database on 2026-06-24), not a restatement of the source-code audit. This is the document Sprint 0 implementation must follow exactly.

## 1. Dependency Matrix (verified via `information_schema.table_constraints`)

| Object (child) | Column | Depends on (parent) | Delete rule | Action |
|---|---|---|---|---|
| `meetings` | `course_id` | `fastapi_courses.id` | SET NULL | Repoint (drop FK constraint, keep column as plain int) |
| `meetings` | `trainer_id` | `fastapi_trainers.id` | SET NULL | Repoint |
| `meeting_attendees` | `meeting_id` | `meetings.id` | CASCADE | **No change** — internal to kept tables |
| `meeting_attendees` | `user_id` | `users.id` | SET NULL | Repoint |
| `meeting_attendees` | `student_id` | `users.id` | SET NULL | Repoint |
| `meeting_attendees` | `trainer_id` | `fastapi_trainers.id` | SET NULL | Repoint |
| `placement_tracking` | `student_id` | `users.id` | CASCADE | Repoint |
| `student_resumes` | `student_id` | `users.id` | CASCADE | Repoint |
| `student_trainer_mapping` | `student_id` | `users.id` | CASCADE | Drop (table itself is debt) |
| `student_trainer_mapping` | `trainer_id` | `fastapi_trainers.id` | CASCADE | Drop (table itself is debt) |
| `student_trainer_mapping` | `course_id` | `fastapi_courses.id` | SET NULL | Drop (table itself is debt) |
| `refresh_tokens` | `user_id` | `users.id` | CASCADE | Drop (table itself is debt) |
| `email_logs` | `notification_id` | `fastapi_notifications.id` | SET NULL | Drop (table itself is debt) |
| `fastapi_audit_logs` | `actor_user_id` | `users.id` | SET NULL | Drop (table itself is debt) |
| `fastapi_enrollments` | `student_id` | `users.id` | CASCADE | Drop (table itself is debt) |
| `fastapi_enrollments` | `course_id` | `fastapi_courses.id` | CASCADE | Drop (table itself is debt) |
| `fastapi_enrollments` | `trainer_id` | `fastapi_trainers.id` | SET NULL | Drop (table itself is debt) |
| `fastapi_notifications` | `recipient_user_id` | `users.id` | SET NULL | Drop (table itself is debt) |

**LMS-related tables check (per request):** zero FastAPI/Alembic-owned LMS tables exist. All `lms_*` tables (`lms_modules`, `lms_chapters`, `lms_topics`, `lms_lessons`, `lms_resources`, `lms_lesson_progress`) are Prisma-owned, outside FastAPI's Alembic history, and untouched by this migration. Nothing to validate here — recorded for completeness.

## 2. Current State

- 18 live FK constraints exist across the 13 in-scope tables (verified by direct `information_schema` query, not inferred from model source).
- Every table involved — both kept and dropped — is at **0 rows** (re-verified 2026-06-24, same result as the prior pass).
- 4 of the 4 "kept" tables (`meetings`, `meeting_attendees`, `placement_tracking`, `student_resumes`) have FK constraints into tables scheduled for removal. `meeting_attendees` has 3 such constraints — the highest exposure of any kept table.
- 4 tables are pure debt with no purpose beyond serving the duplicate auth/course/trainer subsystem: `fastapi_courses`, `fastapi_trainers`, `fastapi_enrollments`, `fastapi_notifications`, plus `email_logs`, `fastapi_audit_logs`, `student_trainer_mapping`, `refresh_tokens`, `users` (9 total, not 7 — `student_trainer_mapping` and `refresh_tokens` were folded into "debt" in the prior report but are listed explicitly here for completeness of the matrix).

## 3. FK Changes Required (exact constraint names, ready for `op.drop_constraint`)

Drop these 8 constraints first, before any table drop:

```python
op.drop_constraint('meetings_course_id_fkey', 'meetings', type_='foreignkey')
op.drop_constraint('meetings_trainer_id_fkey', 'meetings', type_='foreignkey')
op.drop_constraint('meeting_attendees_user_id_fkey', 'meeting_attendees', type_='foreignkey')
op.drop_constraint('meeting_attendees_student_id_fkey', 'meeting_attendees', type_='foreignkey')
op.drop_constraint('meeting_attendees_trainer_id_fkey', 'meeting_attendees', type_='foreignkey')
op.drop_constraint('placement_tracking_student_id_fkey', 'placement_tracking', type_='foreignkey')
op.drop_constraint('student_resumes_student_id_fkey', 'student_resumes', type_='foreignkey')
```

(`meeting_attendees_meeting_id_fkey` is NOT in this list — it's internal to the kept tables and must remain.)

After this step, `meetings.course_id`/`trainer_id`, `meeting_attendees.user_id`/`student_id`/`trainer_id`, `placement_tracking.student_id`, `student_resumes.student_id` become plain indexed integer columns with no DB-level FK — identity is validated at the application layer going forward (`app/repositories/identity_repository.py`, per the architecture plan §5), consistent with how every other cross-boundary reference to Prisma-owned data will work.

## 4. Table Drops (in dependency order — children before parents, matches the matrix above)

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

`fastapi_audit_logs` and `users` are listed last/near-last because nothing else in the drop list depends on them in a way that blocks an earlier drop, but `users` must come after every table with an FK into it has either been repointed (step 3) or dropped (everything earlier in this list).

## 5. Data Migration Steps

**None required.** Every table in scope is confirmed at 0 rows (re-verified live, §2). There is no data to backfill, transform, or carry forward. This is a schema-only change.

## 6. Rollback Plan

Because there is no data, rollback is a pure schema reversal — no data recovery step is needed, but the migration must still implement Alembic's `downgrade()` correctly in case the migration needs to be reverted before Sprint 1 work lands on top of it:

1. **Recreate dropped tables** in reverse order (parents before children): `users`, `fastapi_audit_logs`, `fastapi_trainers`, `fastapi_courses`, `fastapi_enrollments`, `fastapi_notifications`, `email_logs`, `refresh_tokens`, `student_trainer_mapping` — using the exact column definitions from the current (pre-migration) model files, which remain available in git history even after the model files are deleted from the working tree.
2. **Re-add the 7 FK constraints** dropped in step 3, restoring `meetings`/`meeting_attendees`/`placement_tracking`/`student_resumes` to their original referential state.
3. Because nothing has data, no `INSERT`/restore step is needed — `downgrade()` is schema-only, symmetric with `upgrade()`.
4. **Code-level rollback:** if the migration is reverted, the corresponding code deletions (models/repositories/services/endpoints removed in the same Sprint 0 commit) must also be reverted via `git revert` of that commit — the Alembic rollback alone does not restore deleted Python files. Recommend Sprint 0 ship as a single, easily-revertible commit/PR for exactly this reason.
5. **Trigger condition for rollback:** if `uv run pytest` fails after the migration in a way not explained by the expected `test_integrity.py` update, or if the auth refactor (`get_current_principal`) cannot successfully decode a real Next.js-issued token end-to-end, roll back before proceeding to Sprint 1.

## 7. Execution checklist (for whoever runs Sprint 0)

1. `uv run alembic revision -m "sprint0_repoint_and_drop_debt"` — generate the migration skeleton.
2. Write `upgrade()` with: 7 `drop_constraint` calls (§3) → 9 `drop_table` calls in order (§4).
3. Write `downgrade()` per §6.
4. `uv run alembic upgrade head` on a local/dev database copy first — confirm no errors.
5. Re-run the live `information_schema` query from §1 — confirm the 7 constraints are gone and `meetings`/`meeting_attendees`/`placement_tracking`/`student_resumes` still exist with their non-FK columns intact.
6. Proceed with code deletion (models/repositories/services/endpoints) and the auth refactor in the same commit.
7. `uv run pytest` — all tests pass (after `test_integrity.py` is updated per the architecture plan §5).
8. Only then is Sprint 0 considered complete and Sprint 1 (Placement) may begin.
