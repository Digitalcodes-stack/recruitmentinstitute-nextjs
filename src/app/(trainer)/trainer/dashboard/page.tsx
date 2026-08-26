import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import {
  Layers3,
  Users,
  CalendarDays,
  Video,
  Link2,
  CheckCircle2,
  Clock,
  ClipboardList,
  UserCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react'

export default async function TrainerDashboardPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const now = new Date()

  // Fetch all trainer-relevant data in parallel
  const [batches, sessions, assignments, trainerProfile] = await Promise.all([
    prisma.batch.findMany({
      where: { trainerId: session.userId },
      include: {
        course: { select: { id: true, title: true } },
        enrollments: {
          where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
          include: { student: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { enrollments: true, sessions: true, assignments: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.session.findMany({
      where: { trainerId: session.userId },
      include: {
        batch: { select: { id: true, name: true, course: { select: { title: true } } } },
        attendance: { select: { present: true } },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.assignment.findMany({
      where: { batch: { trainerId: session.userId } },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            course: { select: { title: true } },
            _count: { select: { enrollments: true } },
          },
        },
        submissions: {
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { dueAt: 'desc' },
    }),
    prisma.trainer.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, specialization: true, bio: true },
    }),
  ])

  // KPIs
  const activeBatches = batches.filter((b) => b.status === 'ACTIVE').length
  const totalStudents = batches.reduce((sum, b) => sum + b._count.enrollments, 0)

  // Filter upcoming & today sessions vs past sessions
  const upcomingSessions = sessions.filter(
    (s) => s.status !== 'CANCELLED' && new Date(s.startTime) >= new Date(now.getTime() - 2 * 60 * 60 * 1000)
  )

  // If upcomingSessions is empty, show the most recent scheduled sessions so the trainer always sees class schedules
  const displaySessions = upcomingSessions.length > 0 ? upcomingSessions.slice(0, 5) : sessions.slice(0, 5)

  // Submissions needing grading
  const pendingSubmissions = assignments.flatMap((a) =>
    a.submissions
      .filter((s) => s.score === null)
      .map((s) => ({
        submissionId: s.id,
        assignmentId: a.id,
        assignmentTitle: a.title,
        batchName: a.batch.name,
        courseTitle: a.batch.course.title,
        studentName: s.student.name,
        studentEmail: s.student.email,
        submittedAt: s.submittedAt,
        fileUrl: s.fileUrl,
      }))
  )

  // Overall attendance rate
  let totalPossible = 0
  let totalPresent = 0
  sessions.forEach((s) => {
    s.attendance.forEach((a) => {
      totalPossible++
      if (a.present) totalPresent++
    })
  })
  const attendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 100

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    padding: '22px 24px',
    transition: 'all 0.2s ease',
  }

  return (
    <TrainerLayout title="Dashboard" trainerName={session.name}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e40af 100%)',
          borderRadius: 24,
          padding: '32px 36px',
          color: '#ffffff',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', marginBottom: 12 }}>
              <Sparkles style={{ width: 13, height: 13, color: '#60a5fa' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd' }}>
                {trainerProfile?.specialization || 'Trainer Dashboard'}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
              Welcome back, {session.name.split(' ')[0]}! 👋
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
              You have <strong style={{ color: '#ffffff' }}>{activeBatches} active batches</strong> with{' '}
              <strong style={{ color: '#ffffff' }}>{totalStudents} enrolled students</strong>. Monitor live classes, mark attendance, and grade assignments below.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/trainer/sessions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                textDecoration: 'none',
              }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Schedule Class
            </Link>
            <Link
              href="/trainer/assignments"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: '#0f172a',
                background: '#ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                textDecoration: 'none',
              }}
            >
              <ClipboardList style={{ width: 15, height: 15, color: '#1e40af' }} /> Assignments
            </Link>
            <Link
              href="/trainer/attendance"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                color: '#ffffff',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              <UserCheck style={{ width: 15, height: 15 }} /> Take Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Assigned Batches
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers3 style={{ width: 18, height: 18, color: '#1e40af' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{batches.length}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>
              {activeBatches} Active
            </span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Total Students
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users style={{ width: 18, height: 18, color: '#16a34a' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{totalStudents}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Enrolled</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Total Sessions
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays style={{ width: 18, height: 18, color: '#7c3aed' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{sessions.length}</span>
            <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>{upcomingSessions.length} upcoming</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Pending Grading
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock style={{ width: 18, height: 18, color: '#d97706' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: pendingSubmissions.length > 0 ? '#d97706' : '#0f172a' }}>
              {pendingSubmissions.length}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Submissions</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b' }}>
              Avg Attendance
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp style={{ width: 18, height: 18, color: '#db2777' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{attendanceRate}%</span>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Tracked</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Batches & Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 32, alignItems: 'start' }}>
        {/* Active Batches Section */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>My Batches</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Curriculum groups assigned to you for teaching</p>
            </div>
            <Link href="/trainer/batches" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: '#1e40af', textDecoration: 'none' }}>
              View All <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {batches.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
              <Layers3 style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No batches assigned yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Contact system administrator to get allocated to active batches.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {batches.map((b) => {
                const enrolledCount = b._count.enrollments
                const capacityPct = Math.min(100, Math.round((enrolledCount / b.capacity) * 100))

                return (
                  <div
                    key={b.id}
                    style={{
                      padding: '18px 20px',
                      background: '#f8fafc',
                      borderRadius: 16,
                      border: '1px solid #edf2f7',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{b.name}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: b.status === 'ACTIVE' ? '#ecfdf5' : '#eff6ff',
                              color: b.status === 'ACTIVE' ? '#059669' : '#1e40af',
                              border: `1px solid ${b.status === 'ACTIVE' ? '#a7f3d0' : '#bfdbfe'}`,
                            }}
                          >
                            {b.status}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                            {b.mode}
                          </span>
                        </div>
                        <p style={{ fontSize: 12.5, color: '#475569', fontWeight: 600, marginTop: 4 }}>{b.course.title}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {enrolledCount} / {b.capacity}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Students</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div>
                      <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${capacityPct}%`,
                            height: '100%',
                            background: capacityPct > 80 ? '#22c55e' : '#3b82f6',
                            borderRadius: 100,
                          }}
                        />
                      </div>
                    </div>

                    {/* Batch Quick Links */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#64748b' }}>
                        <span>
                          <strong>{b._count.sessions}</strong> Sessions
                        </span>
                        <span>·</span>
                        <span>
                          <strong>{b._count.assignments}</strong> Assignments
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          href={`/trainer/batches?batchId=${b.id}`}
                          style={{ fontSize: 11.5, fontWeight: 700, color: '#1e40af', textDecoration: 'none', background: '#ffffff', padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                        >
                          View Students
                        </Link>
                        <Link
                          href={`/trainer/sessions?batchId=${b.id}`}
                          style={{ fontSize: 11.5, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', background: '#ffffff', padding: '4px 10px', borderRadius: 6, border: '1px solid #ddd6fe' }}
                        >
                          Sessions
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming / Live Sessions Section */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Scheduled Sessions</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Upcoming classes and meetings</p>
            </div>
            <Link href="/trainer/sessions" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: '#1e40af', textDecoration: 'none' }}>
              Manage <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {displaySessions.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
              <CalendarDays style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No sessions scheduled</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Schedule a live training class for your batches.</p>
              <Link
                href="/trainer/sessions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 14,
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#1e40af',
                  color: '#ffffff',
                  textDecoration: 'none',
                }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Schedule Class Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displaySessions.map((s) => {
                const sessionDateStr = new Date(s.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                const startTimeStr = new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                const endTimeStr = new Date(s.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                const dEnd = new Date(s.endTime)
                const dStart = new Date(s.startTime)
                const isCancelled = s.status === 'CANCELLED'
                const isLive = !isCancelled && (s.status === 'LIVE' || (dStart <= now && dEnd >= now))
                const isCompleted = !isCancelled && !isLive && (s.status === 'COMPLETED' || dEnd < now)

                return (
                  <div key={s.id} style={{ padding: '14px 16px', background: isLive ? '#fef2f2' : '#f8fafc', borderRadius: 14, border: isLive ? '1px solid #fecaca' : '1px solid #edf2f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.title}</p>
                        <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                          {s.batch.name} ({s.batch.course.title})
                        </p>
                        <p style={{ fontSize: 11.5, color: '#475569', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock style={{ width: 12, height: 12, color: '#1e40af' }} />
                          {sessionDateStr} · {startTimeStr} - {endTimeStr}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: isLive ? '#fee2e2' : isCompleted ? '#ecfdf5' : '#eff6ff',
                          color: isLive ? '#ef4444' : isCompleted ? '#059669' : '#1e40af',
                          border: `1px solid ${isLive ? '#fca5a5' : isCompleted ? '#a7f3d0' : '#bfdbfe'}`,
                        }}
                      >
                        {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                      {isCompleted ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: '#059669',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '4px 10px',
                            borderRadius: 6,
                          }}
                        >
                          <CheckCircle2 style={{ width: 12, height: 12 }} /> Finished
                        </span>
                      ) : (
                        (() => {
                          const targetLink = s.meetLink && !s.meetLink.includes('sample-link') && s.meetLink.startsWith('http')
                            ? s.meetLink
                            : 'https://meet.google.com/new'
                          return (
                            <a
                              href={targetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#ffffff',
                                background: isLive ? '#dc2626' : '#2563eb',
                                padding: '5px 12px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                boxShadow: isLive ? '0 2px 6px rgba(220,38,38,0.2)' : 'none',
                              }}
                            >
                              <Video style={{ width: 12, height: 12 }} />
                              {isLive ? 'Join Live Room' : 'Launch Meet'}
                            </a>
                          )
                        })()
                      )}

                      <Link
                        href={`/trainer/attendance?sessionId=${s.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: 8,
                          textDecoration: 'none',
                        }}
                      >
                        <UserCheck style={{ width: 12, height: 12, color: '#16a34a' }} />
                        {isCompleted ? 'Review Attendance' : 'Attendance'}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Pending Submissions & Attendance Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Pending Submissions To Grade */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Pending Grading ({pendingSubmissions.length})
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Student assignments awaiting your review and scores</p>
            </div>
            <Link href="/trainer/assignments" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: '#1e40af', textDecoration: 'none' }}>
              Grade All <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
              <CheckCircle2 style={{ width: 32, height: 32, color: '#10b981', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All caught up!</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>There are no student submissions waiting for review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingSubmissions.slice(0, 4).map((sub) => (
                <div key={sub.submissionId} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{sub.studentName}</p>
                    <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      {sub.assignmentTitle} · {sub.batchName}
                    </p>
                  </div>
                  <Link
                    href={`/trainer/assignments?assignmentId=${sub.assignmentId}&grade=${sub.submissionId}`}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#ffffff',
                      background: '#1e40af',
                      padding: '5px 12px',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    Grade
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Batch Performance Overview */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>Teaching Insights</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Batch performance & engagement metrics</p>
            </div>
            <Link href="/trainer/analytics" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: '#1e40af', textDecoration: 'none' }}>
              Full Analytics <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Batch Attendance Completion</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>{attendanceRate}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${attendanceRate}%`, height: '100%', background: '#10b981', borderRadius: 100 }} />
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Assignment Submissions Rate</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>
                  {assignments.length > 0
                    ? Math.round(
                        (assignments.reduce((sum, a) => sum + a.submissions.length, 0) /
                          Math.max(1, assignments.reduce((sum, a) => sum + a.batch._count.enrollments, 0))) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${
                      assignments.length > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (assignments.reduce((sum, a) => sum + a.submissions.length, 0) /
                                Math.max(1, assignments.reduce((sum, a) => sum + a.batch._count.enrollments, 0))) *
                                100
                            )
                          )
                        : 0
                    }%`,
                    height: '100%',
                    background: '#3b82f6',
                    borderRadius: 100,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Link
                href="/trainer/attendance"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Mark Attendance
              </Link>
              <Link
                href="/trainer/batches"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Student Rosters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TrainerLayout>
  )
}
