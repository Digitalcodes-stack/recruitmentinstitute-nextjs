# Site Test Report

Date: 2026-06-15
Project: recruitmentinstitute-nextjs

## Scope

I ran a broad site audit against the public routes exposed in `src/app/(site)` and checked the metadata routes exposed by the app.

## What Was Tested

Public routes checked over HTTP:

- `/`
- `/about`
- `/courses`
- `/contact`
- `/blogs`
- `/knowledge`
- `/community`
- `/fees`
- `/candidate-login`
- `/membership-login`
- `/student-login`
- `/profile`
- `/student-membership`
- `/testimonials`
- `/thank-you`
- `/end-to-end-recruitment-training`
- `/hr-courses-for-beginners`
- `/hr-entrepreneurship-program`
- `/hr-corporate-training-course`
- `/sitemap.xml`
- `/sitemap-blogs.xml`
- `/robots.txt`

## Results

### Passed

All of these routes returned successfully:

- `/` -> `200`
- `/about` -> `200`
- `/courses` -> `200`
- `/contact` -> `200`
- `/blogs` -> `200`
- `/knowledge` -> `200`
- `/community` -> `200`
- `/fees` -> `200`
- `/candidate-login` -> `200`
- `/membership-login` -> `200`
- `/student-login` -> `200`
- `/student-membership` -> `200`
- `/testimonials` -> `200`
- `/thank-you` -> `200`
- `/end-to-end-recruitment-training` -> `200`
- `/hr-courses-for-beginners` -> `200`
- `/hr-entrepreneurship-program` -> `200`
- `/hr-corporate-training-course` -> `200`
- `/sitemap.xml` -> `200`
- `/robots.txt` -> `200`

### Needs Attention

- `/sitemap-blogs.xml` -> `404`

### Redirect Observed

- `/profile` -> `307`

## Notes

- The application is serving content correctly for the core public pages.
- The sitemap split advertised in `robots.ts` is incomplete because `/sitemap-blogs.xml` is not resolving.
- I did not perform a full visual browser walkthrough in this session because the browser runtime was not available here.

## Recommendation

- Fix or remove the `/sitemap-blogs.xml` reference so `robots.txt` and the sitemap set are consistent.
- If you want a stricter responsive QA pass, run a browser-based viewport audit on the homepage, About page, and floating chat widget.

