import Link from 'next/link'
import { CalendarDays, Video, CheckCircle2, Clock } from 'lucide-react'

interface SessionRow {
  id: number
  title: string
  sessionDate: Date
  startTime: Date
  endTime: Date
  meetLink: string | null
  status: string
}

interface EnrollmentRow {
  id: number
  status: string
  batch: {
    id: number
    name: string
    course: { id: number; title: string }
    trainer: { name: string }
    sessions: SessionRow[]
  }
  attendance: { sessionId: number; present: boolean }[]
}

interface Props {
  enrollments: EnrollmentRow[]
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function StudentTrainingPanel({ enrollments }: Props) {
  if (enrollments.length === 0) return null

  const now = new Date()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {enrollments.map((enrollment) => {
        const sessions = enrollment.batch.sessions
        const upcoming = sessions.filter((s) => new Date(s.startTime) >= now && s.status !== 'CANCELLED')
        const completed = sessions.filter((s) => new Date(s.startTime) < now || s.status === 'COMPLETED')
        const attendedCount = enrollment.attendance.filter((a) => a.present).length
        const attendancePct = completed.length > 0 ? Math.round((attendedCount / completed.length) * 100) : null

        return (
          <div key={enrollment.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Link href={`/profile/courses/${enrollment.batch.course.id}`} style={{ textDecoration: 'none' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{enrollment.batch.course.title}</h4>
                </Link>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Batch: {enrollment.batch.name} · Trainer: {enrollment.batch.trainer.name}
                </p>
              </div>
              {attendancePct !== null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: attendancePct >= 80 ? '#ecfdf5' : '#fffbeb', border: `1px solid ${attendancePct >= 80 ? '#a7f3d0' : '#fde68a'}` }}>
                  <CheckCircle2 style={{ width: 12, height: 12, color: attendancePct >= 80 ? '#059669' : '#d97706' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: attendancePct >= 80 ? '#059669' : '#d97706' }}>{attendancePct}% Attendance</span>
                </div>
              )}
            </div>

            {upcoming.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Upcoming Sessions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.slice(0, 3).map((s) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.title}</p>
                        <p style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarDays style={{ width: 11, height: 11 }} /> {fmtDate(s.sessionDate)} · {fmtTime(s.startTime)}
                        </p>
                      </div>
                      {s.meetLink ? (
                        <a
                          href={`/api/sessions/${s.id}/join`}
                          onClick={(e) => { e.preventDefault(); fetch(`/api/sessions/${s.id}/join`, { method: 'POST' }).then(() => window.open(s.meetLink!, '_blank')) }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          <Video style={{ width: 12, height: 12 }} /> Join Class
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock style={{ width: 11, height: 11 }} /> Link pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Completed Sessions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {completed.slice(-3).reverse().map((s) => {
                    const att = enrollment.attendance.find((a) => a.sessionId === s.id)
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#f8fafc', borderRadius: 10 }}>
                        <p style={{ fontSize: 12, color: '#475569' }}>{s.title} · {fmtDate(s.sessionDate)}</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: att?.present ? '#059669' : '#94a3b8' }}>
                          {att?.present ? 'Present' : 'Not marked'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {upcoming.length === 0 && completed.length === 0 && (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No sessions scheduled yet for this batch.</p>
            )}

            {upcoming.length === 0 && completed.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Course Completed!</h5>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Test your knowledge and get personalized AI notes.</p>
                </div>
                <Link
                  href={`/profile/assessments/take/${enrollment.batch.course.id}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #1E40AF, #2563EB)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                >
                  Take Final Assessment
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
