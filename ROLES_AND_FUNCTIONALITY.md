# Recruitment Institute — System Roles and Functionality Guide

This guide outlines the system roles, access levels, step-by-step user journeys, and functionality mappings across the Recruitment Institute Next.js application.

---

## 1. System Roles Overview

The platform supports four primary user groups with distinct access privileges:

| Role | Access Scope | Primary Actions |
|---|---|---|
| **Admin** | Site-wide Administrator | User and core entity management, curriculum building, admissions, lead tracking, and content moderation. |
| **Trainer** | Assigned Batches | Class scheduling, meeting link generation (auto-sync or manual), session updates, student progress tracking, and attendance management. |
| **Student** | Enrolled Batches | Accessing course materials (LMS), attending live sessions, submitting assignments, taking AI assessments, and peer-to-peer discussions. |
| **Visitor / Candidate** | Public Pages | Browsing courses/blogs, submitting lead forms, and registering for candidate memberships. |

---

## 2. Admin Workflows (Step-by-Step)

### Step 1: Authentication
- Access the admin portal at `/admin/login`.
- Input admin credentials to authenticate.
- Redirects to `/admin` dashboard.

### Step 2: Dashboard Overview
- View aggregated statistics: Total Students, Batches, Active Trainers, Courses, and Pending Enrollments.
- View recent leads and inquiry counts.

### Step 3: Course & Curriculum Management
- **Course Administration**: Create, edit, and delete courses. Specify categories, title, description, and pricing structure.
- **LMS Builder**: Build educational paths under each course:
  - Create **Modules** (structural themes).
  - Create **Chapters** within modules.
  - Create **Topics** within chapters.
  - Upload **Lessons** (supports Video URLs, PDFs, PPTs, or custom text instructions) and attach downloadable resources.

### Step 4: Batch & Trainer Allocation
- Define **Batches** for a specific course (specify mode: Online/Offline/Hybrid, start date, capacity limit).
- Assign an active **Trainer** to manage the batch curriculum.

### Step 5: Student Admission & Enrollment Management
- View pending course admission applications from `/admin/candidates`.
- Review enrollment applications and **Approve / Reject** student admission.
- Move students into specific active batches.

### Step 6: Inquiries & Leads Tracking
- Track leads captured from contact pages and course/fees detail widgets.
- View lists of Course Leads and Fees Leads for direct sales outreach.

---

## 3. Trainer Workflows (Step-by-Step)

### Step 1: Login
- Access the trainer portal at `/trainer-login`.
- Log in with credentials to access `/trainer/sessions`.

### Step 2: Dashboard & Batch Directory
- View allocated batches, course directories, and student enrollment counts.
- View upcoming classes and calendar items.

### Step 3: Session Scheduling (Manual & Auto Google Sync)
- **Schedule Session**:
  - Fill out: Session Title, Date, Start Time, End Time, and Description.
  - (Optional) Paste a custom **Meeting Link** (e.g., Zoom, Teams, or external Google Meet link).
  - Save the session.
- **Automated Sync (if configured)**:
  - If a meeting link is omitted and Google Credentials are set in the system, a background job is queued (`sync_calendar_event`).
  - The job syncs with Google Calendar API, schedules the event, creates a Google Meet link, and updates the database record automatically.

### Step 4: Session Modifications & Cancellations
- **Edit Session**: Adjust titles, timings, dates, or manually update/override the meeting link.
- **Cancel Session**: Change status to `CANCELLED`. This action triggers a background job to:
  - Remove scheduled items from the Google Calendar sync.
  - Send an automated email notification blast to all enrolled students.
- **Delete Session**: Click delete, confirm the prompt, which deletes the record from the database and sends notifications.

### Step 5: Attendance Monitoring
- View past sessions and track student attendance records.

---

## 4. Student Workflows (Step-by-Step)

### Step 1: Student Login
- Authenticate via `/login/student` or `/login/membership`.
- Redirects to the student dashboard (`/profile`).

### Step 2: Dashboard & Class Attendance
- View current enrolled batches, batch details, and active trainers.
- Track attendance rate: Automatically calculated percentage of past sessions marked "Present".
- **Join Live Class**: Under **Upcoming Sessions**, if the class is live/scheduled and the trainer has set a link, click **Join Class** (directs the student to the meet room). If no link is generated yet, displays **Link pending**.

### Step 3: Learning Management System (LMS)
- Access course curriculums via `/profile/courses/[id]`.
- Navigate through modules, chapters, and lessons.
- Play video lectures, read lesson notes, and download study resources.
- Tracks progression dynamically.

### Step 4: Assignment Submissions
- View assigned tasks, homework, and deadlines under the **My Assignments** widget.
- Download assignment templates.
- Upload completed files and add comments.
- View scores and grading feedback returned by the trainer.

### Step 5: AI-Powered Assessment Module
- Once the curriculum is completed, unlock the **Final Assessment**.
- Initiate the assessment to answer questions.
- **AI Grading**: The system automatically evaluates responses against target parameters.
- View progress bars, grading percentages, and download structured **PDF Assessment Reports**.

### Step 6: Peer-to-Peer Community Forum
- Access `/community` page.
- Post recruitment and sourcing questions.
- Search for topics, answer peer queries, and read threads.

---

## 5. Visitor / Candidate Workflows (Step-by-Step)

### Step 1: Browse Public Content
- Access the landing page `/` to read about programs.
- Read educational blogs (`/blogs`) or search FAQs in the public Knowledge Base (`/knowledge`).

### Step 2: Form Submissions (Leads Generation)
- Submit general contact inquiries at `/contact`.
- Request detailed course syllabi or fee structures from course catalog popups.
- Subscribe to the newsletter.

### Step 3: Candidate Membership Registration
- Register for student membership at `/student-membership`.
- Registered candidates can log in via `/candidate-login` to access member pages and apply for advanced training programs.
