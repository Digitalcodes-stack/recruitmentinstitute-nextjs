import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return (
    <AdminLayout title="Add Category">
      <CategoryForm />
    </AdminLayout>
  )
}
