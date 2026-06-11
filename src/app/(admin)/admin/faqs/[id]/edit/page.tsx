import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import FaqForm from '@/components/admin/FaqForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditFaqPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [faq, categories] = await Promise.all([
    prisma.faq.findUnique({ where: { id: parseInt(id) } }),
    prisma.courseCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!faq) notFound()

  return (
    <AdminLayout title="Edit FAQ">
      <FaqForm categories={categories} faq={faq} />
    </AdminLayout>
  )
}
