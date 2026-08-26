import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  Presentation, Plus, Briefcase, CheckCircle2,
  Mail, Phone, ExternalLink, Layers3, CalendarDays,
} from 'lucide-react'
import TrainerActions from '@/components/admin/TrainerActions'

export default async function AdminTrainersPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const trainers = await prisma.trainer.findMany({
    include: {
      batches: {
        select: {
          id: true,
          name: true,
          status: true,
          _count: { select: { enrollments: true, sessions: true } },
        },
      },
      sessions: {
        where: { status: { in: ['UPCOMING', 'LIVE'] } },
        select: { id: true, title: true, sessionDate: true },
        take: 3,
      },
    },
    orderBy: { id: 'asc' },
  })

  const activeCount = trainers.filter((t) => t.isActive).length
  const totalBatchesAssigned = trainers.reduce((sum, t) => sum + t.batches.length, 0)

  return (
    <AdminLayout title="Faculty & Trainers">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              padding: '4px 12px',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#7c3aed',
            }}
          >
            <Presentation style={{ width: 12, height: 12 }} />
            Faculty & Instruction Hub
          </div>
          <h1 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
            Faculty Trainers
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: '4px 0 0' }}>
            Instructors assigned to cohorts, live class conduction, and student coursework evaluations.
          </p>
        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Faculty',   value: trainers.length, icon: Presentation },
            { label: 'Active Status',   value: activeCount,     icon: CheckCircle2 },
            { label: 'Assigned Batches',value: totalBatchesAssigned, icon: Layers3 },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                padding: '10px 16px',
                minWidth: 110,
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
            href="/admin/trainers/new"
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
            <span>Onboard Trainer</span>
          </Link>
        </div>
      </div>

      {/* Trainers Grid */}
      {trainers.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px dashed #e2e8f0',
            borderRadius: 20,
            padding: '64px 32px',
            textAlign: 'center',
          }}
        >
          <Presentation style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>No faculty trainers onboarded yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Add your first faculty trainer to begin assigning batches and scheduling classes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {trainers.map((t) => {
            const initials = t.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
            const activeBatches = t.batches.filter((b) => b.status === 'ACTIVE').length
            const totalStudents = t.batches.reduce((sum, b) => sum + b._count.enrollments, 0)

            return (
              <div
                key={t.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top Banner with Avatar & Status */}
                  <div
                    style={{
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <h2 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {t.name}
                        </h2>
                        {t.specialization && (
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {t.specialization}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 100,
                        background: t.isActive ? '#f0fdf4' : '#f8fafc',
                        color: t.isActive ? '#15803d' : '#64748b',
                        border: t.isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      }}
                    >
                      {t.isActive ? 'Active Faculty' : 'Inactive'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Contact details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <Mail style={{ width: 12, height: 12, color: '#94a3b8' }} />
                        <a href={`mailto:${t.email}`} style={{ color: '#475569', textDecoration: 'none' }}>
                          {t.email}
                        </a>
                      </div>
                      {t.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                          <Phone style={{ width: 12, height: 12, color: '#94a3b8' }} />
                          <span>{t.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned Cohorts Metric Tile */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: 10,
                        padding: '10px 12px',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Active Batches
                        </span>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                          {activeBatches} Cohorts
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Students Taught
                        </span>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                          {totalStudents} Enrolled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Cross-role link to Trainer Portal & Actions */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #f1f5f9',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link
                    href="/trainer-login"
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#2563eb',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink style={{ width: 12, height: 12 }} />
                    <span>View as Trainer</span>
                  </Link>

                  <TrainerActions id={t.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
