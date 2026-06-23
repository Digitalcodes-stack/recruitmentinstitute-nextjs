import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AssignmentForm from '@/components/admin/AssignmentForm'

export default async function NewAssignmentPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const batches = await prisma.batch.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <AdminLayout title="New Assignment">
      <AssignmentForm batches={batches} />
    </AdminLayout>
  )
}
