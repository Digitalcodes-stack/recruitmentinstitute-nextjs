import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import ReviewActions from '@/components/admin/ReviewActions'
import { Star, TrendingUp, Award, BarChart3, Clock } from 'lucide-react'

interface ReviewRow {
  id: number
  title: string
  description: string | null
  rating: number
  review: string | null
  status: string
  category_name: string
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminReviewsPage({ searchParams }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { status: filterStatus = 'all' } = await searchParams

  const rawRows = await prisma.$queryRaw<Array<{
    id: bigint; title: string; description: string | null
    rating: bigint; review: string | null; status: string; category_name: string
  }>>`
    SELECT r.id, r.title, r.description, r.rating, r.review,
           COALESCE(r.status, 'pending') AS status,
           c.course_category AS category_name
    FROM reviews r
    JOIN course_category c ON c.course_category_id = r.course_category_id
    ORDER BY r.id DESC
  `
  const allReviews: ReviewRow[] = rawRows.map((r) => ({
    ...r,
    id: Number(r.id),
    rating: Number(r.rating),
  }))

  const reviews = filterStatus === 'all'
    ? allReviews
    : allReviews.filter((r) => r.status === filterStatus)

  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '0.0'
  const fiveStar = allReviews.filter((r) => r.rating === 5).length
  const categories = [...new Set(allReviews.map((r) => r.category_name))]
  const pendingCount  = allReviews.filter((r) => r.status === 'pending').length
  const approvedCount = allReviews.filter((r) => r.status === 'approved').length
  const rejectedCount = allReviews.filter((r) => r.status === 'rejected').length

  const starColor = (n: number) => (n >= 4 ? '#f59e0b' : n >= 3 ? '#fb923c' : '#ef4444')

  const statusBadge = (s: string) => {
    if (s === 'approved') return { bg: '#f0fdf4', color: '#059669', border: '#6ee7b7', label: 'Approved' }
    if (s === 'rejected') return { bg: '#fff7f7', color: '#dc2626', border: '#fca5a5', label: 'Rejected' }
    return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending' }
  }

  const tabs = [
    { key: 'all',      label: 'All',      count: allReviews.length },
    { key: 'pending',  label: 'Pending',  count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'rejected', label: 'Rejected', count: rejectedCount },
  ]

  return (
    <AdminLayout title="Reviews">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b45309' }}
          >
            <Star style={{ width: 11, height: 11 }} />
            Course Feedback
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Reviews
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Student and candidate course ratings across all categories.
          </p>
        </div>

        {/* stat cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Reviews', value: allReviews.length, icon: BarChart3,  accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Avg Rating',    value: avgRating,          icon: Star,       accent: '#f59e0b', bg: '#fffbeb' },
            { label: '5-Star',        value: fiveStar,           icon: Award,      accent: '#059669', bg: '#f0fdf4' },
            { label: 'Pending',       value: pendingCount,       icon: Clock,      accent: '#b45309', bg: '#fffbeb' },
            { label: 'Categories',    value: categories.length,  icon: TrendingUp, accent: '#7c3aed', bg: '#f5f3ff' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 100 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span className="rounded-full font-semibold" style={{ fontSize: 10, padding: '3px 8px', background: bg, color: accent, border: `1px solid ${accent}22` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const active = filterStatus === tab.key
            return (
              <a
                key={tab.key}
                href={`?status=${tab.key}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '14px 16px', fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? '#2563eb' : '#64748b',
                  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                  textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.15s',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                  background: active ? '#eff6ff' : '#f1f5f9',
                  color: active ? '#2563eb' : '#94a3b8',
                }}>
                  {tab.count}
                </span>
              </a>
            )
          })}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['#', 'Title', 'Description', 'Category', 'Rating', 'Review', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No reviews found.</td>
                </tr>
              ) : reviews.map((r, idx) => {
                const badge = statusBadge(r.status)
                return (
                  <tr key={r.id} style={{ borderBottom: idx < reviews.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a', maxWidth: 180 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>
                        {r.category_name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-1.5">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: starColor(r.rating) }}>
                          <Star style={{ width: 13, height: 13, fill: starColor(r.rating), color: starColor(r.rating) }} />
                          {r.rating}
                        </span>
                        <span style={{ fontSize: 10, color: '#cbd5e1' }}>/5</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.review || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, whiteSpace: 'nowrap' }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ReviewActions id={r.id} status={r.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
