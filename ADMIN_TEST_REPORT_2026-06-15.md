# Admin Test Report

Date: 2026-06-15
Project: recruitmentinstitute-nextjs

## Scope

I tested the admin surface by:

- Checking the admin route structure
- Hitting the admin login API
- Sweeping key admin pages
- Sweeping key admin APIs
- Verifying the backing database admin table

## What I Tested

Pages:

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/about`
- `/admin/blog`
- `/admin/candidates`
- `/admin/clients`
- `/admin/contacts`
- `/admin/courses`
- `/admin/database`
- `/admin/experts`
- `/admin/faqs`
- `/admin/fees`
- `/admin/knowledge`
- `/admin/memberships`
- `/admin/questions`
- `/admin/reviews`
- `/admin/services`
- `/admin/settings`
- `/admin/students`
- `/admin/subscribers`
- `/admin/testimonials`

APIs:

- `/api/auth/admin`
- `/api/auth/admin/session`
- `/api/admin/stats`
- `/api/admin/chart-data`
- `/api/admin/about`
- `/api/admin/blog`
- `/api/admin/categories`
- `/api/admin/clients`
- `/api/admin/contacts`
- `/api/admin/courses`
- `/api/admin/experts`
- `/api/admin/faqs`
- `/api/admin/fees`
- `/api/admin/knowledge`
- `/api/admin/memberships`
- `/api/admin/reviews`
- `/api/admin/services`
- `/api/admin/students`
- `/api/admin/subscribers`
- `/api/admin/testimonials`
- `/api/admin/questions`
- `/api/admin/candidates`

## Findings

### Critical

1. Admin login is failing with the current database data.

- The login API at `/api/auth/admin` returned `401` for the seeded credentials from `scripts/seed.ts`.
- The live `user_admin` table contains an admin user with an MD5-style password hash, not a bcrypt hash.
- The login API uses bcrypt verification, so the current stored password format cannot authenticate successfully.

Evidence:

- Seeded credentials in [`scripts/seed.ts`](/d:/xampp/htdocs/recruitmentinstitute-nextjs/scripts/seed.ts): `admin@recruitmentinstitute.in` / `Admin@123`
- Live database admin row in `user_admin`:
  - email: `vishal@montekservices.in`
  - password hash: `0192023a7bbd73250516f069df18b500`

Impact:

- Real admin authentication is blocked.
- Authenticated admin CRUD testing cannot proceed normally until the admin credentials or password hashing are aligned.

### High

2. Most admin APIs are protected, but they return `401` without a valid session.

- This is expected behavior, but it means the backend admin functionality could not be fully exercised because login is currently broken.

3. Some admin pages are client-side protected and return `200` HTML even when unauthorized.

- Examples:
  - `/admin/dashboard`
  - `/admin/about`
  - `/admin/clients`
  - `/admin/fees`
  - `/admin/testimonials`

This appears to be normal for the current client-side auth gate, but it means HTTP status alone does not confirm the page is usable without a session.

### Medium

4. Route protection is inconsistent by surface.

- Some admin routes redirect immediately to `/admin/login` at the server level.
- Others return `200` and rely on client-side session checking.

This is not necessarily a bug, but it makes admin validation and user experience less uniform.

## Successful Checks

- `/admin` redirected to `/admin/dashboard`
- `/admin/login` loaded successfully
- `/api/auth/admin/session` returned `{"success":false,"session":null}` when unauthenticated
- Many protected admin APIs correctly returned `401` when unauthenticated

## Database Notes

- Local database: `recruitmentinstitute`
- Admin table: `user_admin`
- Important columns:
  - `email`
  - `password`
  - `role`
  - `status`

## Recommendation

- Update the live admin password data to a bcrypt hash that matches `lib/auth.ts`, or add a migration/reset flow that converts the legacy MD5 credential.
- Once login works, rerun the admin CRUD sweep for:
  - blog
  - courses
  - experts
  - FAQs
  - testimonials
  - services
  - contacts
  - students
  - memberships

