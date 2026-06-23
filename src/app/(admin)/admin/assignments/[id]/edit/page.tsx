import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AssignmentForm from '@/components/admin/AssignmentForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAssignmentPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [assignment, batches] = await Promise.all([
    prisma.assignment.findUnique({ where: { id: parseInt(id) } }),
    prisma.batch.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])
  if (!assignment) notFound()

  return (
    <AdminLayout title="Edit Assignment">
      <AssignmentForm batches={batches} assignment={assignment} />
    </AdminLayout>
  )
}
