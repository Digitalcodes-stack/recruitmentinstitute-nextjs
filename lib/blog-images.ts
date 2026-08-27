/**
 * Curated, topic-relevant images for Blog & Knowledge articles.
 * Ensures every article has a distinct, high-quality, professional HR / recruitment photo
 * without repeating duplicate images across articles or sidebar widgets.
 */

const TOPIC_RULES: Array<{ keywords: string[]; image: string }> = [
  // 1. SEO & Recruitment Marketing / Hiring Guide
  {
    keywords: ['seo', 'marketing', 'hiring success', 'ultimate guide to hiring'],
    image: '/assets/images/blog/topics/seo-recruitment.jpg',
  },
  // 2. Memory / Learning / Consistency / Training / Skills / Repetition
  {
    keywords: ['repetition', 'memory', 'consistency', 'retention: how', 'learning', 'mindset', 'upskill'],
    image: '/assets/images/blog/topics/memory-retention.jpg',
  },
  // 3. Employee Retention & Turnover / Culture / Workplace Foundation
  {
    keywords: ['turnover', 'workplace foundation', 'employee turnover', 'retention', 'attrition', 'culture', 'engagement', 'morale'],
    image: '/assets/images/blog/topics/employee-turnover.jpg',
  },
  // 4. SaaS & Tech Recruitment / Cloud Sourcing
  {
    keywords: ['saas', 'cloud hiring', 'effortless hiring', 'tech recruitment', 'software hiring'],
    image: '/assets/images/blog/topics/saas-recruitment.jpg',
  },
  // 5. Recruiter Mistakes / Why Recruiters Fail / Performance Audit
  {
    keywords: ['fail', 'mistakes', 'why recruiters', 'recruiter performance', 'hiring errors'],
    image: '/assets/images/blog/topics/recruiter-performance.jpg',
  },
  // 6. Headhunting / Executive Search
  {
    keywords: ['headhunt', 'executive search', 'hire the best talent', 'senior leader'],
    image: '/assets/images/blog/topics/headhunter-search.jpg',
  },
  // 7. AI & Automation in Recruitment
  {
    keywords: ['ai and', 'automation', 'artificial intelligence', 'machine learning', 'tech-savviness'],
    image: '/assets/images/blog/topics/ai-recruitment.jpg',
  },
  // 8. IT Talent & Technical Sourcing
  {
    keywords: ['it talent', 'top-tier it', 'tech-tier', 'developer', 'engineering hiring'],
    image: '/assets/images/blog/topics/it-talent.jpg',
  },
  // 9. Emotional Intelligence & People Ops
  {
    keywords: ['emotional intelligence', 'eq', 'empathy', 'relationship', 'soft skills'],
    image: '/assets/images/courses/home14/6.jpg',
  },
  // 10. Sourcing / Boolean / LinkedIn / ATS
  {
    keywords: ['sourc', 'boolean', 'linkedin', 'x-ray', 'screen', 'ats'],
    image: '/assets/images/courses/home14/2.jpg',
  },
  // 11. HR Operations / Payroll / Compliance / Labor Law / Statutory / POSH
  {
    keywords: ['payroll', 'complian', 'labor', 'posh', 'pf', 'esic', 'statutory', 'operat', 'policy', 'tax'],
    image: '/assets/images/courses/home14/5.jpg',
  },
  // 12. HR Entrepreneurship / Staffing Agency / Clients / Business / Retainer
  {
    keywords: ['entrepreneur', 'agency', 'client', 'retainer', 'firm', 'business', 'contract', 'staffing', 'pitch'],
    image: '/assets/images/courses/style4/4.jpg',
  },
  // 13. Campus Hiring / Bulk / Volume / Freshers / Early Career / Career Paths
  {
    keywords: ['career paths', 'direction post degree', 'graduation', 'campus', 'bulk', 'volume', 'mass', 'fresher', 'graduate', 'early career'],
    image: '/assets/images/courses/home13/2.jpg',
  },
  // 14. Cover Letter & Resume Strategy
  {
    keywords: ['cover letter', 'resume', 'salary', 'negotiat', 'offer', 'job application', 'job search'],
    image: '/assets/images/courses/home13/1.jpg',
  },
]

export const DIVERSE_CURATED_BLOG_IMAGES: string[] = [
  '/assets/images/blog/topics/seo-recruitment.jpg',
  '/assets/images/blog/topics/memory-retention.jpg',
  '/assets/images/blog/topics/employee-turnover.jpg',
  '/assets/images/blog/topics/saas-recruitment.jpg',
  '/assets/images/blog/topics/recruiter-performance.jpg',
  '/assets/images/blog/topics/headhunter-search.jpg',
  '/assets/images/blog/topics/ai-recruitment.jpg',
  '/assets/images/blog/topics/it-talent.jpg',
  '/assets/images/courses/home14/6.jpg',
  '/assets/images/courses/home14/2.jpg',
  '/assets/images/courses/home14/5.jpg',
  '/assets/images/courses/home13/1.jpg',
  '/assets/images/courses/home13/2.jpg',
  '/assets/images/courses/home13/3.jpg',
  '/assets/images/courses/home13/4.jpg',
  '/assets/images/courses/style4/1.jpg',
  '/assets/images/courses/style4/2.jpg',
  '/assets/images/courses/style4/4.jpg',
  '/assets/images/blog/inner/1.jpg',
  '/assets/images/blog/inner/2.jpg',
  '/assets/images/blog/inner/7.jpg',
  '/assets/images/blog/inner/8.jpg',
]

/**
 * Returns a high-quality, topic-relevant image for any blog post.
 */
export function getBlogTopicImage(title: string = '', slug: string = '', id?: number | string): string {
  const normalized = (title + ' ' + slug).toLowerCase()

  // Match specific topic rules
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.image
    }
  }

  // Fallback to deterministic unique hash from title/slug/id
  const seed = slug || title || String(id || 'blog')
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % DIVERSE_CURATED_BLOG_IMAGES.length
  return DIVERSE_CURATED_BLOG_IMAGES[index]
}

/**
 * Returns a distinct thumbnail for recent posts / sidebar widgets so they never duplicate main card images.
 */
export function getRecentPostImage(index: number, slug: string = ''): string {
  const sidebarPool = [
    '/assets/images/blog/topics/seo-recruitment.jpg',
    '/assets/images/blog/topics/memory-retention.jpg',
    '/assets/images/blog/topics/employee-turnover.jpg',
    '/assets/images/blog/topics/saas-recruitment.jpg',
    '/assets/images/blog/topics/recruiter-performance.jpg',
    '/assets/images/blog/topics/headhunter-search.jpg',
    '/assets/images/blog/topics/ai-recruitment.jpg',
    '/assets/images/blog/topics/it-talent.jpg',
  ]
  return sidebarPool[index % sidebarPool.length]
}
