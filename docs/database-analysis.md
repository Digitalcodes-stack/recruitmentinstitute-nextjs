# Database Analysis — xgrkfgsh_recruitmentinstitute

**Source:** MySQL 5.7+  
**Target:** PostgreSQL 15+ via Prisma ORM  

---

## Tables Summary

| Table | Rows (est.) | Purpose |
|-------|-------------|---------|
| about_us | <50 | Website about-us content sections |
| answers | variable | Community Q&A answers |
| blog | 25+ | Blog posts with SEO metadata |
| candidate_login | variable | Candidate/student profiles |
| contact_us | variable | Legacy contact submissions |
| cources | variable | Course catalog (misspelled) |
| course_category | 4 | Course categories |
| expert | variable | Expert/instructor profiles |
| faq | variable | FAQs linked to course categories |
| faq_category | variable | FAQ categories |
| fees | variable | Course fee structures |
| fees_vistior | variable | Fees inquiry leads (misspelled) |
| login_membership | variable | Membership registrations |
| login_student | variable | Student registrations |
| questions | variable | Community questions |
| quetion | variable | Knowledge base Q&A (misspelled) |
| registers | variable | Community user registrations |
| reviews | variable | Course reviews/ratings |
| study_with_us | variable | "Study With Us" marketing content |
| subscribe_email | variable | Newsletter subscribers |
| tbl_contactus | variable | Primary contact submissions |
| user_admin | variable | Admin/staff users |
| users | variable | General users (unused) |
| vistior | variable | Course inquiry visitors (misspelled) |

---

## Table Definitions

### about_us
```sql
CREATE TABLE about_us (
  about_us_id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255),
  title VARCHAR(255),
  title1 VARCHAR(255),
  description TEXT,
  created DATETIME
);
```

### answers
```sql
CREATE TABLE answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT,  -- FK → questions.id
  user_id INT,      -- FK → registers.user_id
  answer TEXT,
  created_at DATETIME
);
```

### blog
```sql
CREATE TABLE blog (
  blog_id INT AUTO_INCREMENT PRIMARY KEY,
  blog_title VARCHAR(255),
  title_url VARCHAR(255),           -- SEO slug
  blog_desc TEXT,
  blog_date VARCHAR(50),
  blog_by VARCHAR(100),
  meta_title VARCHAR(255),
  meta_keyword TEXT,
  meta_desc TEXT,
  meta_canonical_href VARCHAR(255),
  item_image VARCHAR(255),
  status TINYINT DEFAULT 1,         -- 1=active, 0=inactive
  created DATETIME
);
```

### candidate_login
```sql
CREATE TABLE candidate_login (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  mobile VARCHAR(20),
  email VARCHAR(255),
  password VARCHAR(255),
  confirm_password VARCHAR(255),
  birthdate DATE,
  gender VARCHAR(10),
  address TEXT,
  streetAddress VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  courseSelect VARCHAR(255),
  comments TEXT,
  accept_signin INT DEFAULT 0,       -- 0=pending, 1=approved
  created_at DATETIME
);
```

### contact_us (legacy)
```sql
CREATE TABLE contact_us (
  contact_us_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  cources VARCHAR(255),
  message TEXT,
  contact_no VARCHAR(20),
  cr_date DATETIME
);
```

### cources (misspelled — courses)
```sql
CREATE TABLE cources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description VARCHAR(5000),
  couses_category_id INT,            -- FK → course_category
  total_stud INT DEFAULT 0,
  rating DECIMAL(3,1),
  review VARCHAR(50),
  course_by VARCHAR(100),
  Date DATE,
  created DATETIME
);
```

### course_category
```sql
CREATE TABLE course_category (
  course_category_id INT AUTO_INCREMENT PRIMARY KEY,
  course_category VARCHAR(255),
  course_href_tag VARCHAR(255),      -- URL slug
  cr_date DATETIME
);
```

### expert
```sql
CREATE TABLE expert (
  e_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  prof VARCHAR(255),                 -- Profession/role
  image VARCHAR(255),
  course_category_id INT             -- FK → course_category
);
```

### faq
```sql
CREATE TABLE faq (
  f_id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT,
  answer TEXT,
  created DATETIME,
  couses_category_id INT             -- FK → course_category
);
```

### faq_category
```sql
CREATE TABLE faq_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255)
);
```

### fees
```sql
CREATE TABLE fees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course VARCHAR(255),
  couses_category_id INT,            -- FK → course_category
  fees DECIMAL(10,2),
  discount DECIMAL(10,2),
  total DECIMAL(10,2),
  fee_total DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  finaltotal DECIMAL(10,2),
  coupouncode VARCHAR(50)
);
```

### fees_vistior (misspelled — fees_visitor)
```sql
CREATE TABLE fees_vistior (
  fv_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  lname VARCHAR(255),
  email VARCHAR(255),
  contact VARCHAR(20),
  visitor_date DATE,
  flag VARCHAR(50),
  created DATETIME
);
```

### login_membership
```sql
CREATE TABLE login_membership (
  m_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  contact VARCHAR(20),
  email VARCHAR(255),
  password VARCHAR(255),            -- MD5 hashed
  re_password VARCHAR(255),
  status TINYINT DEFAULT 0,
  created DATETIME
);
```

### login_student
```sql
CREATE TABLE login_student (
  s_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  contact VARCHAR(20),
  email VARCHAR(255),
  password VARCHAR(255),            -- MD5 hashed
  re_password VARCHAR(255),
  status TINYINT DEFAULT 0,
  created DATETIME
);
```

### questions
```sql
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                       -- FK → registers.user_id
  question TEXT,
  created_at DATETIME
);
```

### quetion (misspelled — knowledge_base)
```sql
CREATE TABLE quetion (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT,
  answer TEXT,
  date VARCHAR(50),
  added_by VARCHAR(100),
  created_at DATETIME
);
```

### registers
```sql
CREATE TABLE registers (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255),
  Mobile VARCHAR(20),
  email VARCHAR(255),
  password VARCHAR(255),            -- bcrypt hashed
  created_at DATETIME
);
```

### reviews
```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  rating INT,
  review VARCHAR(255),
  couses_category_id INT             -- FK → course_category
);
```

### study_with_us
```sql
CREATE TABLE study_with_us (
  study_id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255),
  title VARCHAR(255),
  description TEXT
);
```

### subscribe_email
```sql
CREATE TABLE subscribe_email (
  mail_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  IPaddress INT,
  status TINYINT DEFAULT 1,
  created DATETIME
);
```

### tbl_contactus (primary contact table)
```sql
CREATE TABLE tbl_contactus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  message VARCHAR(2000),
  mobile VARCHAR(20),
  created DATETIME
);
```

### user_admin
```sql
CREATE TABLE user_admin (
  user_admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  m_name VARCHAR(255),               -- Middle name
  l_name VARCHAR(255),               -- Last name
  email VARCHAR(255),
  contact VARCHAR(20),
  password VARCHAR(255),             -- MD5 hashed
  role INT DEFAULT 1,                -- 1=Admin, 2=Accountant, 3=Employee, 4=Purchase Manager, 5=Sales Manager
  image VARCHAR(255),
  status TINYINT DEFAULT 1,          -- 1=active, 0=inactive
  created_at DATETIME
);
```

### users (appears unused)
```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  created_at DATETIME
);
```

### vistior (misspelled — visitor / course_leads)
```sql
CREATE TABLE vistior (
  v_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  lname VARCHAR(255),
  email VARCHAR(255),
  contact VARCHAR(20),
  flag VARCHAR(50),
  created DATETIME
);
```

---

## Relationships

```
course_category (1) ──< cources (many)
course_category (1) ──< expert (many)
course_category (1) ──< faq (many)
course_category (1) ──< fees (many)
course_category (1) ──< reviews (many)
registers (1) ──< questions (many)
registers (1) ──< answers (many)
questions (1) ──< answers (many)
```

---

## Issues Found in Original Schema

1. **Misspelled table names**: `cources`, `quetion`, `vistior`, `fees_vistior`
2. **Duplicate contact tables**: `contact_us` + `tbl_contactus` (use `tbl_contactus`)
3. **Weak password hashing**: MD5 in `login_student`, `login_membership`, `user_admin`
4. **Inconsistent column naming**: `v_id`, `fv_id`, `f_id`, `e_id` vs `id`
5. **Missing explicit foreign key constraints** (relies on application logic)
6. **`services` and `testimonials` tables** referenced in models but absent from SQL dump
7. **`news` table** referenced but absent from SQL dump

---

## PostgreSQL Migration Notes

All table/column names will be cleaned:
- `cources` → `courses`
- `quetion` → `knowledge_items`  
- `vistior` → `course_leads`
- `fees_vistior` → `fees_leads`
- `couses_category_id` → `course_category_id`
- MD5 passwords → bcrypt on migration
- All IDs → serial/bigserial with consistent `id` naming
- Timestamps → `TIMESTAMPTZ`
- Missing tables (services, testimonials, news) → added to Prisma schema
