import { redirect, notFound } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import PricingTierForm from '@/components/admin/PricingTierForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPricingTierPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const [tier, categories] = await Promise.all([
    prisma.coursePricingTier.findUnique({ where: { id: parseInt(id) } }),
    prisma.courseCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!tier) notFound()

  return (
    <AdminLayout title="Edit Pricing Tier">
      <PricingTierForm categories={categories} tier={tier} />
    </AdminLayout>
  )
}
