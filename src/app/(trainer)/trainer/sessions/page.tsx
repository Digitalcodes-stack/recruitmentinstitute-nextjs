import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import SessionForm from '@/components/trainer/SessionForm'
import TrainerSessionList from '@/components/trainer/TrainerSessionList'
import { CalendarDays, Video, Users, Clock3 } from 'lucide-react'

export default async function TrainerSessionsPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

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
      take: 20,
    }),
  ])

  const upcoming = sessions.filter((s) => s.status !== 'CANCELLED' && new Date(s.startTime) >= new Date())

  return (
    <TrainerLayout title="Sessions" trainerName={session.name}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Batches', value: batches.length, icon: CalendarDays },
              { label: 'Upcoming', value: upcoming.length, icon: Clock3 },
              { label: 'Students', value: batches.reduce((sum, b) => sum + b._count.enrollments, 0), icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  <Icon style={{ width: 11, height: 11 }} /> {label}
                </div>
                <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>

          <SessionForm batches={batches} />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Video style={{ width: 16, height: 16, color: '#7c3aed' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Upcoming Sessions</h3>
          </div>
          {sessions.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No sessions created yet.</p>
          ) : (
            <TrainerSessionList sessions={sessions} batches={batches} />
          )}
        </div>
      </div>
    </TrainerLayout>
  )
}

