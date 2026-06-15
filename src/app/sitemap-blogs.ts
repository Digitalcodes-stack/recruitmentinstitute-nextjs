import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://recruitmentinstitute.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return blogs.map((blog) => ({
      url: `${BASE_URL}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt ?? blog.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Keep the sitemap route available even if the database is not reachable at build time.
    return []
  }
}
