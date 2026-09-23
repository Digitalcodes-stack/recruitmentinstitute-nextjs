import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = 'https://recruitmentinstitute.in'

// Course landing pages - high-priority, practitioner-led programs
const coursePages = [
  { url: `${BASE_URL}/end-to-end-recruitment-training`, tag: 'degree_tag', priority: 0.95 },
  { url: `${BASE_URL}/hr-courses-for-beginners`, tag: 'certification_tag', priority: 0.95 },
  { url: `${BASE_URL}/hr-entrepreneurship-program`, tag: 'entrepreneur_tag', priority: 0.95 },
  { url: `${BASE_URL}/hr-corporate-training-course`, tag: 'corporate_traning_tag', priority: 0.95 },
  { url: `${BASE_URL}/corporate-recruitment-training`, tag: 'corporate', priority: 0.95 },
  { url: `${BASE_URL}/professional-recruitment-specialist`, tag: 'for-professionals', priority: 0.95 },
  { url: `${BASE_URL}/recruitment-career-starter`, tag: 'for-freshers', priority: 0.95 },
  { url: `${BASE_URL}/advanced-recruitment-ta-masterclass`, tag: 'senior-professionals', priority: 0.95 },
  { url: `${BASE_URL}/recruitment-business-growth-consulting`, tag: 'business-consulting', priority: 0.95 },
  { url: `${BASE_URL}/recruitment-business-accelerator`, tag: 'entrepreneurship', priority: 0.95 },
  { url: `${BASE_URL}/ai-for-recruitment`, tag: 'ai-for-recruitment', priority: 0.95 },
]

// Fallback published blog slugs (ensures sitemap never returns empty blogs during DB cold-start)
const fallbackBlogSlugs = [
  'Creating-a-Successful-Mentorship-Relationship-Dos-and-Don-ts',
  'Impact-of-Skilled-Migration-on-India-s-Economy-and-Workforce-',
  'AI-and-Your-Career-Journey-Maximizing-Opportunities-to-Secure-Your-Dream-Job',
  'Navigating-the-Job-Search-Tips-and-Tricks-to-Get-a-Job-Faster',
  'Mastering-Essential-Recruitment-Skills-A-Comprehensive-Guide-for-HR-Professionals',
  'AI-Powered-Job-Search-Strategies-Finding-Your-Dream-Job-in-the-Digital-Age',
  'Balancing-Work-Life-Integration-During-Career-Path-Progressions',
  '10-Key-Elements-Every-Effective-Resume-Must-Have-Crafting-a-Standout-Professional-Profile',
  'Navigating-Recruitment-Technology-Streamlining-the-Process-with-Tools-and-Platforms',
  'Interview-Ready-Building-a-Personalized-Preparation-Plan-for-Every-Job-Opportunity',
  'Beyond-the-Basics-Advanced-Interview-Preparation-Techniques-for-Career-Advancement',
  'The-Ultimate-Guide-to-Preparing-for-Job-Interviews-Tips-and-Techniques',
  'inside-the-Interviewer-s-Mind-Understanding-What-Employers-Look-for-and-How-to-Prepare-Accordingly',
  'Navigating-the-Talent-Landscape-The-Role-of-Women-in-Identifying-and-Nurturing-Talent',
  'Building-a-Recruitment-Institute-Cultivating-the-Best-Talent-for-Tomorrow-s-Challenges',
  'The-ROI-of-Gender-Equality-Why-Women-Are-Essential-in-Modern-Recruitment',
  'optimizing-Your-Job-Postings-for-Maximum-Visibility-and-Engagement',
  'Flexible-Work-Arrangements-Appealing-to-Top-Talent-with-Work-Life-Balance-Initiatives',
  'The-Power-of-Employee-Referral-Programs-How-to-Encourage-Your-Team-to-Help-Recruit-Top-Talent',
  'The-Future-of-Recruitment-Jobs-in-India--Emerging-Trends-and-Predictions',
  'The-Hidden-Costs-of-Poor-Recruitment--Why-Quality-Matters',
  'The-Power-of-Keywords--Optimizing-Your-Resume-for-Applicant-Tracking-Systems',
  'The-Rise-of-Remote-Work--Impact-on-Recruitment-Strategies-in-the-Indian-Job-Market',
  'The-Role-of-Cover-Letters-in-Your-Job-Application-Strategy',
  'Exploring-Career-Paths--Finding-Your-Direction-Post-Degree',
  '9-Strategies-for-Attracting-Top-tier-IT-Talent',
  'The-Role-of-Emotional-Intelligence-in-Successful-Recruitment',
  'The-Impact-of-AI-and-Automation-on-the-Recruitment-Industry',
  'The-Top-10-Skills-Every-Recruiter-Should-Have-in-2024',
  'How-recruitment-training-impacts-your-recruitment-career',
  'My-first-Blog',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/trainers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/testimonials`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/fees`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/knowledge`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/student-membership`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Fetch real database updatedAt timestamps for courses
  const courseDates: Record<string, Date> = {}
  try {
    const dbCourses = await prisma.course.findMany({
      select: {
        updatedAt: true,
        createdAt: true,
        category: { select: { slug: true } },
      },
    })
    for (const c of dbCourses) {
      if (c.category?.slug) {
        courseDates[c.category.slug] = c.updatedAt ?? c.createdAt ?? now
      }
    }
  } catch {
    // Database fallback
  }

  // Course landing pages with database lastModified
  const courseEntries: MetadataRoute.Sitemap = coursePages.map((c) => ({
    url: c.url,
    lastModified: courseDates[c.tag] || now,
    changeFrequency: 'monthly' as const,
    priority: c.priority,
  }))

  // Dynamic blog pages with database query and fallback
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    if (blogs && blogs.length > 0) {
      blogPages = blogs.map((blog) => ({
        url: `${BASE_URL}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt ?? blog.createdAt ?? now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    } else {
      // Fallback
      blogPages = fallbackBlogSlugs.map((slug) => ({
        url: `${BASE_URL}/blogs/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch {
    // DB offline/cold-start fallback
    blogPages = fallbackBlogSlugs.map((slug) => ({
      url: `${BASE_URL}/blogs/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  return [...staticPages, ...courseEntries, ...blogPages]
}

