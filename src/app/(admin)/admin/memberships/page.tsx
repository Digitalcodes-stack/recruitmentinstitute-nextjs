import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import MembershipActions from '@/components/admin/MembershipActions'
import { CreditCard, Users, UserCheck, Clock3, Mail, Phone, CalendarDays } from 'lucide-react'

type MembershipRow = {
  id: number
  name: string
  email: string
  contact: string | null
  isActive: boolean
  createdAt: Date
}

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
}

export default async function AdminMembershipsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const rows   = await prisma.membership.findMany({ orderBy: { createdAt: 'desc' } })
  const active  = rows.filter((r) => r.isActive).length
  const pending = rows.length - active

  return (
    <AdminLayout title="Memberships">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#0891b2' }}>
            <CreditCard style={{ width: 11, height: 11 }} />
            Membership Management
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Memberships
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage membership accounts and access status.
          </p>
        </div>

        {/* Stat mini-cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',   value: rows.length, icon: Users,     accent: '#2563eb', bg: '#eff6ff', bdr: '#bfdbfe' },
            { label: 'Active',  value: active,      icon: UserCheck, accent: '#059669', bg: '#f0fdf4', bdr: '#bbf7d0' },
            { label: 'Pending', value: pending,     icon: Clock3,    accent: '#d97706', bg: '#fffbeb', bdr: '#fde68a' },
          ].map(({ label, value, icon: Icon, accent, bg, bdr }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 90 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: 8 }}>
                <Icon style={{ width: 10, height: 10 }} />
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${bdr}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e8ecf0', borderRadius: 20, padding: '72px 32px', textAlign: 'center' as const }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No membership records found.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Membership Directory</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Name, email, status, and account actions</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#fff', border: '1px solid #e8ecf0', color: '#64748b' }}>
              {rows.length} records
            </span>
          </div>

          {/* Column headers */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr 110px 120px 120px' }}>
            {['Name', 'Email', 'Contact', 'Status', 'Joined Date', 'Actions'].map((col) => (
              <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {rows.map((row: MembershipRow, idx: number) => {
              const initials = getInitials(row.name)
              const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']
              const color  = colors[row.id % colors.length]
              return (
                <div
                  key={row.id}
                  style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr 110px 120px 120px', alignItems: 'center', padding: '18px 24px', borderBottom: idx < rows.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  {/* Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 16, minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${color},${color}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Member account</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ paddingRight: 16, minWidth: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                      <Mail style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</span>
                    </span>
                  </div>

                  {/* Contact */}
                  <div style={{ paddingRight: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                      <Phone style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                      {row.contact || '—'}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, ...(row.isActive ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } : { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }) }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.isActive ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
                      {row.isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>

                  {/* Joined */}
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                      <CalendarDays style={{ width: 12, height: 12, flexShrink: 0 }} />
                      {new Date(row.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    <MembershipActions id={row.id} isActive={row.isActive} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
