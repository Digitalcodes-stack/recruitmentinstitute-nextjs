import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import PricingTierForm from '@/components/admin/PricingTierForm'

interface Props {
  searchParams: Promise<{ categoryId?: string }>
}

export default async function NewPricingTierPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { categoryId } = await searchParams
  const categories = await prisma.courseCategory.findMany({ orderBy: { name: 'asc' } })

  return (
    <AdminLayout title="Add Pricing Tier">
      <PricingTierForm categories={categories} defaultCategoryId={categoryId ? parseInt(categoryId) : undefined} />
    </AdminLayout>
  )
}
