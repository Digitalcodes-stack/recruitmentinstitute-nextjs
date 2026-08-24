import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { getAssessmentTest, FastApiError } from '@/lib/fastapiClient'
import TestReviewClient from './TestReviewClient'

export const metadata: Metadata = {
  title: 'Assessment Test Review',
  robots: { index: false, follow: false },
}

export default async function AssessmentTestReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let questions = []
  try {
    questions = await getAssessmentTest(studentAssessmentId)
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) notFound()
    throw error
  }

  return (
    <TestReviewClient
      questions={questions}
      studentAssessmentId={studentAssessmentId}
    />
  )
}
