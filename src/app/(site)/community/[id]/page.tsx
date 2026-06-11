import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QuestionDetailClient from '@/components/home/QuestionDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await prisma.question.findUnique({
    where: { id: parseInt(id) },
    select: { question: true },
  })
  if (!question) return { title: 'Question Not Found' }
  return {
    title: `${question.question.slice(0, 60)}... — Community`,
    description: 'Join the discussion and share your recruiter knowledge.',
  }
}

export const revalidate = 30

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = await params
  const questionId = parseInt(id)

  if (isNaN(questionId)) notFound()

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      user: { select: { name: true, email: true } },
      answers: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { answers: true } },
    },
  })

  if (!question) notFound()

  return <QuestionDetailClient question={question} />
}
