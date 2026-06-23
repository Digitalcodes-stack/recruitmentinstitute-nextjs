import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CoursePlayer from '@/components/site/CoursePlayer'

export const metadata: Metadata = {
  title: 'My Course',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentCoursePage({ params }: Props) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const courseId = parseInt(id)

  const enrolled = await prisma.enrollment.findFirst({ where: { studentId: session.userId, batch: { courseId } } })
  if (!enrolled) notFound()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 20 }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Profile
      </Link>
      <CoursePlayer courseId={courseId} />
    </div>
  )
}
