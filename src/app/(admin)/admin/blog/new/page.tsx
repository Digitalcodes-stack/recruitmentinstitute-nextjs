import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminBlogForm from '@/components/admin/AdminBlogForm'

export default async function NewBlogPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return <AdminBlogForm />
}
