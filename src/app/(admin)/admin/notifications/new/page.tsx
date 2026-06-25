import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import NotificationCampaignForm from '@/components/admin/NotificationCampaignForm'

export default async function NewNotificationPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const [templates, batches] = await Promise.all([
    prisma.notificationTemplate.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    prisma.batch.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, course: { select: { title: true } } } }),
  ])

  return (
    <AdminLayout title="New Campaign">
      <NotificationCampaignForm templates={templates} batches={batches} />
    </AdminLayout>
  )
}
