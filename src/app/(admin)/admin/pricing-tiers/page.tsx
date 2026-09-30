import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { IndianRupee, Plus, Star } from 'lucide-react'
import PricingTierActions from '@/components/admin/PricingTierActions'

interface Props {
  searchParams: Promise<{ categoryId?: string }>
}

export default async function AdminPricingTiersPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { categoryId } = await searchParams
  const filterCategoryId = categoryId ? parseInt(categoryId) : undefined

  const [tiers, filteredCategory] = await Promise.all([
    prisma.coursePricingTier.findMany({
      where: filterCategoryId ? { categoryId: filterCategoryId } : undefined,
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    }),
    filterCategoryId
      ? prisma.courseCategory.findUnique({ where: { id: filterCategoryId } })
      : Promise.resolve(null),
  ])

  return (
    <AdminLayout title="Pricing Tiers">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#15803d' }}>
            <IndianRupee style={{ width: 11, height: 11 }} />
            Multi-Tier Pricing
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Pricing Tiers
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {filteredCategory
              ? <>Showing pricing tiers for <strong style={{ color: '#334155' }}>{filteredCategory.name}</strong>. <Link href="/admin/pricing-tiers" style={{ color: '#2563eb', fontWeight: 600 }}>View all</Link></>
              : 'Named pricing plans (e.g. Launch / Incubator / Accelerator) shown on multi-tier program pages.'}
          </p>
        </div>

        <Link
          href={filterCategoryId ? `/admin/pricing-tiers/new?categoryId=${filterCategoryId}` : '/admin/pricing-tiers/new'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Add Pricing Tier
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {tiers.length === 0 ? (
          <div style={{ padding: '72px 32px', textAlign: 'center' as const }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IndianRupee style={{ width: 22, height: 22, color: '#cbd5e1' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No pricing tiers found.</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Pricing tier entries will appear here once added.</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr 160px 120px 160px' }}>
              {['Plan Name', 'Price Range', 'Category', 'Highlighted', 'Actions'].map((col) => (
                <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
              ))}
            </div>
            <div>
              {tiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 120px 160px', alignItems: 'center', padding: '18px 24px', borderBottom: idx < tiers.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{tier.name}</span>
                    {tier.duration && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{tier.duration}</div>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{tier.priceRange}</div>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                      {tier.category?.name || '—'}
                    </span>
                  </div>
                  <div>
                    {tier.isHighlighted && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        <Star style={{ width: 10, height: 10 }} /> Recommended
                      </span>
                    )}
                  </div>
                  <PricingTierActions id={tier.id} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
