import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { CreditCard, Plus, IndianRupee, Tag, TrendingDown } from 'lucide-react'

export default async function AdminFeesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const fees = await prisma.courseFee.findMany({
    include: { category: true },
    orderBy: { id: 'asc' },
  })

  const totalFees   = fees.length
  const avgFee      = fees.length ? (fees.reduce((s, f) => s + Number(f.fees || 0), 0) / fees.length).toFixed(0) : '0'
  const avgDiscount = fees.length ? (fees.reduce((s, f) => s + Number(f.discount || 0), 0) / fees.length).toFixed(0) : '0'

  return (
    <AdminLayout title="Course Fees">
      {/* Page header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#15803d' }}
          >
            <IndianRupee style={{ width: 11, height: 11 }} />
            Pricing Management
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Course Fees
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage course pricing, discounts and final totals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Entries', value: totalFees,     icon: CreditCard,   accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Avg Fee (₹)',   value: `₹${avgFee}`, icon: IndianRupee,  accent: '#059669', bg: '#f0fdf4' },
            { label: 'Avg Discount',  value: `₹${avgDiscount}`, icon: TrendingDown, accent: '#d97706', bg: '#fffbeb' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 120 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Fee Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Fee Schedule</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{totalFees} entries</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['#', 'Course Name', 'Category', 'Fee (₹)', 'Discount (₹)', 'Subtotal (₹)', 'Final Total (₹)', 'Coupon'].map((h) => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>No fee entries found.</td>
                </tr>
              ) : fees.map((f, idx) => (
                <tr key={f.id} style={{ borderBottom: idx < fees.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a', minWidth: 180 }}>{f.courseName}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>{f.category.name}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {f.fees ? `₹${Number(f.fees).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {f.discount ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>-₹{Number(f.discount).toLocaleString('en-IN')}</span>
                    ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>
                    {f.subtotal ? `₹${Number(f.subtotal).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {f.finalTotal ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>₹{Number(f.finalTotal).toLocaleString('en-IN')}</span>
                    ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {f.couponCode ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                        <Tag style={{ width: 10, height: 10 }} />
                        {f.couponCode}
                      </span>
                    ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
