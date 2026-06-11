import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import ExpertForm from '@/components/admin/ExpertForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditExpertPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [expert, categories] = await Promise.all([
    prisma.expert.findUnique({ where: { id: parseInt(id) } }),
    prisma.courseCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!expert) notFound()

  return (
    <AdminLayout title="Edit Expert">
      <ExpertForm categories={categories} expert={expert} />
    </AdminLayout>
  )
}
