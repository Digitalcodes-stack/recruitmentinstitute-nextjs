'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Video, Plus, Trash2, Loader2, Link2, RefreshCw, AlertCircle, CalendarClock, RotateCcw, Sparkles } from 'lucide-react'

interface Student { id: number; name: string; email: string }
interface EnrolledStudent {
  id: number
  status: string
  student: { id: number; name: string; email: string }
}
interface SessionRow {
  id: number
  title: string
  sessionDate: string | Date
  startTime: string | Date
  endTime: string | Date
  meetLink: string | null
  status: string
  calendarSyncStatus: string
  calendarSyncError: string | null
  recurrenceGroupId: string | null
}

const SYNC_STYLE: Record<string, { bg: string; color: string; label: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }> = {
  NOT_SYNCED: { bg: '#f8fafc', color: '#94a3b8', label: 'Not synced', Icon: CalendarClock },
  PENDING: { bg: '#fffbeb', color: '#d97706', label: 'Syncing…', Icon: RefreshCw },
  SYNCED: { bg: '#ecfdf5', color: '#059669', label: 'Synced', Icon: CalendarClock },
  FAILED: { bg: '#fef2f2', color: '#dc2626', label: 'Sync failed', Icon: AlertCircle },
}

interface Props {
  batch: {
    id: number
    name: string
    capacity: number
    course: { title: string }
    trainer: { id: number; name: string }
  }
  enrollments: EnrolledStudent[]
  sessions: SessionRow[]
  availableStudents: Student[]
}

function fmtTime(d: string | Date) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function BatchDetail({ batch, enrollments, sessions, availableStudents }: Props) {
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')

  const [sessionForm, setSessionForm] = useState({ title: '', sessionDate: '', startTime: '', endTime: '', meetLink: '' })
  const [creatingSession, setCreatingSession] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [syncingSessionId, setSyncingSessionId] = useState<number | null>(null)

  const [sessionTab, setSessionTab] = useState<'single' | 'series' | 'syllabus'>('single')
  const [seriesForm, setSeriesForm] = useState({ title: '', startDate: '', startTime: '', endTime: '', occurrenceCount: '8', daysOfWeek: [] as number[] })
  const [creatingSeries, setCreatingSeries] = useState(false)
  const [seriesError, setSeriesError] = useState('')

  const [syllabusClassDays, setSyllabusClassDays] = useState<number[]>([1, 3, 5])
  const [syllabusStartTime, setSyllabusStartTime] = useState('19:00')
  const [syllabusEndTime, setSyllabusEndTime] = useState('21:00')
  const [generatingSyllabus, setGeneratingSyllabus] = useState(false)
  const [syllabusError, setSyllabusError] = useState('')
  const [syllabusSuccess, setSyllabusSuccess] = useState('')

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function toggleDay(day: number) {
    setSeriesForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter((d) => d !== day) : [...f.daysOfWeek, day],
    }))
  }

  function toggleSyllabusDay(day: number) {
    setSyllabusClassDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  async function generateSyllabusSessions() {
    if (syllabusClassDays.length === 0) {
      setSyllabusError('Please select at least one class day.')
      return
    }
    setGeneratingSyllabus(true)
    setSyllabusError('')
    setSyllabusSuccess('')
    try {
      const [sh, sm] = syllabusStartTime.split(':').map(Number)
      const [eh, em] = syllabusEndTime.split(':').map(Number)
      const res = await fetch(`/api/admin/batches/${batch.id}/generate-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classDays: syllabusClassDays,
          startHour: sh,
          startMinute: sm,
          endHour: eh,
          endMinute: em,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSyllabusError(data.message || 'Failed to generate sessions')
        return
      }
      setSyllabusSuccess(`Successfully created ${data.data?.sessionsCreated ?? 0} sessions from the course syllabus!`)
      router.refresh()
    } catch {
      setSyllabusError('Network error while generating sessions.')
    } finally {
      setGeneratingSyllabus(false)
    }
  }

  async function createSeries(e: React.FormEvent) {
    e.preventDefault()
    if (!seriesForm.title || !seriesForm.startDate || !seriesForm.startTime || !seriesForm.endTime || seriesForm.daysOfWeek.length === 0) {
      setSeriesError('Title, start date, times, and at least one day are required')
      return
    }
    setCreatingSeries(true)
    setSeriesError('')
    try {
      const res = await fetch('/api/admin/sessions/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          trainerId: batch.trainer.id,
          title: seriesForm.title,
          daysOfWeek: seriesForm.daysOfWeek,
          startTime: seriesForm.startTime,
          endTime: seriesForm.endTime,
          startDate: seriesForm.startDate,
          occurrenceCount: Number(seriesForm.occurrenceCount),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSeriesError(data.message || (data.errors ? Object.values(data.errors)[0] as string : 'Could not create series'))
        return
      }
      setSeriesForm({ title: '', startDate: '', startTime: '', endTime: '', occurrenceCount: '8', daysOfWeek: [] })
      router.refresh()
    } finally {
      setCreatingSeries(false)
    }
  }


  async function enrollStudent() {
    if (!studentId) return
    setEnrolling(true)
    setEnrollError('')
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: Number(studentId), batchId: batch.id }),
      })
      const data = await res.json()
      if (!res.ok) { setEnrollError(data.message || 'Could not enroll student'); return }
      setStudentId('')
      router.refresh()
    } finally {
      setEnrolling(false)
    }
  }

  async function removeEnrollment(id: number) {
    if (!confirm('Remove this student from the batch?')) return
    await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime || !sessionForm.endTime) {
      setSessionError('Title, date, start and end time are required')
      return
    }
    setCreatingSession(true)
    setSessionError('')
    try {
      const sessionDate = sessionForm.sessionDate
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          trainerId: batch.trainer.id,
          title: sessionForm.title,
          sessionDate,
          startTime: `${sessionDate}T${sessionForm.startTime}:00`,
          endTime: `${sessionDate}T${sessionForm.endTime}:00`,
          meetLink: sessionForm.meetLink || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSessionError(data.message || (data.errors ? Object.values(data.errors)[0] as string : 'Could not create session'))
        return
      }
      setSessionForm({ title: '', sessionDate: '', startTime: '', endTime: '', meetLink: '' })
      router.refresh()
    } finally {
      setCreatingSession(false)
    }
  }

  async function deleteSession(id: number) {
    if (!confirm('Delete this session?')) return
    await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function syncSession(id: number) {
    setSyncingSessionId(id)
    try {
      const res = await fetch(`/api/admin/sessions/${id}/sync`, { method: 'POST' })
      if (!res.ok) return
      router.refresh()
    } finally {
      setSyncingSessionId(null)
    }
  }

  const cardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/admin/batches" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Batches
        </Link>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{batch.name}</h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          {batch.course.title} · Trainer: {batch.trainer.name} · {enrollments.length}/{batch.capacity} students
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Students */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Users style={{ width: 16, height: 16, color: '#2563eb' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Enrolled Students</h3>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ ...inputStyle, color: studentId ? '#0f172a' : '#94a3b8' }}>
              <option value="">Select student to enroll…</option>
              {availableStudents.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
            </select>
            <button
              onClick={enrollStudent}
              disabled={enrolling || !studentId}
              style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', cursor: enrolling ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
            >
              {enrolling ? <Loader2 style={{ width: 13, height: 13 }} /> : <Plus style={{ width: 13, height: 13 }} />}
              Add
            </button>
          </div>
          {enrollError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{enrollError}</p>}

          {enrollments.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No students enrolled yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {enrollments.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{e.student.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{e.student.email}</p>
                  </div>
                  <button onClick={() => removeEnrollment(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions */}
        <div style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Video style={{ width: 16, height: 16, color: '#7c3aed' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Sessions</h3>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setSessionTab('syllabus')}
              style={{ flex: 1.2, padding: '7px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer', background: sessionTab === 'syllabus' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#fff', color: sessionTab === 'syllabus' ? '#fff' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <Sparkles style={{ width: 12, height: 12 }} />
              Auto Syllabus
            </button>
            <button
              type="button"
              onClick={() => setSessionTab('single')}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', background: sessionTab === 'single' ? '#7c3aed' : '#fff', color: sessionTab === 'single' ? '#fff' : '#64748b' }}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => setSessionTab('series')}
              style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', background: sessionTab === 'series' ? '#7c3aed' : '#fff', color: sessionTab === 'series' ? '#fff' : '#64748b' }}
            >
              Series
            </button>
          </div>

          {sessionTab === 'syllabus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, padding: 14, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles style={{ width: 13, height: 13 }} /> Auto-Generate from Course Syllabus
              </div>
              <p style={{ fontSize: 11.5, color: '#475569', margin: 0 }}>
                Generates one live session per module for <strong>{batch.course.title}</strong>, assigns Google Meet codes, and schedules dates across your chosen class days.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 4 }}>Class Days</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {DAY_LABELS.map((label, day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleSyllabusDay(day)}
                      style={{
                        flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10.5, fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer',
                        background: syllabusClassDays.includes(day) ? '#2563eb' : '#fff',
                        color: syllabusClassDays.includes(day) ? '#fff' : '#64748b',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#334155', marginBottom: 3 }}>Start Time</label>
                  <input type="time" value={syllabusStartTime} onChange={(e) => setSyllabusStartTime(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#334155', marginBottom: 3 }}>End Time</label>
                  <input type="time" value={syllabusEndTime} onChange={(e) => setSyllabusEndTime(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {syllabusError && <p style={{ fontSize: 11.5, color: '#ef4444', margin: 0 }}>{syllabusError}</p>}
              {syllabusSuccess && <p style={{ fontSize: 11.5, color: '#16a34a', margin: 0 }}>{syllabusSuccess}</p>}

              <button
                type="button"
                onClick={generateSyllabusSessions}
                disabled={generatingSyllabus}
                style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', cursor: generatingSyllabus ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {generatingSyllabus ? <Loader2 style={{ width: 13, height: 13 }} /> : <Sparkles style={{ width: 13, height: 13 }} />}
                {generatingSyllabus ? 'Generating Sessions…' : 'Generate Syllabus Sessions'}
              </button>
            </div>
          )}

          {sessionTab === 'single' && (
            <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
              <input placeholder="Session title" value={sessionForm.title} onChange={(e) => setSessionForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="date" value={sessionForm.sessionDate} onChange={(e) => setSessionForm((f) => ({ ...f, sessionDate: e.target.value }))} style={inputStyle} />
                <input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm((f) => ({ ...f, startTime: e.target.value }))} style={inputStyle} />
                <input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm((f) => ({ ...f, endTime: e.target.value }))} style={inputStyle} />
              </div>
              <input placeholder="Google Meet link (optional — leave blank to auto-generate)" value={sessionForm.meetLink} onChange={(e) => setSessionForm((f) => ({ ...f, meetLink: e.target.value }))} style={inputStyle} />
              {sessionError && <p style={{ fontSize: 12, color: '#ef4444' }}>{sessionError}</p>}
              <button
                type="submit"
                disabled={creatingSession}
                style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#7c3aed', color: '#fff', border: 'none', cursor: creatingSession ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                {creatingSession ? <Loader2 style={{ width: 13, height: 13 }} /> : <Plus style={{ width: 13, height: 13 }} />}
                Add Session
              </button>
            </form>
          )}

          {sessionTab === 'series' && (
            <form onSubmit={createSeries} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 12 }}>
              <input placeholder="Series title" value={seriesForm.title} onChange={(e) => setSeriesForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: 6 }}>
                {DAY_LABELS.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer',
                      background: seriesForm.daysOfWeek.includes(day) ? '#7c3aed' : '#fff',
                      color: seriesForm.daysOfWeek.includes(day) ? '#fff' : '#64748b',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="date" value={seriesForm.startDate} onChange={(e) => setSeriesForm((f) => ({ ...f, startDate: e.target.value }))} style={inputStyle} />
                <input type="time" value={seriesForm.startTime} onChange={(e) => setSeriesForm((f) => ({ ...f, startTime: e.target.value }))} style={inputStyle} />
                <input type="time" value={seriesForm.endTime} onChange={(e) => setSeriesForm((f) => ({ ...f, endTime: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>Occurrences</label>
                <input type="number" min={1} max={60} value={seriesForm.occurrenceCount} onChange={(e) => setSeriesForm((f) => ({ ...f, occurrenceCount: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
              </div>
              {seriesError && <p style={{ fontSize: 12, color: '#ef4444' }}>{seriesError}</p>}
              <button
                type="submit"
                disabled={creatingSeries}
                style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#7c3aed', color: '#fff', border: 'none', cursor: creatingSeries ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                {creatingSeries ? <Loader2 style={{ width: 13, height: 13 }} /> : <Plus style={{ width: 13, height: 13 }} />}
                Create Series
              </button>
            </form>
          )}


          {sessions.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No sessions scheduled yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map((s) => {
                const sync = SYNC_STYLE[s.calendarSyncStatus] ?? SYNC_STYLE.NOT_SYNCED
                const SyncIcon = sync.Icon
                return (
                  <div key={s.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.title}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {fmtDate(s.sessionDate)} · {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          {s.meetLink && (
                            <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2563eb' }}>
                              <Link2 style={{ width: 11, height: 11 }} /> Meet link
                            </a>
                          )}
                          <span
                            title={s.calendarSyncError ?? undefined}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: sync.bg, color: sync.color }}
                            >
                              <SyncIcon style={{ width: 10, height: 10 }} /> {sync.label}
                            </span>
                            {s.recurrenceGroupId && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#f5f3ff', color: '#7c3aed' }}>
                                <Sparkles style={{ width: 10, height: 10 }} /> Series
                              </span>
                            )}
                          </div>
                        </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => syncSession(s.id)}
                          disabled={syncingSessionId === s.id}
                          title="Queue Google Calendar sync"
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: syncingSessionId === s.id ? 'not-allowed' : 'pointer', color: '#334155', padding: 6, display: 'inline-flex', alignItems: 'center' }}
                        >
                          {syncingSessionId === s.id ? <Loader2 style={{ width: 14, height: 14 }} /> : <RotateCcw style={{ width: 14, height: 14 }} />}
                        </button>
                        <button onClick={() => deleteSession(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                    {s.calendarSyncError && (
                      <p style={{ marginTop: 8, fontSize: 11, color: '#b91c1c', lineHeight: 1.5 }}>
                        {s.calendarSyncError}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
