import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import { Layers3, Users, CalendarDays, Video, Link2 } from 'lucide-react'

export default async function TrainerDashboardPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const now = new Date()

  const [batches, upcomingSessions] = await Promise.all([
    prisma.batch.findMany({
      where: { trainerId: session.userId },
      include: {
        course: { select: { title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.session.findMany({
      where: { trainerId: session.userId, startTime: { gte: now }, status: { not: 'CANCELLED' } },
      include: { batch: { select: { name: true, course: { select: { title: true } } } } },
      orderBy: { startTime: 'asc' },
      take: 10,
    }),
  ])

  const activeBatches = batches.filter((b) => b.status === 'ACTIVE').length
  const totalStudents = batches.reduce((sum, b) => sum + b._count.enrollments, 0)

  const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '16px 20px' }

  return (
    <TrainerLayout title="Dashboard" trainerName={session.name}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Welcome, {session.name.split(' ')[0]}</h2>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Here's what's happening with your batches.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <div style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>
            <Layers3 style={{ width: 11, height: 11 }} /> Assigned Batches
          </div>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{batches.length}</span>
          <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>({activeBatches} active)</span>
        </div>
        <div style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>
            <Users style={{ width: 11, height: 11 }} /> Total Students
          </div>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{totalStudents}</span>
        </div>
        <div style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>
            <CalendarDays style={{ width: 11, height: 11 }} /> Upcoming Sessions
          </div>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{upcomingSessions.length}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>My Batches</h3>
          {batches.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No batches assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {batches.map((b) => (
                <div key={b.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{b.name}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {b.course.title} · {b._count.enrollments}/{b.capacity} students · {b.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Upcoming Sessions</h3>
          {upcomingSessions.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No sessions scheduled.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingSessions.map((s) => (
                <div key={s.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {s.batch.name} ({s.batch.course.title}) · {new Date(s.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {s.meetLink ? (
                    <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2563eb', marginTop: 6 }}>
                      <Video style={{ width: 11, height: 11 }} /> Join / Open Meet
                    </a>
                  ) : (
                    <span style={{ fontSize: 11, color: '#d97706', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Link2 style={{ width: 11, height: 11 }} /> No meet link added yet
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TrainerLayout>
  )
}
