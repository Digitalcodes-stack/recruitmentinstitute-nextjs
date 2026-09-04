'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  UserCheck,
  UserX,
  Users,
  CalendarDays,
  Clock3,
  Video,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Layers3,
  Brain,
  FileText,
  Send,
} from 'lucide-react'


interface SessionOption {
  id: number
  title: string
  sessionDate: string | Date
  startTime: string | Date
  endTime: string | Date
  status: string
  meetLink: string | null
  batchId: number
  batchName: string
  courseTitle: string
}

interface StudentAttendanceRecord {
  enrollmentId: number
  studentId: number
  studentName: string
  studentEmail: string
  studentContact: string | null
  present: boolean
  joinedAt: string | Date | null
}

interface Props {
  sessions: SessionOption[]
  initialSessionId?: number
  initialRoster: StudentAttendanceRecord[]
}

export default function TrainerAttendanceClient({
  sessions,
  initialSessionId,
  initialRoster,
}: Props) {
  const router = useRouter()
  const [selectedSessionId, setSelectedSessionId] = useState<number>(
    initialSessionId && sessions.some((s) => s.id === initialSessionId)
      ? initialSessionId
      : sessions[0]?.id ?? 0
  )
  const [roster, setRoster] = useState<StudentAttendanceRecord[]>(initialRoster)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingPdf, setSendingPdf] = useState(false)
  const [pdfConfirmation, setPdfConfirmation] = useState<{
    sent: boolean
    attendedCount: number
    message: string
  } | null>(null)
  const [assessmentConfirmation, setAssessmentConfirmation] = useState<{
    assessmentReleased: boolean
    presentCount: number
    absentCount: number
    moduleName: string | null
    studentsReleased: number
    assessmentNote: string
  } | null>(null)

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? sessions[0] ?? null,
    [sessions, selectedSessionId]
  )

  const handleSendPdf = async () => {
    if (!activeSession) return
    setSendingPdf(true)
    setPdfConfirmation(null)
    try {
      const res = await fetch(`/api/trainer/sessions/${activeSession.id}/send-syllabus-pdf`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch syllabus PDF')
      }
      toast.success(data.message || 'Syllabus PDF sent to attended students!')
      setPdfConfirmation({
        sent: true,
        attendedCount: data.data?.attendedStudentsCount ?? 0,
        message: data.message,
      })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Error sending syllabus PDF')
    } finally {
      setSendingPdf(false)
    }
  }

  // Fetch roster when session changes
  const handleSessionChange = async (sessionId: number) => {
    setSelectedSessionId(sessionId)
    setLoading(true)
    try {
      const res = await fetch(`/api/trainer/attendance?sessionId=${sessionId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setRoster(json.data.roster)
      }
    } catch {
      toast.error('Failed to load session roster')
    } finally {
      setLoading(false)
    }
  }

  // Toggle single student attendance
  const toggleStudent = (enrollmentId: number) => {
    setRoster((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, present: !s.present } : s))
    )
  }

  // Bulk actions
  const markAll = (present: boolean) => {
    setRoster((prev) => prev.map((s) => ({ ...s, present })))
    toast.success(present ? 'Marked all students as Present' : 'Marked all students as Absent')
  }

  // Save Attendance to API
  const handleSave = async () => {
    if (!activeSession) return
    setSaving(true)
    setAssessmentConfirmation(null)
    try {
      const records = roster.map((s) => ({
        enrollmentId: s.enrollmentId,
        studentId: s.studentId,
        present: s.present,
      }))

      const res = await fetch('/api/trainer/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          records,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save')

      toast.success('Attendance saved & session finalized!')

      // Show assessment release confirmation
      setAssessmentConfirmation({
        assessmentReleased: data.assessmentReleased ?? false,
        presentCount: data.presentCount ?? 0,
        absentCount: data.absentCount ?? 0,
        moduleName: data.moduleName ?? null,
        studentsReleased: data.assessmentStudentsReleased ?? 0,
        assessmentNote: data.assessmentNote ?? '',
      })

      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save attendance')
    } finally {
      setSaving(false)
    }
  }

  // Attendance metrics
  const totalStudents = roster.length
  const presentCount = roster.filter((s) => s.present).length
  const absentCount = totalStudents - presentCount
  const attendancePct = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

  if (sessions.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <CalendarDays style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No Scheduled Sessions</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          You must first schedule a class session before you can record student attendance.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Session Selector & Metadata Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
              Select Scheduled Class Session
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => handleSessionChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                outline: 'none',
              }}
            >
              {sessions.map((s) => {
                const dateStr = new Date(s.sessionDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                })
                const timeStr = new Date(s.startTime).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <option key={s.id} value={s.id}>
                    {s.batchName} — {s.title} ({dateStr} at {timeStr})
                  </option>
                )
              })}
            </select>
          </div>

          {activeSession && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#f8fafc', padding: '12px 18px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Batch</span>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{activeSession.batchName}</p>
              </div>
              <div style={{ width: 1, height: 28, background: '#cbd5e1' }} />
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Course</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>{activeSession.courseTitle}</p>
              </div>
              <div style={{ width: 1, height: 28, background: '#cbd5e1' }} />
              <div>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e40af' }}>
                  {new Date(activeSession.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ·{' '}
                  {new Date(activeSession.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Stats & Quick Bulk Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              Enrolled Students
            </span>
            <Users style={{ width: 16, height: 16, color: '#64748b' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{totalStudents}</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#059669' }}>
              Present Today
            </span>
            <CheckCircle2 style={{ width: 16, height: 16, color: '#059669' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 4 }}>{presentCount}</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dc2626' }}>
              Absent
            </span>
            <XCircle style={{ width: 16, height: 16, color: '#dc2626' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>{absentCount}</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e40af' }}>
              Attendance Rate
            </span>
            <UserCheck style={{ width: 16, height: 16, color: '#1e40af' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#1e40af' }}>{attendancePct}%</span>
          </div>
        </div>
      </div>

      {/* Student Attendance Sheet */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Class Attendance Register</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
              Toggle Present / Absent for each student, then click <strong>Save Attendance</strong> below.
            </p>
          </div>

          {/* Bulk Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => markAll(true)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll(false)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 style={{ width: 28, height: 28, color: '#1e40af', margin: '0 auto' }} className="animate-spin" />
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Loading student roster...</p>
          </div>
        ) : roster.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
            <Users style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No enrolled students in this batch</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roster.map((student) => {
              const initials = student.studentName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div
                  key={student.enrollmentId}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: student.present ? '#f0fdf4' : '#ffffff',
                    border: student.present ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: student.present ? '#16a34a' : '#e2e8f0',
                        color: student.present ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{student.studentName}</p>
                      <p style={{ fontSize: 11.5, color: '#64748b' }}>
                        {student.studentEmail} {student.studentContact ? `· ${student.studentContact}` : ''}
                      </p>
                      {student.joinedAt && (
                        <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 2 }}>
                          Joined online at {new Date(student.joinedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Present / Absent Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleStudent(student.enrollmentId)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 18px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: 'none',
                      background: student.present ? '#16a34a' : '#f1f5f9',
                      color: student.present ? '#ffffff' : '#64748b',
                      boxShadow: student.present ? '0 2px 8px rgba(22, 163, 74, 0.3)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {student.present ? (
                      <>
                        <CheckCircle2 style={{ width: 14, height: 14 }} /> Present
                      </>
                    ) : (
                      <>
                        <XCircle style={{ width: 14, height: 14 }} /> Absent
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions Bar */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {activeSession && (
            <a
              href={`/api/sessions/${activeSession.id}/syllabus-pdf`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <FileText style={{ width: 16, height: 16, color: '#2563eb' }} />
              View Syllabus PDF
            </a>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSendPdf}
              disabled={sendingPdf || presentCount === 0}
              title={presentCount === 0 ? 'Mark at least one student as Present first' : 'Send PDF to all present students'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 22px',
                borderRadius: 12,
                background: sendingPdf || presentCount === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 800,
                border: 'none',
                cursor: sendingPdf || presentCount === 0 ? 'not-allowed' : 'pointer',
                boxShadow: presentCount > 0 ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {sendingPdf ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Send style={{ width: 16, height: 16 }} />}
              {sendingPdf ? 'Sending PDF...' : `Send Session PDF to Attended Students (${presentCount})`}
            </button>

            <button
              onClick={handleSave}
              disabled={saving || roster.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 24px',
                borderRadius: 12,
                background: saving ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 800,
                border: 'none',
                cursor: saving || roster.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(30,64,175,0.3)',
              }}
            >
              {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Save style={{ width: 16, height: 16 }} />}
              {saving ? 'Saving Records...' : 'Save Attendance Register'}
            </button>
          </div>
        </div>

        {/* ── PDF Release Confirmation Banner ─────────────────────────────── */}
        {pdfConfirmation && (
          <div style={{
            marginTop: 20,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #86efac',
            background: '#f0fdf4',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <FileText style={{ width: 20, height: 20, color: '#16a34a', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d' }}>
                📄 Syllabus PDF Dispatched Successfully!
              </div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                {pdfConfirmation.message} Access has been unlocked on the Student Dashboard for all {pdfConfirmation.attendedCount} present students.
              </div>
            </div>
          </div>
        )}

        {/* ── Assessment Release Confirmation Banner ─────────────────────── */}
        {assessmentConfirmation && (
          <div style={{
            marginTop: 20,
            borderRadius: 16,
            overflow: 'hidden',
            border: assessmentConfirmation.assessmentReleased ? '1px solid #86efac' : '1px solid #e2e8f0',
            background: assessmentConfirmation.assessmentReleased ? '#f0fdf4' : '#f8fafc',
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              background: assessmentConfirmation.assessmentReleased ? '#dcfce7' : '#f1f5f9',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Brain style={{ width: 18, height: 18, color: assessmentConfirmation.assessmentReleased ? '#16a34a' : '#64748b', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: assessmentConfirmation.assessmentReleased ? '#15803d' : '#374151' }}>
                  {assessmentConfirmation.assessmentReleased
                    ? `✅ Assessment Released — ${assessmentConfirmation.moduleName || 'Module'}`
                    : '📋 Session Finalized'}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                  {assessmentConfirmation.assessmentNote}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ padding: '12px 18px', display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>{assessmentConfirmation.presentCount}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Present</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}>{assessmentConfirmation.absentCount}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Absent</div>
              </div>
              {assessmentConfirmation.assessmentReleased && (
                <>
                  <div style={{ width: 1, background: '#e2e8f0' }} />
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{assessmentConfirmation.studentsReleased}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Got Assessment</div>
                  </div>
                </>
              )}
            </div>

            {assessmentConfirmation.assessmentReleased && (
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{ fontSize: 11.5, color: '#64748b', background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                  🔒 <strong>{assessmentConfirmation.absentCount} absent student(s)</strong> will NOT receive this assessment. Only present students got access.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

