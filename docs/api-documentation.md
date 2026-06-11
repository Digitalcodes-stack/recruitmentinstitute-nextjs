# API Documentation — Recruitment Institute Next.js

Base URL: `https://recruitmentinstitute.in`

---

## Public APIs

### Contact Form

**POST** `/api/contact`

Request:
```json
{
  "name": "string (min 2)",
  "email": "string (email)",
  "mobile": "string (min 10)",
  "message": "string (min 10, max 2000)"
}
```

Response:
```json
{ "success": true, "message": "Message sent successfully" }
```

---

### Newsletter Subscribe

**POST** `/api/subscribe`

Request:
```json
{ "email": "string (email)" }
```

Response:
```json
{ "success": true, "message": "Subscribed successfully" }
```

---

### Course Enquiry

**POST** `/api/inquiries/course`

Request:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (email)",
  "contact": "string (min 10)"
}
```

Response:
```json
{ "success": true, "msg": 1, "message": "Enquiry submitted successfully" }
```

---

### Fees Enquiry

**POST** `/api/inquiries/fees`

Request:
```json
{
  "firstName": "string",
  "email": "string (email)",
  "contact": "string (min 10)",
  "visitorDate": "string (ISO date, optional)"
}
```

---

## Authentication APIs

### Admin Login

**POST** `/api/auth/admin`

Request:
```json
{ "email": "string", "password": "string" }
```

Response:
```json
{
  "success": true,
  "user": { "id": 1, "name": "Admin", "email": "...", "role": "ADMIN" }
}
```

Sets HttpOnly cookie: `ri_admin_token`

---

### Candidate Login

**POST** `/api/auth/candidate/login`

Request:
```json
{ "email": "string", "password": "string" }
```

---

### Candidate Register

**POST** `/api/auth/candidate/register`

Request:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "birthdate": "date (optional)",
  "gender": "male|female|other (optional)",
  "city": "string (optional)",
  "courseSelect": "string (optional)"
}
```

---

### Forgot Password

**POST** `/api/auth/forgot-password`

Request:
```json
{ "email": "string" }
```

---

### Reset Password

**POST** `/api/auth/reset-password`

Request:
```json
{ "token": "string", "password": "string", "confirmPassword": "string" }
```

---

### Logout

**POST** `/api/auth/logout`

Clears auth cookies.

---

## Community APIs

### List Questions

**GET** `/api/community/questions?page=1&limit=10&q=search`

Response:
```json
{
  "success": true,
  "data": [{ "id": 1, "question": "...", "user": { "name": "..." }, "_count": { "answers": 2 } }],
  "total": 50
}
```

---

### Post Question (requires login)

**POST** `/api/community/questions`

Request:
```json
{ "question": "string (min 10)" }
```

---

### Post Answer (requires login)

**POST** `/api/community/answers`

Request:
```json
{ "questionId": 1, "answer": "string (min 5)" }
```

---

## Admin APIs (requires admin cookie)

### Dashboard Stats

**GET** `/api/admin/stats`

Response:
```json
{
  "success": true,
  "data": {
    "blogs": { "total": 25, "published": 23 },
    "courses": { "total": 4, "categories": 4 },
    "contacts": 150,
    "subscribers": 200,
    "candidates": { "total": 50, "pending": 5 }
  }
}
```

---

### Blog CRUD

- **GET** `/api/admin/blog` — list all blogs
- **POST** `/api/admin/blog` — create blog
- **GET** `/api/admin/blog/[id]` — get single blog
- **PUT** `/api/admin/blog/[id]` — update blog
- **DELETE** `/api/admin/blog/[id]` — delete blog

---

### Contacts

- **GET** `/api/admin/contacts` — list all contact submissions

---

### Candidates

- **GET** `/api/admin/candidates?status=pending|approved|all` — list candidates
- **PATCH** `/api/admin/candidates/[id]` — approve/reject (`{ "acceptSignin": 0|1 }`)
- **DELETE** `/api/admin/candidates/[id]` — delete candidate

---

### Knowledge Base

- **GET** `/api/admin/knowledge` — list all items
- **POST** `/api/admin/knowledge` — create item
- **PUT** `/api/admin/knowledge/[id]` — update item
- **DELETE** `/api/admin/knowledge/[id]` — delete item

---

### Subscribers

- **GET** `/api/admin/subscribers` — list subscribers

---

## Error Responses

All error responses follow:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["validation error"] }
}
```

HTTP Status Codes:
- `400` — Validation error
- `401` — Unauthorized
- `403` — Forbidden (pending approval)
- `404` — Not found
- `409` — Conflict (already exists)
- `500` — Internal server error
