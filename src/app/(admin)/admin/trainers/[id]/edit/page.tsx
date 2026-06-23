import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import TrainerForm from '@/components/admin/TrainerForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTrainerPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const trainer = await prisma.trainer.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true, name: true, email: true, phone: true, specialization: true,
      bio: true, image: true, isActive: true,
    },
  })
  if (!trainer) notFound()

  return (
    <AdminLayout title="Edit Trainer">
      <TrainerForm trainer={trainer} />
    </AdminLayout>
  )
}
