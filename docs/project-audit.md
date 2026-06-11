# Project Audit — Recruitment Institute (CodeIgniter → Next.js Migration)

**Source:** `D:\xampp\htdocs\recruitmentinstitute.in`  
**Framework:** CodeIgniter 3.x (PHP 7.4) + MySQL  
**Audit Date:** 2026-06-05  

---

## 1. Controllers

| File | Methods | Purpose |
|------|---------|---------|
| `Home.php` | 30+ methods | All public-facing pages, forms, login flows |
| `Admin.php` | 10 methods | Admin dashboard, blog & about-us management |
| `Login.php` | 5 methods | Admin authentication, profile update |
| `Course.php` | 20+ methods | Course/category/fees/review/expert CRUD (admin) |
| `Blog.php` | 8 methods | Blog CRUD + subscriber email blast (admin) |
| `Question.php` | 7 methods | Knowledge-base Q&A CRUD (admin) |
| `Chat.php` | 5 methods | Community Q&A (public) |
| `Fees.php` | (blog controller misnamed) | Fees display |
| `Faq.php` | 6 methods | FAQ CRUD (admin) |

### Home.php — Complete Method List

| Method | Route | Purpose |
|--------|-------|---------|
| `index()` | GET / | Homepage with course categories |
| `about()` | GET /about | About page with team/mission/vision |
| `Student_Membership()` | GET /student_membership | Student membership page |
| `student_membership_community()` | GET /student_membership_community | Membership community |
| `topic1()` | GET /topic1 | Topic listing page |
| `topic_details()` | GET /topic_details | Topic detail |
| `members()` | GET /members | Member listing |
| `subscriptions()` | GET /subscriptions | Subscription management |
| `activity()` | GET /activity | User activity |
| `candidateProfile()` | GET /candidateProfile | Candidate profile dashboard |
| `knowledge()` | GET /knowledge | Knowledge base listing |
| `knowledges($page)` | GET /knowledges/:page | Knowledge pagination |
| `loginpage()` | GET /candidate-login | Login/signup page |
| `login_student()` | GET /home/login_student | Student login page |
| `log_membership()` | GET /home/login_membership | Membership login page |
| `check_user_login_check_candidate()` | POST | Validate student login |
| `check_member_login_check_candidate()` | POST | Validate membership login |
| `blogpage()` | GET /blogs | Blog listing with search & month filter |
| `blog_details($url)` | GET /blogs/:slug | Blog detail page |
| `Save_blog_user_details()` | POST | Blog visitor registration |
| `course()` | GET /courses | Course listing |
| `course_main()` | GET /course_main | Course overview page |
| `course_single($id)` | GET /course_single/:id | Course detail by category ID |
| `course_view($id)` | GET /course_view/:id | Course view |
| `Save_Course_details()` | POST | Course inquiry (AJAX) |
| `Save_fees_details()` | POST | Fees/booking inquiry |
| `contact()` | GET /contact | Contact page |
| `save_contact_us()` | POST | Save contact form |
| `save_register()` | POST | Community registration (bcrypt) |
| `save_signin_details()` | POST | Candidate sign-in |
| `save_signup_details()` | POST | Extended candidate sign-up |
| `accept_signin($id)` | GET | Approve candidate sign-in |
| `forget_password()` | POST | Initiate password reset |
| `save_password()` | POST | Complete password reset |
| `Save_register_student()` | POST | Student registration |
| `Save_register_membership()` | POST | Membership registration |
| `Save_subscribe_email()` | POST | Newsletter subscription |

---

## 2. Models

| File | Table(s) | Key Methods |
|------|----------|-------------|
| `User_model.php` | user_admin, about_us, login_student, candidate_login, login_membership | login_check, CRUD for admin/about |
| `Blog_model.php` | blog | list, search, paginate, filter by month, CRUD |
| `Case_model.php` | cources, course_category, fees, reviews, expert, vistior, fees_vistior | all course-related CRUD + enquiries |
| `M_services.php` | services, services_navigation | services CRUD |
| `M_testimonials.php` | testimonials | testimonial CRUD |
| `M_fees.php` | faq, course_category | FAQ CRUD |
| `Enquiry_model.php` | faq, tbl_contactus, fees_vistior | FAQ + contact management |
| `News_model.php` | news | news CRUD |
| `Contactus_model.php` | tbl_contactus | contact submission |
| `Candidate_model.php` | candidate_login | candidate management, password reset |
| `Register_model.php` | registers | community user registration |
| `Chat_model.php` | questions, answers, registers | Q&A with joins |
| `Question_model.php` | quetion | knowledge base Q&A |

---

## 3. Views

### Frontend (home/)
| View | Route | Data Variables |
|------|-------|----------------|
| `index.php` | / | Static + modal enquiry form |
| `about.php` | /about | `$list_user` (about_us rows) |
| `course_main.php` | /course_main | Static course cards |
| `course_single.php` | /course_single/:id | `$list_user`, `$list_category`, `$list_fees`, `$list_reviews`, `$list_expert` |
| `blogpage.php` | /blogs | `$list_user`, `$pagination`, `$blog_months` |
| `blog_details.php` | /blogs/:slug | `$blog` (single post + SEO meta) |
| `contact.php` | /contact | Static + contact form |
| `fees.php` | /fees | Fees/cart display |
| `loginpage.php` | /candidate-login | Login + forgot password + signup modals |
| `login_student.php` | /home/login_student | Student login |
| `login_membership.php` | /home/login_membership | Membership login |
| `knowledge.php` | /knowledge | `$list_user` (questions) |
| `community.php` | /community | `$list_user` (Q&A), `$pagination` |
| `candidateProfile.php` | /candidateProfile | Session-based profile |
| `members.php` | /members | Member listing |
| `hr_*` pages | /hr-*/ | Static HR course pages |
| `thankyou_signin.php` | /thankyou | Sign-in confirmation |

### Admin (admin/)
| Section | Views | Features |
|---------|-------|----------|
| Dashboard | `home/index.php` | Stats, role display |
| Blog | `blog/index.php`, `add_blog.php`, `edit_blog.php` | Blog CRUD |
| About | `about/index.php`, `add_about_us.php`, `edit_about_us.php` | About management |
| Courses | `course/index.php`, `add_course.php`, `edit_course.php` | Course CRUD |
| Course Categories | `course/add_course_category.php`, `list_course_category.php` | Category management |
| Fees | `course/add_fees.php`, `edit_fees.php`, list | Fees management |
| Reviews | `course/reviews.php`, `add_reviews.php`, `edit_reviews.php` | Review management |
| Experts | `course/expert.php`, `add_expert.php`, `edit_expert.php` | Expert management |
| FAQ | `faq/add_faq.php`, `list_faq.php`, `edit_faq.php` | FAQ CRUD |
| Contact | `enquiry/list_contact.php`, `view_contact.php` | Contact submissions |
| Questions | `question/index.php`, `add_question.php`, `edit_question.php` | Knowledge base |
| Services | `services/` | Services management |
| Testimonials | `testimonials/` | Testimonial management |
| News | `news/` | News management |

### Email Templates (email/, mail/)
- `course_enquiry.php` — Course enquiry notification
- `user_register.php` — Registration confirmation
- `admin_enquiry.php` — Admin notification of new enquiry
- `membership.php` — Membership welcome
- `blog_send.php` — Blog subscriber notification
- `subscribe.php` — Newsletter confirmation
- `forgot_password.php` — Password reset
- `signin_acceptance.php` — Sign-in approval
- `contact_us.php` — Contact form acknowledgment

---

## 4. Routes

```
/                           → Home::index
/about                      → Home::about
/blogs                      → Home::blogpage
/blogs/:slug                → Home::blog_details
/contact                    → Home::contact
/course_main                → Home::course_main
/course_single/:id          → Home::course_single
/knowledge                  → Home::knowledge
/knowledges/:page           → Home::knowledges
/candidate-login            → Home::loginpage
/community                  → Chat::index
/student_membership         → Home::Student_Membership
/topic1                     → Home::topic1
/members                    → Home::members
/activity                   → Home::activity
/subscriptions              → Home::subscriptions
/end-to-end-recruitment-training  → Home::end_to_end_recruitment_training_course
/hr-courses-for-beginners   → Home::hr_courses_for_beginners
/hr-entrepreneurship-program → Home::hr_entrepreneurship_program
/hr-corporate-training-course → Home::hr_corporate_training_course
```

---

## 5. Forms

| Form | Action | Fields | Method |
|------|--------|--------|--------|
| Enquire Now (modal) | Home/save_contact_us | name, email, mobile, message, captcha | POST |
| Contact Page | Home/save_contact_us | name, email, mobile, message, hidden_field, captcha | POST |
| Blog Visitor | Home/Save_blog_user_details | name, lname, email, contact | POST (AJAX) |
| Course Enquiry | Home/Save_Course_details | name, lname, email, contact | POST (AJAX) |
| Fees Enquiry | Home/Save_fees_details | name, email, contact, course | POST |
| Candidate Login | Home/save_signin_details | email, password | POST |
| Candidate Signup | Home/save_signup_details | name, email, password, confirmPassword, birthdate, gender, address, city, state, zip, phone, courseSelect, comments, captcha | POST |
| Forgot Password | Home/forget_password | email | POST |
| Newsletter | Home/Save_subscribe_email | email | POST |
| Student Registration | Home/Save_register_student | name, contact, email, password, re_password | POST |
| Membership Registration | Home/Save_register_membership | name, contact, email, password, re_password | POST |
| Community Registration | Home/save_register | (bcrypt) | POST |
| Admin Login | Login/check_user_login | email, password (MD5) | POST |

---

## 6. AJAX Requests

| Function | URL | Method | Fields | Response |
|----------|-----|--------|--------|----------|
| `form_submission_p()` | home/Save_Course_details | POST | name, lname, email, contact | JSON {msg: 1/0} |
| Blog modal | home/Save_blog_user_details | POST | name, lname, email, contact | JSON |
| Admin budget approval | expenses/approval_budjet | POST | project_id, extended_status_request | HTML |

---

## 7. Business Logic

### Authentication Flows
1. **Admin login**: MD5 password hash check → set session (user_id, user_name, user_role)
2. **Student login**: MD5 hash → set session (candidate_user_name)  
3. **Membership login**: MD5 hash → set session
4. **Community login**: bcrypt → session
5. **Candidate sign-in**: Email+password → check `accept_signin` flag → session

### Password Reset Flow
1. User submits email → check `candidate_login` table → send reset email
2. Email contains link with user ID → user submits new password → update DB

### Blog Flow
1. List with pagination (5 per page) + search by title/description
2. Filter by month (GET param)
3. On new blog publish → email all `subscribe_email` subscribers

### Course Enquiry Flow
1. AJAX POST → insert into `vistior` table → send email to admin + user

### Course Booking Flow
1. POST fees → insert into `fees_vistior` → send email

---

## 8. User Workflows

### Public User
1. Browse courses → click Enquire Now → fill modal form → receive confirmation email
2. Read blog → optionally register to get updates
3. Browse knowledge base (paginated Q&A)
4. Contact via form → receive auto-reply email
5. Subscribe to newsletter

### Candidate/Student
1. Register via Signup form → pending approval
2. Admin approves → student can login
3. Login → access profile, community, subscriptions

### Community Member
1. Register → login → post questions → answer others

### Admin
1. Login → manage blogs, courses, categories, fees, reviews, experts
2. View contact submissions
3. Manage FAQs, testimonials, services, news
4. Approve candidate sign-ins

---

## 9. Security Notes (to fix in Next.js)

- MD5 password hashing → replace with bcrypt
- Plain text passwords in email bodies → remove
- No CSRF tokens on forms → add
- No rate limiting → add
- Hardcoded credentials in config → move to env
- Development mode in production → fix with env vars
- No input sanitization beyond CodeIgniter's XSS filter → add Zod validation
