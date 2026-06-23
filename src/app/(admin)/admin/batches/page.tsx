import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { Layers3, Plus, Users, CalendarDays } from 'lucide-react'
import BatchActions from '@/components/admin/BatchActions'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  UPCOMING: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  ACTIVE: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  COMPLETED: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

export default async function AdminBatchesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const batches = await prisma.batch.findMany({
    include: {
      course: { select: { title: true } },
      trainer: { select: { name: true } },
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  const activeCount = batches.filter((b) => b.status === 'ACTIVE').length

  return (
    <AdminLayout title="Batches">
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}
          >
            <Layers3 style={{ width: 11, height: 11 }} />
            Training Batches
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Batches
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Group students under a trainer for a course, with sessions and attendance tracked per batch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[
            { label: 'Total Batches', value: batches.length, icon: Layers3 },
            { label: 'Active', value: activeCount, icon: CalendarDays },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <Link
            href="/admin/batches/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Batch
          </Link>
        </div>
      </div>

      {batches.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <Layers3 style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No batches yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Create your first batch to start enrolling students.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0' }}>
                {['Batch', 'Course', 'Trainer', 'Students', 'Sessions', 'Mode', 'Start Date', 'Status', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const st = STATUS_STYLE[batch.status]
                return (
                  <tr key={batch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{batch.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{batch.course.title}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{batch.trainer.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      <span className="inline-flex items-center gap-1">
                        <Users style={{ width: 12, height: 12 }} />
                        {batch._count.enrollments}/{batch.capacity}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{batch._count.sessions}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{batch.mode}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {new Date(batch.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {batch.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <BatchActions id={batch.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
