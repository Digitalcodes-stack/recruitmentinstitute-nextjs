import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import TrainerForm from '@/components/admin/TrainerForm'

export default async function NewTrainerPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  return (
    <AdminLayout title="Add Trainer">
      <TrainerForm />
    </AdminLayout>
  )
}
