import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import CurriculumBuilder from '@/components/admin/CurriculumBuilder'
import { ArrowLeft, GraduationCap } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CourseCurriculumPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const courseId = parseInt(id)
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } })
  if (!course) notFound()

  return (
    <AdminLayout title="Curriculum">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/admin/courses" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Courses
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="inline-flex items-center gap-2 rounded-full mb-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <GraduationCap style={{ width: 11, height: 11 }} />
          LMS Curriculum
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{course.title}</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          Build the course as Modules → Chapters → Topics → Lessons. Attach resources to any lesson.
        </p>
      </div>

      <CurriculumBuilder courseId={course.id} />
    </AdminLayout>
  )
}
