import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import AssessmentTaker from '@/components/site/AssessmentTaker'

export default async function CourseAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const courseId = parseInt(id)

  return <AssessmentTaker courseId={courseId} />
}
