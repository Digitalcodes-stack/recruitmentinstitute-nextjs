import { Metadata } from 'next'
import { COURSE_BROCHURES } from '@/lib/data/course-brochures'
import AdminBrochuresClient from '@/components/admin/AdminBrochuresClient'

export const metadata: Metadata = {
  title: 'Course Brochures & Candidate Dispatch Hub — Admin',
  description: 'Manage and dispatch official course brochures, syllabus PDFs, and demo invitations to candidates.',
}

export default function AdminBrochuresPage() {
  return <AdminBrochuresClient brochures={COURSE_BROCHURES} />
}
