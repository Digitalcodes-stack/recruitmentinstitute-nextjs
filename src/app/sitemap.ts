import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://recruitmentinstitute.in'

// Course landing pages — high-priority, manually maintained
const coursePages = [
  { url: `${BASE_URL}/end-to-end-recruitment-training`, priority: 0.95 },
  { url: `${BASE_URL}/hr-courses-for-beginners`, priority: 0.95 },
  { url: `${BASE_URL}/hr-entrepreneurship-program`, priority: 0.95 },
  { url: `${BASE_URL}/hr-corporate-training-course`, priority: 0.95 },
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
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/knowledge`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/student-membership`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/fees`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Course landing pages
  const courseEntries: MetadataRoute.Sitemap = coursePages.map((c) => ({
    url: c.url,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: c.priority,
  }))

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    blogPages = blogs.map((blog) => ({
      url: `${BASE_URL}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt ?? blog.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB not connected during build — blogs served from dynamic route
  }

  return [...staticPages, ...courseEntries, ...blogPages]
}
