import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getPaginationData, buildPaginationPages } from '@/utils/pagination'
import CommunityClient from '@/components/home/CommunityClient'

export const metadata: Metadata = {
  title: 'Community — HR Q&A Forum',
  description:
    'Join the Recruitment Institute community. Ask questions, share knowledge, and connect with HR professionals and recruiters.',
}

export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function CommunityPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const query = params.q || ''
  const limit = 4

  const where = query
    ? { question: { contains: query, mode: 'insensitive' as const } }
    : {}

  const [questions, total, stats] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { answers: true } },
      },
    }),
    prisma.question.count({ where }),
    prisma.$transaction([
      prisma.question.count(),
      prisma.communityUser.count(),
    ]),
  ])

  const pagination = getPaginationData(page, limit, total)
  const pages = buildPaginationPages(pagination.page, pagination.totalPages)

  return (
    <CommunityClient
      questions={questions}
      pagination={pagination}
      pages={pages}
      query={query}
      totalQuestions={stats[0]}
      totalMembers={stats[1]}
    />
  )
}
