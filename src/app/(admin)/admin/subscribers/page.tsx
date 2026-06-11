import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Mail, Users } from 'lucide-react'

export default async function AdminSubscribersPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
  const active   = subscribers.filter((s) => s.isActive).length
  const inactive = subscribers.filter((s) => !s.isActive).length

  return (
    <AdminLayout title="Subscribers">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#2563eb' }}>
            <Users style={{ width: 11, height: 11 }} />
            Newsletter Subscribers
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Subscribers
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            View newsletter subscribers and delivery status.
          </p>
        </div>

        {/* Stat mini-cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: subscribers.length, accent: '#2563eb', bg: '#eff6ff', bdr: '#bfdbfe' },
            { label: 'Active',   value: active,             accent: '#059669', bg: '#f0fdf4', bdr: '#bbf7d0' },
            { label: 'Inactive', value: inactive,           accent: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
          ].map(({ label, value, accent, bg, bdr }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 90 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${bdr}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e8ecf0', borderRadius: 20, padding: '72px 32px', textAlign: 'center' as const }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No subscribers yet.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Subscriber List</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subscribers.length} total subscribers</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#fff', border: '1px solid #e8ecf0', color: '#64748b' }}>
              {active} active
            </span>
          </div>

          {/* Column headers */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'grid', gridTemplateColumns: '1fr 140px 120px' }}>
            {['Email', 'Status', 'Joined'].map((col) => (
              <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {subscribers.map((row, idx) => (
              <div
                key={row.id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px', alignItems: 'center', padding: '16px 24px', borderBottom: idx < subscribers.length - 1 ? '1px solid #f8fafc' : 'none' }}
              >
                {/* Email */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail style={{ width: 12, height: 12, color: '#2563eb' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{row.email}</span>
                </span>

                {/* Status */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, ...(row.isActive ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }) }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.isActive ? '#22c55e' : '#94a3b8', flexShrink: 0 }} />
                  {row.isActive ? 'Active' : 'Inactive'}
                </span>

                {/* Joined */}
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(row.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
