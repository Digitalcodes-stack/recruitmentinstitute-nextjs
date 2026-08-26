import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  Layers3, Plus, Users, CalendarDays, Presentation,
  CheckCircle2, Clock, Video, UserCheck, ArrowUpRight,
} from 'lucide-react'
import BatchActions from '@/components/admin/BatchActions'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  UPCOMING: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  ACTIVE: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  COMPLETED: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  CANCELLED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
}

export default async function AdminBatchesPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const batches = await prisma.batch.findMany({
    include: {
      course: { select: { id: true, title: true } },
      trainer: { select: { id: true, name: true, image: true, email: true } },
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  const activeCount = batches.filter((b) => b.status === 'ACTIVE').length
  const upcomingCount = batches.filter((b) => b.status === 'UPCOMING').length
  const totalEnrolled = batches.reduce((sum, b) => sum + b._count.enrollments, 0)

  return (
    <AdminLayout title="Batches Management">
      {/* ── Page Header & Quick Actions ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '4px 12px',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#2563eb',
            }}
          >
            <Layers3 style={{ width: 12, height: 12 }} />
            Training Cohorts & Rosters
          </div>
          <h1 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
            Training Batches
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: '4px 0 0' }}>
            Coordinate student cohorts, assign faculty trainers, and track live class progress.
          </p>
        </div>

        {/* Action button & quick stats */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Batches', value: batches.length, icon: Layers3 },
            { label: 'Active Cohorts', value: activeCount, icon: CalendarDays },
            { label: 'Total Enrolled', value: totalEnrolled, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                padding: '10px 16px',
                minWidth: 105,
              }}
            >
              <div
                className="flex items-center gap-1 mb-1"
                style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}
              >
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {value}
              </span>
            </div>
          ))}

          <Link
            href="/admin/batches/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: 10,
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Create Batch</span>
          </Link>
        </div>
      </div>

      {/* ── Batches Table / Cards Grid ──────────────────────────────────── */}
      {batches.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #e2e8f0',
            borderRadius: 20,
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <Layers3 style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>No batches created yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Create your first training batch to start enrolling students and assigning trainers.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              padding: '14px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'grid',
              gridTemplateColumns: '1.6fr 1.2fr 1.2fr 120px 100px 140px',
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#64748b',
            }}
          >
            <span>Batch Name & Course</span>
            <span>Assigned Faculty</span>
            <span>Capacity & Roster</span>
            <span>Start Date</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows */}
          {batches.map((b, idx) => {
            const st = STATUS_STYLE[b.status] || STATUS_STYLE.UPCOMING
            const max = b.capacity || 30
            const enrolled = b._count.enrollments
            const pct = Math.min(100, Math.round((enrolled / max) * 100))
            const startDateStr = new Date(b.startDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={b.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.2fr 1.2fr 120px 100px 140px',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: idx < batches.length - 1 ? '1px solid #f8fafc' : 'none',
                }}
              >
                {/* Batch Name & Course */}
                <div style={{ paddingRight: 16 }}>
                  <Link
                    href={`/admin/batches/${b.id}`}
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#0f172a',
                      textDecoration: 'none',
                    }}
                  >
                    {b.name}
                  </Link>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0' }}>
                    Course: <strong style={{ color: '#2563eb' }}>{b.course.title}</strong>
                  </p>
                  <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                    {b._count.sessions} sessions conducted
                  </span>
                </div>

                {/* Trainer Avatar & Name */}
                <div style={{ paddingRight: 16 }}>
                  {b.trainer ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: 11,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {b.trainer.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.trainer.name}
                        </p>
                        <span style={{ fontSize: 10.5, color: '#64748b' }}>Faculty</span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600 }}>
                      ⚠️ No Trainer Assigned
                    </span>
                  )}
                </div>

                {/* Capacity Meter */}
                <div style={{ paddingRight: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                      {enrolled} / {max}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 5, borderRadius: 10, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct >= 90 ? '#ef4444' : pct >= 60 ? '#3b82f6' : '#22c55e',
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <Link
                    href={`/admin/batches/${b.id}`}
                    style={{ fontSize: 10.5, fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'inline-block', marginTop: 4 }}
                  >
                    View Roster ({enrolled}) →
                  </Link>
                </div>

                {/* Start Date */}
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  {startDateStr}
                </div>

                {/* Status Pill */}
                <div>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: st.bg,
                      color: st.color,
                      border: `1px solid ${st.border}`,
                    }}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <BatchActions id={b.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
