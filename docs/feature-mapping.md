# Feature Mapping — CodeIgniter → Next.js

## Overview

| Layer | CodeIgniter | Next.js |
|-------|-------------|---------|
| Routing | `application/config/routes.php` | `app/` directory (App Router) |
| Controller | `application/controllers/*.php` | `app/api/*/route.ts` + Server Actions |
| Model | `application/models/*.php` | Prisma services in `services/` |
| View | `application/views/**/*.php` | React components in `components/` + `app/` pages |
| Auth | Session + MD5/bcrypt | JWT + NextAuth.js + bcrypt |
| Upload | CodeIgniter upload library | Next.js API routes + sharp |
| Email | CodeIgniter email library | Nodemailer + HTML templates |
| Validation | CodeIgniter form_validation | Zod + React Hook Form |
| Pagination | CodeIgniter pagination library | Custom React pagination component |

---

## Complete Feature Map

### Public Frontend

| CI Feature | CI Location | Next.js Page | Next.js API | Status |
|-----------|-------------|--------------|-------------|--------|
| Home page | `Home::index` | `app/(site)/page.tsx` | — | ✅ |
| About page | `Home::about` | `app/(site)/about/page.tsx` | — | ✅ |
| Course overview | `Home::course_main` | `app/(site)/courses/page.tsx` | — | ✅ |
| Course detail | `Home::course_single` | `app/(site)/courses/[slug]/page.tsx` | — | ✅ |
| Blog listing | `Home::blogpage` | `app/(site)/blogs/page.tsx` | — | ✅ |
| Blog detail | `Home::blog_details` | `app/(site)/blogs/[slug]/page.tsx` | — | ✅ |
| Knowledge base | `Home::knowledge` | `app/(site)/knowledge/page.tsx` | — | ✅ |
| Contact page | `Home::contact` | `app/(site)/contact/page.tsx` | — | ✅ |
| Fees/Cart page | `Home::fees` | `app/(site)/fees/page.tsx` | — | ✅ |
| End-to-End course | `Home::end_to_end_*` | `app/(site)/end-to-end-recruitment-training/page.tsx` | — | ✅ |
| HR Beginners course | `Home::hr_courses_for_beginners` | `app/(site)/hr-courses-for-beginners/page.tsx` | — | ✅ |
| HR Entrepreneurship | `Home::hr_entrepreneurship_program` | `app/(site)/hr-entrepreneurship-program/page.tsx` | — | ✅ |
| HR Corporate Training | `Home::hr_corporate_training_course` | `app/(site)/hr-corporate-training-course/page.tsx` | — | ✅ |
| Community/Q&A | `Chat::index` | `app/(site)/community/page.tsx` | `app/api/community/` | ✅ |
| Student membership | `Home::Student_Membership` | `app/(site)/student-membership/page.tsx` | — | ✅ |
| Candidate login | `Home::loginpage` | `app/(site)/candidate-login/page.tsx` | — | ✅ |
| Student login | `Home::login_student` | `app/(site)/login/student/page.tsx` | — | ✅ |
| Membership login | `Home::log_membership` | `app/(site)/login/membership/page.tsx` | — | ✅ |
| Thank you page | redirect | `app/(site)/thank-you/page.tsx` | — | ✅ |
| Members list | `Home::members` | `app/(site)/members/page.tsx` | — | ✅ |
| Activity page | `Home::activity` | `app/(site)/activity/page.tsx` | — | ✅ |
| Subscriptions | `Home::subscriptions` | `app/(site)/subscriptions/page.tsx` | — | ✅ |
| Candidate profile | `Home::candidateProfile` | `app/(site)/profile/page.tsx` | — | ✅ |

### Form API Endpoints

| CI Action | CI Method | Next.js API Route | Method |
|-----------|-----------|-------------------|--------|
| Contact form | `Home::save_contact_us` | `app/api/contact/route.ts` | POST |
| Course enquiry | `Home::Save_Course_details` | `app/api/inquiries/course/route.ts` | POST |
| Fees enquiry | `Home::Save_fees_details` | `app/api/inquiries/fees/route.ts` | POST |
| Blog visitor | `Home::Save_blog_user_details` | `app/api/blog/visitor/route.ts` | POST |
| Candidate login | `Home::save_signin_details` | `app/api/auth/candidate/login/route.ts` | POST |
| Candidate signup | `Home::save_signup_details` | `app/api/auth/candidate/register/route.ts` | POST |
| Student register | `Home::Save_register_student` | `app/api/auth/student/register/route.ts` | POST |
| Membership register | `Home::Save_register_membership` | `app/api/auth/membership/register/route.ts` | POST |
| Community register | `Home::save_register` | `app/api/auth/community/register/route.ts` | POST |
| Forgot password | `Home::forget_password` | `app/api/auth/forgot-password/route.ts` | POST |
| Reset password | `Home::save_password` | `app/api/auth/reset-password/route.ts` | POST |
| Newsletter subscribe | `Home::Save_subscribe_email` | `app/api/subscribe/route.ts` | POST |
| Post question | `Chat::add_question` | `app/api/community/questions/route.ts` | POST |
| Post answer | `Chat::add_answer` | `app/api/community/answers/route.ts` | POST |
| Search questions | `Chat::search_question` | `app/api/community/search/route.ts` | GET |

### Admin Panel

| CI Feature | CI Controller/Method | Next.js Admin Page | API Route |
|-----------|---------------------|-------------------|-----------|
| Admin login | `Login::check_user_login` | `app/(admin)/admin/login/page.tsx` | `app/api/auth/admin/route.ts` |
| Admin dashboard | `Admin::index` | `app/(admin)/admin/page.tsx` | `app/api/admin/stats/route.ts` |
| Blog list | `Blog::index` | `app/(admin)/admin/blog/page.tsx` | `app/api/admin/blog/route.ts` |
| Add blog | `Blog::add_blog` | `app/(admin)/admin/blog/new/page.tsx` | `app/api/admin/blog/route.ts` POST |
| Edit blog | `Blog::edit_blog` | `app/(admin)/admin/blog/[id]/edit/page.tsx` | `app/api/admin/blog/[id]/route.ts` PUT |
| Delete blog | `Blog::delete_blog` | — | `app/api/admin/blog/[id]/route.ts` DELETE |
| About list | `Admin::about_us` | `app/(admin)/admin/about/page.tsx` | `app/api/admin/about/route.ts` |
| Add about | `Admin::add_about_us` | `app/(admin)/admin/about/new/page.tsx` | POST |
| Edit about | `Admin::edit_about_us` | `app/(admin)/admin/about/[id]/edit/page.tsx` | PUT |
| Course list | `Course::index` | `app/(admin)/admin/courses/page.tsx` | `app/api/admin/courses/route.ts` |
| Add course | `Course::add_course` | `app/(admin)/admin/courses/new/page.tsx` | POST |
| Edit course | `Course::edit_course` | `app/(admin)/admin/courses/[id]/edit/page.tsx` | PUT |
| Delete course | `Course::delete_Course` | — | DELETE |
| Category list | `Course::list_course_category` | `app/(admin)/admin/categories/page.tsx` | `app/api/admin/categories/route.ts` |
| Add category | `Course::add_course_category` | `app/(admin)/admin/categories/new/page.tsx` | POST |
| Edit category | `Course::edit_course_category` | `app/(admin)/admin/categories/[id]/edit/page.tsx` | PUT |
| Fees list | `Course::fees` | `app/(admin)/admin/fees/page.tsx` | `app/api/admin/fees/route.ts` |
| Add fees | `Course::add_fees` | `app/(admin)/admin/fees/new/page.tsx` | POST |
| Edit fees | `Course::edit_fees` | `app/(admin)/admin/fees/[id]/edit/page.tsx` | PUT |
| Reviews list | `Course::reviews` | `app/(admin)/admin/reviews/page.tsx` | `app/api/admin/reviews/route.ts` |
| Expert list | `Course::expert` | `app/(admin)/admin/experts/page.tsx` | `app/api/admin/experts/route.ts` |
| FAQ list | `Faq::faq` | `app/(admin)/admin/faqs/page.tsx` | `app/api/admin/faqs/route.ts` |
| Add FAQ | `Faq::add_faq` | `app/(admin)/admin/faqs/new/page.tsx` | POST |
| Edit FAQ | `Faq::edit_faq` | `app/(admin)/admin/faqs/[id]/edit/page.tsx` | PUT |
| Contact submissions | `Admin::list_contact` | `app/(admin)/admin/contacts/page.tsx` | `app/api/admin/contacts/route.ts` |
| View contact | `Admin::view_contact` | `app/(admin)/admin/contacts/[id]/page.tsx` | GET |
| Knowledge base | `Question::index` | `app/(admin)/admin/knowledge/page.tsx` | `app/api/admin/knowledge/route.ts` |
| Add question | `Question::add_question` | `app/(admin)/admin/knowledge/new/page.tsx` | POST |
| Services | `M_services` | `app/(admin)/admin/services/page.tsx` | `app/api/admin/services/route.ts` |
| Testimonials | `M_testimonials` | `app/(admin)/admin/testimonials/page.tsx` | `app/api/admin/testimonials/route.ts` |
| News | `News_model` | `app/(admin)/admin/news/page.tsx` | `app/api/admin/news/route.ts` |
| Subscribers | — | `app/(admin)/admin/subscribers/page.tsx` | `app/api/admin/subscribers/route.ts` |
| Course leads | — | `app/(admin)/admin/leads/course/page.tsx` | `app/api/admin/leads/route.ts` |
| Fees leads | — | `app/(admin)/admin/leads/fees/page.tsx` | GET |
| Candidate approvals | — | `app/(admin)/admin/candidates/page.tsx` | `app/api/admin/candidates/route.ts` |
| Blog email blast | `Blog::send_responce_mail_subscribe1` | Server Action in blog publish | `app/api/admin/blog/blast/route.ts` |

### Model → Service Mapping

| CI Model | Prisma Model | Service File |
|----------|-------------|--------------|
| `User_model.php` | AdminUser, Student, Membership, Candidate | `services/auth.service.ts` |
| `Blog_model.php` | Blog | `services/blog.service.ts` |
| `Case_model.php` | Course, CourseCategory, CourseFee, CourseReview, Expert | `services/course.service.ts` |
| `M_services.php` | Service | `services/service.service.ts` |
| `M_testimonials.php` | Testimonial | `services/testimonial.service.ts` |
| `M_fees.php` | Faq, CourseFee | `services/faq.service.ts` |
| `Enquiry_model.php` | ContactSubmission, FeesLead | `services/inquiry.service.ts` |
| `News_model.php` | News | `services/news.service.ts` |
| `Contactus_model.php` | ContactSubmission | `services/contact.service.ts` |
| `Candidate_model.php` | Candidate | `services/candidate.service.ts` |
| `Register_model.php` | CommunityUser | `services/community.service.ts` |
| `Chat_model.php` | Question, Answer, CommunityUser | `services/community.service.ts` |
| `Question_model.php` | KnowledgeItem | `services/knowledge.service.ts` |

### View → Component Mapping

| CI View | React Component |
|---------|-----------------|
| `layout/header.php` | `components/layout/Header.tsx` |
| `layout/footer.php` | `components/layout/Footer.tsx` |
| `home/index.php` | `app/(site)/page.tsx` + `components/home/*.tsx` |
| `home/about.php` | `app/(site)/about/page.tsx` |
| `home/course_main.php` | `app/(site)/courses/page.tsx` |
| `home/blogpage.php` | `app/(site)/blogs/page.tsx` |
| `home/blog_details.php` | `app/(site)/blogs/[slug]/page.tsx` |
| `home/contact.php` | `app/(site)/contact/page.tsx` |
| `home/loginpage.php` | `app/(site)/candidate-login/page.tsx` |
| `home/fees.php` | `app/(site)/fees/page.tsx` |
| `home/knowledge.php` | `app/(site)/knowledge/page.tsx` |
| `home/community.php` | `app/(site)/community/page.tsx` |
| Admin views | `app/(admin)/admin/**/*.tsx` |

---

## SEO URL Preservation

| Old URL | New URL | Status |
|---------|---------|--------|
| `/` | `/` | ✅ Preserved |
| `/about` | `/about` | ✅ Preserved |
| `/blogs` | `/blogs` | ✅ Preserved |
| `/blogs/:slug` | `/blogs/:slug` | ✅ Preserved |
| `/contact` | `/contact` | ✅ Preserved |
| `/knowledge` | `/knowledge` | ✅ Preserved |
| `/community` | `/community` | ✅ Preserved |
| `/candidate-login` | `/candidate-login` | ✅ Preserved |
| `/end-to-end-recruitment-training` | `/end-to-end-recruitment-training` | ✅ Preserved |
| `/hr-courses-for-beginners` | `/hr-courses-for-beginners` | ✅ Preserved |
| `/hr-entrepreneurship-program` | `/hr-entrepreneurship-program` | ✅ Preserved |
| `/hr-corporate-training-course` | `/hr-corporate-training-course` | ✅ Preserved |
| `/course_single/:id` | `/courses/:slug` | ⚠️ Redirect added |
