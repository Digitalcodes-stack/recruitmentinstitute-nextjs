import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import CategoryForm from '@/components/admin/CategoryForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const category = await prisma.courseCategory.findUnique({ where: { id: parseInt(id) } })
  if (!category) notFound()

  return (
    <AdminLayout title="Edit Category">
      <CategoryForm category={category} />
    </AdminLayout>
  )
}
