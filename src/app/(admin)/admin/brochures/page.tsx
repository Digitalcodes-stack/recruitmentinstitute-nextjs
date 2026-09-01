import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { COURSE_BROCHURES } from '@/lib/data/course-brochures'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminBrochuresClient from '@/components/admin/AdminBrochuresClient'

export const metadata: Metadata = {
  title: 'Course Brochures & Candidate Dispatch Hub — Admin',
  description: 'Manage and dispatch official course brochures, syllabus PDFs, and demo invitations to candidates.',
}

export default async function AdminBrochuresPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return (
    <AdminLayout title="Course Brochures & Candidate Dispatch">
      <AdminBrochuresClient brochures={COURSE_BROCHURES} />
    </AdminLayout>
  )
}

