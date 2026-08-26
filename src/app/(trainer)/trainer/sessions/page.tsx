import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import SessionForm from '@/components/trainer/SessionForm'
import TrainerSessionList from '@/components/trainer/TrainerSessionList'
import { CalendarDays, Video, Users, Clock3, CheckCircle2 } from 'lucide-react'

export default async function TrainerSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const { batchId } = await searchParams
  const defaultBatchId = batchId ? parseInt(batchId) : undefined

  const [batches, sessions] = await Promise.all([
    prisma.batch.findMany({
      where: { trainerId: session.userId },
      include: {
        course: { select: { title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.session.findMany({
      where: { trainerId: session.userId },
      include: {
        batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      },
      orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
    }),
  ])

  const now = new Date()
  const upcoming = sessions.filter((s) => s.status !== 'CANCELLED' && new Date(s.endTime) >= now)
  const completed = sessions.filter((s) => s.status === 'COMPLETED' || (s.status !== 'CANCELLED' && new Date(s.endTime) < now))
  const totalStudents = batches.reduce((sum, b) => sum + b._count.enrollments, 0)

  return (
    <TrainerLayout title="Live Sessions & Class Scheduler" trainerName={session.name}>
      {/* Header Summary */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Live Sessions & Class Scheduler
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
          Schedule live lectures, launch Google Meet / Zoom rooms, manage class timings, and mark student attendance.
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Assigned Batches', value: batches.length, icon: CalendarDays, color: '#1e40af', bg: '#eff6ff' },
          { label: 'Upcoming / Live', value: upcoming.length, icon: Clock3, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Completed Classes', value: completed.length, icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: '#7c3aed', bg: '#faf5ff' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 18,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
                {label}
              </span>
              <div style={{ marginTop: 4, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{value}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon style={{ width: 18, height: 18, color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Form + List */}
      <div className="trainer-sessions-layout" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
        <SessionForm batches={batches} defaultBatchId={defaultBatchId} />

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Video style={{ width: 18, height: 18, color: '#1e40af' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Session Directory ({sessions.length})</h3>
          </div>

          <TrainerSessionList sessions={sessions} batches={batches} defaultBatchFilter={defaultBatchId} />
        </div>
      </div>

      <style>{`
        .trainer-sessions-layout {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1100px) {
          .trainer-sessions-layout {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }
      `}</style>
    </TrainerLayout>
  )
}
