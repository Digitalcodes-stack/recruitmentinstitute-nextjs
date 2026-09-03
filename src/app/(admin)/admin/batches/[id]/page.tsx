import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import BatchDetail from '@/components/admin/BatchDetail'

import { syncApprovedCandidatesToStudents } from '@/lib/sync-users'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BatchDetailPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const batchId = parseInt(id)

  // Ensure all approved candidates are synchronized into the Student table
  await syncApprovedCandidatesToStudents()

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: { select: { title: true } },
      trainer: { select: { id: true, name: true } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
      sessions: { orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }] },
    },
  })
  if (!batch) notFound()

  const enrolledIds = batch.enrollments.map((e) => e.student.id)
  const availableStudents = await prisma.student.findMany({
    where: { id: { notIn: enrolledIds }, isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  })

  return (
    <AdminLayout title={batch.name}>
      <BatchDetail
        batch={batch}
        enrollments={batch.enrollments}
        sessions={batch.sessions}
        availableStudents={availableStudents}
      />
    </AdminLayout>
  )
}
