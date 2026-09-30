import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import NavSettingsForm from '@/components/admin/NavSettingsForm'

export default async function AdminNavigationPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return (
    <AdminLayout title="Main Navigation">
      <NavSettingsForm />
    </AdminLayout>
  )
}
