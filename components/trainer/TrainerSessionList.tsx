'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  Video,
  Trash2,
  Edit3,
  X,
  Loader2,
  Clock3,
  Search,
  UserCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

type BatchOption = {
  id: number
  name: string
  course: { title: string }
  _count: { enrollments: number }
}

type SessionRow = {
  id: number
  batchId: number
  title: string
  description: string | null
  sessionDate: Date | string
  startTime: Date | string
  endTime: Date | string
  meetLink: string | null
  status: string
  batch: {
    id: number
    name: string
    course: { title: string }
  }
}

interface Props {
  sessions: SessionRow[]
  batches: BatchOption[]
  defaultBatchFilter?: number
}

export default function TrainerSessionList({ sessions, batches, defaultBatchFilter }: Props) {
  const router = useRouter()
  const [editingSession, setEditingSession] = useState<SessionRow | null>(null)
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number>(defaultBatchFilter || 0)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit Form state
  const [loading, setLoading] = useState(false)
  const [editBatchId, setEditBatchId] = useState<number>(0)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSessionDate, setEditSessionDate] = useState('')
  const [editStartTime, setEditStartTime] = useState('')
  const [editEndTime, setEditEndTime] = useState('')
  const [editStatus, setEditStatus] = useState('UPCOMING')
  const [editMeetLink, setEditMeetLink] = useState('')

  const now = new Date()

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Batch filter
      if (selectedBatchFilter !== 0 && s.batchId !== selectedBatchFilter) return false

      // Status filter
      if (statusFilter === 'UPCOMING') {
        if (s.status === 'CANCELLED') return false
        if (new Date(s.startTime) < now && s.status !== 'LIVE') return false
      } else if (statusFilter === 'COMPLETED') {
        if (s.status !== 'COMPLETED' && new Date(s.endTime) > now) return false
      } else if (statusFilter === 'CANCELLED') {
        if (s.status !== 'CANCELLED') return false
      } else if (statusFilter === 'LIVE') {
        if (s.status !== 'LIVE') return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = s.title.toLowerCase().includes(q)
        const batchMatch = s.batch.name.toLowerCase().includes(q) || s.batch.course.title.toLowerCase().includes(q)
        if (!titleMatch && !batchMatch) return false
      }

      return true
    })
  }, [sessions, selectedBatchFilter, statusFilter, searchQuery, now])

  const handleOpenEdit = (session: SessionRow) => {
    setEditingSession(session)
    setEditBatchId(session.batchId)
    setEditTitle(session.title)
    setEditDescription(session.description || '')

    const dStart = new Date(session.startTime)
    const dEnd = new Date(session.endTime)

    // Format local date YYYY-MM-DD
    const localDate =
      dStart.getFullYear() +
      '-' +
      String(dStart.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dStart.getDate()).padStart(2, '0')
    setEditSessionDate(localDate)

    // Format local time HH:MM
    const localStartTime = String(dStart.getHours()).padStart(2, '0') + ':' + String(dStart.getMinutes()).padStart(2, '0')
    const localEndTime = String(dEnd.getHours()).padStart(2, '0') + ':' + String(dEnd.getMinutes()).padStart(2, '0')

    setEditStartTime(localStartTime)
    setEditEndTime(localEndTime)
    setEditStatus(session.status)
    setEditMeetLink(session.meetLink || '')
  }

  const handleCloseEdit = () => {
    setEditingSession(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return

    if (!editBatchId || !editSessionDate || !editStartTime || !editEndTime) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const startIso = new Date(`${editSessionDate}T${editStartTime}:00`).toISOString()
      const endIso = new Date(`${editSessionDate}T${editEndTime}:00`).toISOString()

      const res = await fetch(`/api/trainer/sessions/${editingSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: editBatchId,
          title: editTitle,
          description: editDescription,
          sessionDate: editSessionDate,
          startTime: startIso,
          endTime: endIso,
          meetLink: editMeetLink || null,
          status: editStatus,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not update session')

      toast.success('Session updated successfully')
      setEditingSession(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update session')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to delete this session? This will notify enrolled students.')) {
      return
    }

    const toastId = toast.loading('Deleting session...')
    try {
      const res = await fetch(`/api/trainer/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not delete session')

      toast.success('Session deleted successfully', { id: toastId })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete session', { id: toastId })
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    fontSize: 13,
    border: '1px solid #dbe4ee',
    outline: 'none',
    color: '#0f172a',
    background: '#f8fafc',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search and Filters Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search session title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 10,
                border: '1px solid #dbe4ee',
                fontSize: 12.5,
                background: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(Number(e.target.value))}
            style={{
              padding: '9px 12px',
              borderRadius: 10,
              border: '1px solid #dbe4ee',
              fontSize: 12.5,
              background: '#ffffff',
              color: '#334155',
              outline: 'none',
            }}
          >
            <option value={0}>All Batches ({sessions.length})</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Sessions' },
            { key: 'UPCOMING', label: 'Upcoming' },
            { key: 'LIVE', label: 'Live Now' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === pill.key ? '#1e40af' : '#f1f5f9',
                color: statusFilter === pill.key ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards List */}
      {filteredSessions.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16, border: '1px solid #edf2f7' }}>
          <CalendarDays style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#334155' }}>No sessions found</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Try adjusting your filters or create a new scheduled class using the form on the left.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredSessions.map((s) => {
            const dStart = new Date(s.startTime)
            const dEnd = new Date(s.endTime)
            const dateLabel = new Date(s.sessionDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
            const timeLabel = `${dStart.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${dEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`

            const isCancelled = s.status === 'CANCELLED'
            const isLive = !isCancelled && (s.status === 'LIVE' || (dStart <= now && dEnd >= now))
            const isCompleted = !isCancelled && !isLive && (s.status === 'COMPLETED' || dEnd < now)
            const isUpcoming = !isCancelled && !isLive && !isCompleted

            return (
              <div
                key={s.id}
                style={{
                  padding: '16px 18px',
                  background: isLive ? '#fef2f2' : isCompleted ? '#fafbfc' : '#ffffff',
                  borderRadius: 16,
                  border: isLive ? '1.5px solid #f87171' : isCompleted ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>{s.title}</p>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 7px',
                          borderRadius: 6,
                          background: isCancelled
                            ? '#fef2f2'
                            : isLive
                            ? '#dc2626'
                            : isCompleted
                            ? '#ecfdf5'
                            : '#eff6ff',
                          color: isCancelled
                            ? '#dc2626'
                            : isLive
                            ? '#ffffff'
                            : isCompleted
                            ? '#059669'
                            : '#1e40af',
                          border: isLive ? 'none' : `1px solid ${isCancelled ? '#fecaca' : isCompleted ? '#a7f3d0' : '#bfdbfe'}`,
                        }}
                      >
                        {isCancelled ? 'Cancelled' : isLive ? '● LIVE NOW' : isCompleted ? '✓ Completed' : 'Upcoming'}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginTop: 3 }}>
                      {s.batch.name} · {s.batch.course.title}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CalendarDays style={{ width: 13, height: 13, color: '#1e40af' }} />
                      <strong>{dateLabel}</strong> · {timeLabel}
                    </p>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Edit Session"
                    >
                      <Edit3 style={{ width: 13, height: 13, color: '#475569' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: '1px solid #fecaca',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete Session"
                    >
                      <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
                    </button>
                  </div>
                </div>

                {s.description && (
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                    {s.description}
                  </p>
                )}

                {/* Session Bottom Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 8 }}>
                  {/* Meet Link / Completed Badge */}
                  {isCompleted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#059669',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        padding: '6px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <CheckCircle2 style={{ width: 13, height: 13 }} />
                      Session Completed
                    </span>
                  ) : isCancelled ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <AlertCircle style={{ width: 13, height: 13 }} />
                      Session Cancelled
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
                            padding: '6px 14px',
                            borderRadius: 8,
                            textDecoration: 'none',
                            boxShadow: isLive ? '0 2px 6px rgba(220,38,38,0.25)' : '0 2px 6px rgba(37,99,235,0.25)',
                          }}
                        >
                          <Video style={{ width: 13, height: 13 }} />
                          {isLive ? 'Join Live Room' : 'Open Meet Room'}
                          <ExternalLink style={{ width: 11, height: 11 }} />
                        </a>
                      )
                    })()
                  )}

                  {/* Attendance Register Link */}
                  <Link
                    href={`/trainer/attendance?sessionId=${s.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    <UserCheck style={{ width: 13, height: 13, color: '#16a34a' }} />
                    {isCompleted ? 'Review Attendance' : 'Mark Attendance'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseEdit()
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
          <div
            style={{
              position: 'relative',
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Edit Training Session</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Modify scheduled timings or meeting link.</p>
              </div>
              <button
                onClick={handleCloseEdit}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: 14, height: 14, color: '#64748b' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Batch
                  </span>
                  <select value={editBatchId} onChange={(e) => setEditBatchId(Number(e.target.value))} style={inputStyle}>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.course.title} · {batch.name} ({batch._count.enrollments})
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Session Title
                  </span>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} required />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Description
                  </span>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Meeting Link
                  </span>
                  <input
                    type="url"
                    value={editMeetLink}
                    onChange={(e) => setEditMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    style={inputStyle}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Date
                    </span>
                    <input type="date" value={editSessionDate} onChange={(e) => setEditSessionDate(e.target.value)} style={inputStyle} required />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Status
                    </span>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={inputStyle}>
                      <option value="UPCOMING">Upcoming</option>
                      <option value="LIVE">Live</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Start Time
                    </span>
                    <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} style={inputStyle} required />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      End Time
                    </span>
                    <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} style={inputStyle} required />
                  </label>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 22px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
