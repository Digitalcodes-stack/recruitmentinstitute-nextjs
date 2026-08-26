import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import SessionsCalendarView from '@/components/admin/SessionsCalendarView'
import { CalendarDays, Video, Users, Plus, CheckCircle2, Clock } from 'lucide-react'

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; trainerId?: string }>
}) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sp = await searchParams
  const batchId = sp.batchId ? parseInt(sp.batchId) : undefined
  const trainerId = sp.trainerId ? parseInt(sp.trainerId) : undefined

  const [sessions, batches, trainers] = await Promise.all([
    prisma.session.findMany({
      where: {
        ...(batchId && { batchId }),
        ...(trainerId && { trainerId }),
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            course: { select: { id: true, title: true } },
            _count: { select: { enrollments: true } },
          },
        },
        trainer: { select: { id: true, name: true, image: true, email: true } },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.batch.findMany({
      where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.trainer.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const liveCount = sessions.filter((s) => s.status === 'LIVE').length
  const upcomingCount = sessions.filter((s) => s.status === 'UPCOMING').length

  return (
    <AdminLayout title="Live Class Sessions">
      {/* Page Header */}
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
            <CalendarDays style={{ width: 12, height: 12 }} />
            Centralized Schedule & Calendar
          </div>
          <h1 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
            Class Sessions Hub
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: '4px 0 0' }}>
            Coordinate Google Meet live classes, schedule recurring lectures, and inspect attendance.
          </p>
        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Scheduled', value: sessions.length, icon: CalendarDays },
            { label: 'Upcoming',        value: upcomingCount,    icon: Clock },
            { label: 'Live Now',        value: liveCount,        icon: Video },
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
        </div>
      </div>

      {/* Dual View Calendar & List Component */}
      <SessionsCalendarView
        initialSessions={sessions}
        batches={batches}
        trainers={trainers}
      />
    </AdminLayout>
  )
}
