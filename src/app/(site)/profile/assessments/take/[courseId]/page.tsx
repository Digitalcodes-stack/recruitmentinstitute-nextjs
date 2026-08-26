import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TestTakingClient from './TestTakingClient'

export const metadata = {
  title: 'Take Assessment',
  robots: { index: false, follow: false },
}

export default async function TakeAssessmentPage(
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { courseId } = await params
  const courseIdNum = parseInt(courseId, 10)

  const course = await prisma.course.findUnique({
    where: { id: courseIdNum },
    select: { title: true }
  })

  if (!course) {
    redirect('/profile')
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <TestTakingClient courseId={courseIdNum} courseTitle={course.title} />
      </div>
    </div>
  )
}
