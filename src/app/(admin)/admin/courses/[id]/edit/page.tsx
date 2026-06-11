import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import CourseForm from '@/components/admin/CourseForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: parseInt(id) } }),
    prisma.courseCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!course) notFound()

  return (
    <AdminLayout title="Edit Course">
      <CourseForm categories={categories} course={{
        ...course,
        rating: course.rating ? Number(course.rating) : null,
      }} />
    </AdminLayout>
  )
}
