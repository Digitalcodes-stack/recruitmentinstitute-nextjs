# Recruitment Institute — Admin Dashboard
## Complete Working Report

**Project:** Recruitment Institute Next.js Admin Panel  
**Stack:** Next.js 16.2.7 (App Router) · Tailwind CSS v4 · Prisma 7 · PostgreSQL  
**Date:** 2026-06-09  
**Status:** ✅ All pages operational with live database data

---

## 1. How to Start the Project

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Open admin panel
# → http://localhost:3000/admin/login
```

**Admin login credentials:**
| Email | Password | Role |
|---|---|---|
| admin@recruitmentinstitute.in | (existing password) | ADMIN |

---

## 2. Database Setup

**Connection:** `postgresql://postgres:postgres@localhost:5432/recruitmentinstitute`

### Seed Sample Data (run once)

```bash
node prisma/seed.js
```

This script inserts realistic sample data into all empty tables using plain Node.js + `pg`. It is safe to re-run — every insert uses `ON CONFLICT DO NOTHING`.

### Re-seed from scratch

```bash
# Open Prisma Studio to inspect data
npm run db:studio
# → http://localhost:5555
```

---

## 3. Admin Pages — Status Report

### Navigation Structure (Sidebar Groups)

| Group | Pages |
|---|---|
| Overview | Dashboard |
| Content | Blog Posts, Courses, FAQs, Knowledge Base, Q & A |
| People | Candidates, Students, Memberships, Subscribers, Experts |
| Finance | Fees, Reviews |
| Inbox | Contact Submissions |
| Brand | About Us, Testimonials, Services |
| System | Database Viewer |

---

### 3.1 Dashboard
**URL:** `/admin/dashboard`  
**File:** `src/app/(admin)/admin/dashboard/page.tsx`  
**Data source:** Live counts from all major tables  
**Features:**
- Dark navy hero banner with real-time stat cards (Blog posts, Courses, Candidates, Students, FAQs, Subscribers, Contacts, Memberships)
- Quick Actions grid (6 cards with direct links)
- Operational Overview panel
- All numbers pulled live from the database on every page load

**Sample data:** 52 blog posts, 4 courses, 6 candidates, 8 students, 20 FAQs, 10 subscribers, 10 contacts, 5 memberships

---

### 3.2 Blog Posts
**URL:** `/admin/blog`  
**File:** `src/app/(admin)/admin/blog/page.tsx`  
**DB table:** `blog`  
**Data source:** `prisma.blog.findMany()`  
**Features:**
- Lists all 52 blog posts with title, author, published date, status
- Author avatar with deterministic color hash
- Live search filter (client-side)
- Edit / Delete action buttons
- Add New Post button → `/admin/blog/new`

**Create/Edit:** `/admin/blog/new` and `/admin/blog/[id]/edit`  
**Saves to:** `blog` table via POST/PUT API routes

---

### 3.3 Course Management
**URL:** `/admin/courses?cat=<slug>&tab=<tab>`  
**File:** `src/app/(admin)/admin/courses/page.tsx`  
**DB tables:** `course_category`, `courses`, `faq`  
**Data source:** `prisma.courseCategory.findMany({ include: { courses, faqs } })`  
**Features:**
- Two-column layout: 300px category list + detail panel
- URL-driven selection: `?cat=degree_tag` etc.
- Color-coded banners per category (blue/green/amber/violet)
- Correct icons: BadgeCheck, GraduationCap, Sparkles, BriefcaseBusiness
- Shows courses and FAQs per selected category
- Tab bar: Categories / Courses / FAQs / Syllabus

**Category slugs in DB:**
| Name | Slug | Color |
|---|---|---|
| Degree | `degree_tag` | Green #059669 |
| Certification | `certification_tag` | Blue #2563eb |
| Entrepreneur | `entrepreneur_tag` | Amber #d97706 |
| Corporate Traning | `corporate_traning_tag` | Violet #7c3aed |

**Sample data:** 4 courses (one per category), 20 FAQs (2 per category + 2 general)

---

### 3.4 FAQs
**URL:** `/admin/faqs`  
**File:** `src/app/(admin)/admin/faqs/page.tsx`  
**DB tables:** `faq`, `faq_category`  
**Data source:** `prisma.faq.findMany({ include: { category } })`  
**Features:**
- Stat cards: Total FAQs, Category-linked, General, FAQ Categories
- Filter tabs (All / Category-linked / General)
- Table with question, answer preview, category pill, date
- Color-coded category badges

**Sample data:** 20 FAQs — 2 per category + 2 general

---

### 3.5 Knowledge Base
**URL:** `/admin/knowledge`  
**File:** `src/app/(admin)/admin/knowledge/page.tsx`  
**DB table:** `knowledge_items`  
**Data source:** `prisma.knowledgeItem.findMany()`  
**Features:**
- Card list with amber lightbulb icon
- Inline "Add new item" slide-in form
- Shows question, answer, added_by, date
- Empty state with CTA

**Sample data:** 8 items (Boolean Search, ATS, Time-to-hire, STAR Method, Employer Branding, CV vs Resume, Headhunting, Job Description writing)

---

### 3.6 Q & A (Community Questions)
**URL:** `/admin/questions`  
**File:** `src/app/(admin)/admin/questions/page.tsx`  
**DB tables:** `questions`, `answers`, `registers`  
**Data source:** `prisma.question.findMany({ include: { user, answers: { include: { user } } } })`  
**Features:**
- Stat cards: Total Questions, Answered, Unanswered, Total Answers
- Expandable cards showing question + all answers inline
- User avatars with deterministic color
- Unanswered questions highlighted with amber border
- Answer timestamps and author names

**Sample data:** 5 questions from community users, 10 answers total

---

### 3.7 Candidates
**URL:** `/admin/candidates`  
**File:** `src/app/(admin)/admin/candidates/page.tsx`  
**DB table:** `candidate_login`  
**Data source:** `prisma.candidate.findMany()`  
**Features:**
- Summary chips (Total, Approved, Pending)
- Filter tabs by status
- Table: Name, Email, Mobile, City/State, Course selected, Status pill
- Approve / Reject action buttons

**Sample data:** 6 candidates (1 existing + 5 seeded)  
**Passwords (seeded):** `Cand@123`

---

### 3.8 Students
**URL:** `/admin/students`  
**File:** `src/app/(admin)/admin/students/page.tsx`  
**DB table:** `login_student`  
**Data source:** `prisma.student.findMany()`  
**Features:**
- GraduationCap icon header
- Active / Inactive summary chips
- Table: Name, Email, Contact, Status, Joined date
- Activate / Suspend toggle buttons

**Sample data:** 8 students (6 active, 2 inactive)  
**Passwords:** `Student@123`

---

### 3.9 Memberships
**URL:** `/admin/memberships`  
**File:** `src/app/(admin)/admin/memberships/page.tsx`  
**DB table:** `login_membership`  
**Data source:** `prisma.membership.findMany()`  
**Features:**
- CreditCard / violet accent header
- Active / Inactive summary chips
- Table: Name, Email, Contact, Status, Joined date

**Sample data:** 5 members  
**Passwords:** `Member@123`

---

### 3.10 Subscribers
**URL:** `/admin/subscribers`  
**File:** `src/app/(admin)/admin/subscribers/page.tsx`  
**DB table:** `subscribe_email`  
**Data source:** `prisma.subscriber.findMany()`  
**Features:**
- 3 stat cards (Total, Active, Inactive)
- Mail icon per row
- Active / Inactive status pills
- IP address display

**Sample data:** 10 subscribers (8 active, 2 inactive)

---

### 3.11 Experts
**URL:** `/admin/experts`  
**File:** `src/app/(admin)/admin/experts/page.tsx`  
**DB table:** `expert`  
**Data source:** `prisma.expert.findMany({ include: { category } })`  
**Features:**
- Card grid (auto-fill, min 260px)
- Avatar with initials (color-coded per category)
- Shows name, profession, category badge
- Add Expert button

**Sample data:** 16 experts (8 seeded + 8 from previous run) — 2 per category

---

### 3.12 Course Fees
**URL:** `/admin/fees`  
**File:** `src/app/(admin)/admin/fees/page.tsx`  
**DB table:** `fees`  
**Data source:** `prisma.courseFee.findMany({ include: { category } })`  
**Features:**
- 3 stat cards (Total Entries, Avg Fee, Avg Discount)
- Table: Course name, Category, Fee (₹), Discount, Subtotal, Final Total, Coupon code
- Green discount amounts, blue final totals
- Coupon code pill badges

**Sample data:** 10 fee entries across all 4 categories  
**Example:** MBA HR = ₹95,000 → discount ₹10,000 → final ₹85,000 (DEGREE10)

---

### 3.13 Reviews
**URL:** `/admin/reviews`  
**File:** `src/app/(admin)/admin/reviews/page.tsx`  
**DB table:** `reviews`  
**Data source:** `prisma.courseReview.findMany({ include: { category } })`  
**Features:**
- 4 stat cards (Total, Avg Rating, 5-Star count, Categories)
- Table: Title, Description, Category, Star rating (colored), Review text

**Sample data:** 8 reviews across 4 categories, ratings 3–5

---

### 3.14 Contact Submissions
**URL:** `/admin/contacts`  
**File:** `src/app/(admin)/admin/contacts/page.tsx`  
**DB table:** `tbl_contactus`  
**Data source:** `prisma.contactSubmission.findMany()`  
**Features:**
- 3 stat cards (Total, Recent 7 days, With Mobile)
- Card-per-enquiry layout with message preview
- Name, email, mobile, submitted date

**Sample data:** 10 contacts (5 existing + 5 seeded)

---

### 3.15 About Us
**URL:** `/admin/about`  
**File:** `src/app/(admin)/admin/about/page.tsx`  
**DB table:** `about_us`  
**Data source:** `prisma.aboutSection.findMany()`  
**Features:**
- Section count stat card
- Card-per-section layout
- Shows title, subtitle, description, image (if set)
- Add Section button

**Sample data:** 3 sections (Welcome, Our Mission, Why Choose Us?)

---

### 3.16 Testimonials
**URL:** `/admin/testimonials`  
**File:** `src/app/(admin)/admin/testimonials/page.tsx`  
**DB table:** `testimonials`  
**Data source:** `prisma.testimonial.findMany()`  
**Features:**
- 4 stat cards (Total, Active, Inactive, Avg Rating)
- Card grid with star rating display
- Author avatar + quote block
- Active / Hidden status badge
- Inactive cards appear at 65% opacity

**Sample data:** 8 testimonials (7 active, 1 hidden)

---

### 3.17 Services
**URL:** `/admin/services`  
**File:** `src/app/(admin)/admin/services/page.tsx`  
**DB table:** `services`  
**Data source:** `prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }] })`  
**Features:**
- 3 stat cards (Total, Active, Inactive)
- Table: Title (with image thumbnail), Slug (monospace), Description, Sort Order, Status
- Active / Hidden status pills
- Add Service button

**Sample data:** 6 services (Recruitment Training, Corporate HR Solutions, Placement Assistance, Online Certification, HR Consulting, Interview Preparation)

---

### 3.18 Database Viewer
**URL:** `/admin/database?table=<name>&limit=<n>`  
**File:** `src/app/(admin)/admin/database/page.tsx`  
**Data source:** Raw SQL via `prisma.$queryRawUnsafe()`  
**Features:**
- Sidebar with all 27 allow-listed tables and row counts
- Full data table with column headers
- Schema panel showing column names, types, nullable
- URL-driven table & limit selection
- Allow-list security (hardcoded table names only)

**Allow-listed tables:** about_us, answers, audit_logs, blog, candidate_login, course_category, course_leads, courses, expert, faq, faq_category, fees, fees_leads, knowledge_items, login_membership, login_student, news, password_reset_tokens, questions, registers, reviews, services, study_with_us, subscribe_email, tbl_contactus, testimonials, user_admin

---

## 4. Database Schema Summary

| Table | Prisma Model | Rows | Purpose |
|---|---|---|---|
| `blog` | Blog | 52 | Blog posts |
| `course_category` | CourseCategory | 5 | Course categories |
| `courses` | Course | 4 | Individual courses |
| `expert` | Expert | 16 | Course trainers/experts |
| `fees` | CourseFee | 10 | Course pricing |
| `reviews` | CourseReview | 8 | Course reviews |
| `faq` | Faq | 20 | FAQs (category-linked + general) |
| `faq_category` | FaqCategory | 10 | FAQ category labels |
| `knowledge_items` | KnowledgeItem | 8 | Knowledge base articles |
| `questions` | Question | 5 | Community Q&A questions |
| `answers` | Answer | 10 | Community Q&A answers |
| `registers` | CommunityUser | 5 | Community users |
| `login_student` | Student | 8 | Student accounts |
| `login_membership` | Membership | 5 | Membership accounts |
| `candidate_login` | Candidate | 6 | Candidate profiles |
| `tbl_contactus` | ContactSubmission | 10 | Contact enquiries |
| `subscribe_email` | Subscriber | 10 | Newsletter subscribers |
| `testimonials` | Testimonial | 8 | Website testimonials |
| `services` | Service | 6 | Service pages |
| `about_us` | AboutSection | 3 | About Us sections |
| `user_admin` | AdminUser | 8 | Admin panel users |
| `course_leads` | CourseLead | 10 | Course enquiry leads |
| `fees_leads` | FeesLead | 6 | Fees enquiry leads |

---

## 5. Key Technical Fixes Applied

### 5.1 Next.js 16 — searchParams is a Promise
All page components that use `searchParams` must `await` it:

```typescript
// ✅ Correct (Next.js 16+)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; tab?: string }>
}) {
  const sp = await searchParams
  const cat = sp.cat ?? 'default'
}
```

**Fixed in:** `courses/page.tsx`, `database/page.tsx`

### 5.2 Course Category META Keys
The META color/icon map must match actual DB slugs:

```typescript
const META = {
  degree_tag:            { accent: '#059669', icon: GraduationCap },
  certification_tag:     { accent: '#2563eb', icon: BadgeCheck },
  entrepreneur_tag:      { accent: '#d97706', icon: Sparkles },
  corporate_traning_tag: { accent: '#7c3aed', icon: BriefcaseBusiness },
}
```

### 5.3 Server Components — No Event Handlers
Event handlers (`onMouseEnter`, `onMouseLeave`) cannot be used in Server Components. Use Tailwind hover classes instead:

```tsx
// ❌ Error in Server Component
<div onMouseEnter={() => setHovered(true)}>

// ✅ Correct
<div className="hover:bg-[#fafbfc] transition-colors">
```

### 5.4 AdminDashboard — Object Destructuring
```typescript
// ❌ Broke at runtime (tuple destructuring on objects)
overviewItems.map(([label, value]) => ...)

// ✅ Fixed
overviewItems.map(({ label, value }) => ...)
```

### 5.5 PostgreSQL updated_at — No Default
Tables with `updated_at NOT NULL` and no `DEFAULT` require explicit value on INSERT:

```sql
-- Always include updated_at when inserting into:
-- login_student, login_membership, candidate_login,
-- knowledge_items, testimonials, services, about_us
INSERT INTO login_student (..., updated_at) VALUES (..., NOW())
```

---

## 6. Sample Login Credentials

| Role | Email | Password |
|---|---|---|
| Student | priya.sharma@gmail.com | Student@123 |
| Student | rahul.verma@gmail.com | Student@123 |
| Member | vijay.reddy@gmail.com | Member@123 |
| Candidate | ravi.kumar@gmail.com | Cand@123 |
| Candidate | meena.rao@gmail.com | Cand@123 |

---

## 7. File Structure

```
src/app/(admin)/admin/
├── dashboard/page.tsx       ← Main dashboard with stats
├── blog/
│   ├── page.tsx             ← Blog list
│   ├── new/page.tsx         ← Create new blog post
│   └── [id]/edit/page.tsx   ← Edit existing blog post
├── courses/page.tsx         ← Course management (URL-driven)
├── faqs/page.tsx            ← FAQ management
├── knowledge/page.tsx       ← Knowledge base
├── questions/page.tsx       ← Community Q&A
├── candidates/page.tsx      ← Candidate management
├── students/page.tsx        ← Student management
├── memberships/page.tsx     ← Membership management
├── subscribers/page.tsx     ← Newsletter subscribers
├── experts/page.tsx         ← Expert/trainer profiles
├── fees/page.tsx            ← Course fee management
├── reviews/page.tsx         ← Course reviews
├── contacts/page.tsx        ← Contact enquiries
├── about/page.tsx           ← About Us sections
├── testimonials/page.tsx    ← Testimonials management
├── services/page.tsx        ← Services management
├── database/page.tsx        ← Raw DB viewer (allow-listed)
└── login/page.tsx           ← Admin login

components/admin/
├── AdminLayout.tsx          ← Sidebar + header (Client Component)
├── AdminDashboard.tsx       ← Dashboard page component
├── AdminBlogList.tsx        ← Blog list component
├── AdminBlogForm.tsx        ← Blog create/edit form
├── AdminCandidates.tsx      ← Candidates component
└── AdminKnowledgeList.tsx   ← Knowledge base component

prisma/
├── schema.prisma            ← Full database schema
└── seed.js                  ← Sample data seed script
```

---

## 8. Running Commands Reference

```bash
# Start development server
npm run dev

# Run database seed (sample data)
node prisma/seed.js

# Open Prisma Studio (database GUI)
npm run db:studio

# TypeScript type check
npx tsc --noEmit

# Push schema changes to DB
npm run db:push
```

---

*Generated: 2026-06-09 | Recruitment Institute Admin Panel v1.0*
