# SEO Existing Audit — Recruitment Institute (CodeIgniter)

**Audit Date:** 2026-06-05  
**Source:** `D:\xampp\htdocs\recruitmentinstitute.in`  
**Auditor:** Claude Code (Automated)

---

## 1. Site Overview

| Property | Value |
|---|---|
| Domain | https://recruitmentinstitute.in |
| Platform | CodeIgniter (PHP) |
| Pages Indexed (from sitemap) | 40+ URLs |
| Sitemap URL | /sitemap.xml |
| Robots.txt | Not present (using .htaccess only) |

---

## 2. Meta Tags Audit

### Global Header (`application/views/layout/header.php`)

| Element | Status | Value / Issue |
|---|---|---|
| `<title>` | STATIC / POOR | Hard-coded: `"Recruitment Training in India | Institute"` — same on every page |
| `<meta charset>` | OK | UTF-8 |
| `<meta viewport>` | OK | `width=device-width, initial-scale=1.0` |
| `<meta description>` | MISSING | No global default — only conditionally output for blog detail pages |
| `<meta keywords>` | MISSING | No global default |
| `<meta canonical>` | MISSING | No canonical tags anywhere |
| OpenGraph `og:title` | MISSING | Not present |
| OpenGraph `og:description` | MISSING | Not present |
| OpenGraph `og:image` | MISSING | Not present |
| OpenGraph `og:url` | MISSING | Not present |
| Twitter Card | MISSING | Not present |
| `<link rel="icon">` | PARTIAL | favicon.ico linked; `apple-touch-icon` uses wrong HTML (links to .html) |
| `hreflang` | NOT APPLICABLE | Site is English-only |

### Blog Detail Pages (conditional meta via `$blog` object)

| Element | Status | Notes |
|---|---|---|
| `meta_title` | Present (conditional) | Output as `name="meta_title"` — WRONG attribute (should be `name="title"` or use `<title>`) |
| `meta_desc` | Present (conditional) | Output as `name="meta_desc"` — WRONG attribute (should be `name="description"`) |
| `meta_keyword` | Present (conditional) | Output as `name="meta_keyword"` — WRONG attribute |
| `meta_canonical_href` | Present (conditional) | Output as `name="meta_canonical_href"` — should be `<link rel="canonical">` |

**Critical Bug:** All blog meta tags are output with wrong `name=` attributes. Google ignores `<meta name="meta_desc">` — the correct format is `<meta name="description">`. This means **no blog page is passing meta descriptions to Google**.

---

## 3. Structured Data / Schema Audit

| Schema Type | Status |
|---|---|
| Organization | MISSING |
| LocalBusiness | MISSING |
| EducationalOrganization | MISSING |
| Course | MISSING |
| FAQ | MISSING |
| Breadcrumb | MISSING |
| Article / BlogPosting | MISSING |
| WebSite + SearchAction | MISSING |
| ContactPage | MISSING |
| Review / AggregateRating | MISSING |
| Person / Author | MISSING |

**All schema markup is completely absent** from the CodeIgniter site.

---

## 4. URL Structure Audit

### Static Pages

| Old URL | Type | SEO Friendly? |
|---|---|---|
| `/` | Home | Yes |
| `/home/about` | About | NO — CI controller prefix |
| `/home/course_main` | Courses List | NO |
| `/home/course_single/1` | Course (by numeric ID) | NO — no keyword slug |
| `/home/blogpage` | Blog List | NO |
| `/home/blog_details/{id}` | Blog Detail (by numeric ID) | NO — no keyword slug |
| `/home/contact` | Contact | NO |
| `/home/login_student/` | Student Login | NO |
| `/home/login_membership/` | Membership Login | NO |
| `/home/knowledge` | Knowledge Base | NO |

### Course Landing Pages (via CI routes in header nav)

| Old URL | Routed To |
|---|---|
| `/end-to-end-recruitment-training` | `home/end_to_end_recruitment_training` |
| `/hr-courses-for-beginners` | `home/hr_courses_for_beginners` |
| `/hr-entrepreneurship-program` | `home/hr_entrepreneurship_program` |
| `/hr-corporate-training-course` | `home/hr_corporate_training_course` |

These course landing page slugs are SEO-friendly and must be preserved 1:1 in Next.js.

### Blog URLs (by ID in sitemap)

Sitemap shows blog IDs: 7, 11, 12, 13, 14, 15, 18, 25–53 (gaps indicate deleted posts).  
Blog detail: `/home/blog_details/{id}` — numeric IDs, not keyword slugs.

The `Blog.save()` controller generates a `title_url` slug from the blog title. New URLs in Next.js use `/blogs/{slug}`. Redirects from old numeric IDs to slug-based URLs are required.

---

## 5. Sitemap Audit

**File:** `/sitemap.xml` (static, manually generated)

| Issue | Detail |
|---|---|
| Generator | Free Online Sitemap Generator (xml-sitemaps.com) — not dynamic |
| Last Modified | 2024-06-11 — outdated |
| Blog URLs | Uses `/home/blog_details/{id}` — numeric, no slugs |
| Missing | Course landing pages not in sitemap |
| Missing | Images sitemap |
| Missing | Sitemap index |
| Missing | News sitemap |
| Duplicate | `/home/login_student/` and `/home/login_student/index.html` both present |
| Duplicate | `/home/login_membership/` and `/home/login_membership/index.html` both present |

---

## 6. Robots.txt Audit

**Status:** NOT PRESENT  
No `robots.txt` file exists in the project root. The `.htaccess` handles some URL rewriting but there are no crawler directives. This means:
- Admin panel (`/Admin`, `/Course`, `/Blog`, `/Login`, `/Faq` controllers) is crawlable
- No sitemap referenced for crawlers

---

## 7. .htaccess SEO Rules

**File:** `.htaccess`

| Rule | Purpose | Migration Status |
|---|---|---|
| `RewriteEngine On` (CI routing) | Routes all requests through `index.php` | Replaced by Next.js routing |
| `mod_deflate` (GZIP compression) | Compress HTML/CSS/JS | Next.js handles via Vercel/server config |
| `mod_expires` (Browser caching) | Cache images for 1 year, CSS/JS 1 month | Replicated via `next.config.ts` headers |
| `mod_headers` Cache-Control | Public caching for static assets | Replicated via `next.config.ts` headers |
| `Keep-Alive` | Connection persistence | Server-level config |
| `ETag None` | Disable ETags | Server-level config |
| `RedirectMatch 404 ^/favicon.ico$` | Prevent 404 crawl errors | Handled by Next.js favicon in `public/` |
| Remove query strings from static assets | `R=301` redirect to clean URLs | Next.js does not serve querystrings on static assets |

**No 301/302 redirect rules** found in `.htaccess` — all navigation redirects are handled via PHP `redirect()` calls.

---

## 8. Internal Linking Audit

| Finding | Detail |
|---|---|
| Navigation | Header nav has: Home, About, Courses (dropdown), Knowledge, Blog, Contact, Login, Community |
| Course dropdown | 4 course links — SEO-friendly slugs |
| Blog sidebar | "Recent Posts" widget — 5 recent blogs linked by `title_url` slug |
| Footer links | Not analyzed (footer.php not read) — assumed basic links |
| Breadcrumbs | NOT PRESENT — no breadcrumb trail on any page |
| Related Content | No "related courses" or "related blogs" cross-linking |

---

## 9. Image SEO Audit

| Finding | Detail |
|---|---|
| Blog images | `alt` text = blog title (OK) |
| Blog images | `title` attribute = blog title (OK) |
| Course images | `alt=""` empty (MISSING alt text) |
| Logo | `alt="Logo"` — generic (should be "Recruitment Institute Logo") |
| Format | All JPG/PNG — no WebP/AVIF |
| Size optimization | Unknown — no image optimization pipeline |
| Image sitemap | MISSING |

---

## 10. Heading Structure Audit

| Page | H1 | H2 | Issue |
|---|---|---|---|
| Home | `Learning Recruitment Skills & Upgrade Your Life` | Multiple H2s | H1 present, good |
| Home | — | `With India No.1 Recruitment Training Institute` | H2 as marketing subheading — acceptable |
| Blog List | NOT SEEN | — | Needs verification |
| Blog Detail | Blog title in `<h3>` not `<h1>` | — | WRONG — blog title should be H1 |
| Courses | — | — | Needs verification |

**Key issue:** Blog detail page uses `<h3>` for the blog title (`blog-title` CSS class). This is a major SEO error — the primary content heading must be `<h1>`.

---

## 11. Page Speed / Core Web Vitals (Estimated)

| Issue | Impact |
|---|---|
| No image optimization (JPG/PNG, no WebP) | High LCP impact |
| No lazy loading on images | High LCP impact |
| Multiple render-blocking CSS files (7+ in header) | High FCP impact |
| jQuery + Bootstrap + multiple JS libraries | High INP impact |
| No font preloading | CLS risk |
| AOS animation library (aos.js) loaded globally | Minor INP impact |
| No CDN / caching layer evident | High TTFB impact |

---

## 12. Key SEO Issues Summary

### Critical
1. Meta title is static on all pages — no unique titles per page
2. Blog meta tags use wrong `name=` attributes — Google receives no meta descriptions
3. No canonical tags anywhere — duplicate content risk
4. No `robots.txt` — admin/API crawlable
5. Blog H1 uses `<h3>` tag — wrong heading hierarchy

### High Priority
6. No schema markup of any kind
7. No OpenGraph or Twitter Card tags
8. Sitemap is static/outdated — does not include new blog posts or course pages
9. Blog URLs are numeric IDs (`/home/blog_details/53`) — not keyword slugs
10. Course pages not in sitemap

### Medium Priority
11. Empty `alt` text on course images
12. No breadcrumbs
13. No internal related-content linking
14. No image optimization (WebP/AVIF)
15. No image sitemap

### Low Priority
16. `apple-touch-icon` links to `.html` file (broken)
17. Logo alt text is generic "Logo"
18. Archive links in blog sidebar are static placeholder text
