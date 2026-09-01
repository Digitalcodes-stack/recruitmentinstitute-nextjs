import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminContactsClient from '@/components/admin/AdminContactsClient'

export default async function AdminContactsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <AdminLayout title="Contact Submissions & Voice Leads">
      <AdminContactsClient initialContacts={contacts} />
    </AdminLayout>
  )
}

