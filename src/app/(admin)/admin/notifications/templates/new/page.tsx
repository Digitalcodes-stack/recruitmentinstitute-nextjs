import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import NotificationTemplateForm from '@/components/admin/NotificationTemplateForm'

export default async function NewNotificationTemplatePage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return (
    <AdminLayout title="New Template">
      <NotificationTemplateForm />
    </AdminLayout>
  )
}
