import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BlogListClient from '@/components/home/BlogListClient'
import { getPaginationData } from '@/utils/pagination'

export const metadata: Metadata = {
  title: 'Blog — HR & Recruitment Insights',
  description:
    'Read expert articles on HR, recruitment strategies, career tips, and industry insights from Recruitment Institute.',
}

export const revalidate = 600

interface Props {
  searchParams: Promise<{ page?: string; s?: string; month?: string }>
}

export default async function BlogsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.s || ''
  const month = params.month || ''
  const limit = 5

  let whereClause: Record<string, unknown> = { isPublished: true }

  if (search) {
    whereClause = {
      ...whereClause,
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  const [blogs, total, recentBlogs] = await Promise.all([
    prisma.blog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.blog.count({ where: whereClause }),
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, publishedAt: true, createdAt: true },
    }),
  ])

  const pagination = getPaginationData(page, limit, total)

  return (
    <BlogListClient
      blogs={blogs}
      recentBlogs={recentBlogs}
      pagination={pagination}
      search={search}
    />
  )
}
