import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import FaqForm from '@/components/admin/FaqForm'

export default async function NewFaqPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const categories = await prisma.courseCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <AdminLayout title="Add FAQ">
      <FaqForm categories={categories} />
    </AdminLayout>
  )
}
