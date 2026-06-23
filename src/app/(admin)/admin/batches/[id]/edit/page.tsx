import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import BatchForm from '@/components/admin/BatchForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBatchPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [batch, courses, trainers] = await Promise.all([
    prisma.batch.findUnique({ where: { id: parseInt(id) } }),
    prisma.course.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } }),
    prisma.trainer.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!batch) notFound()

  return (
    <AdminLayout title="Edit Batch">
      <BatchForm courses={courses} trainers={trainers} batch={batch} />
    </AdminLayout>
  )
}
