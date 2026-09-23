import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = 'https://recruitmentinstitute.in'

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

export async function GET() {
  const nowIso = new Date().toISOString()
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const blogList =
      blogs && blogs.length > 0
        ? blogs.map((b) => ({
            slug: b.slug,
            date: (b.updatedAt ?? b.createdAt ?? new Date()).toISOString(),
          }))
        : fallbackBlogSlugs.map((slug) => ({ slug, date: nowIso }))

    const urls = blogList
      .map((blog) => {
        return `  <url>
    <loc>${BASE_URL}/blogs/${blog.slug}</loc>
    <lastmod>${blog.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating /sitemap-blogs.xml:', error)
    const fallbackUrls = fallbackBlogSlugs
      .map((slug) => `  <url>
    <loc>${BASE_URL}/blogs/${slug}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallbackUrls}
</urlset>`

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
}

