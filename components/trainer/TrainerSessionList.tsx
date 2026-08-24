'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CalendarDays, Video, Trash2, Edit3, X, Loader2, Clock3 } from 'lucide-react'

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
}

export default function TrainerSessionList({ sessions, batches }: Props) {
  const router = useRouter()
  const [editingSession, setEditingSession] = useState<SessionRow | null>(null)
  
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

  const handleOpenEdit = (session: SessionRow) => {
    setEditingSession(session)
    setEditBatchId(session.batchId)
    setEditTitle(session.title)
    setEditDescription(session.description || '')
    
    const dStart = new Date(session.startTime)
    const dEnd = new Date(session.endTime)
    
    // Format local date YYYY-MM-DD
    const localDate = dStart.getFullYear() + '-' + String(dStart.getMonth() + 1).padStart(2, '0') + '-' + String(dStart.getDate()).padStart(2, '0')
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
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sessions.map((s) => (
          <div key={s.id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.title}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                  {s.batch.course.title} · {s.batch.name} · {new Date(s.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · <span style={{ fontWeight: 600, color: s.status === 'CANCELLED' ? '#ef4444' : s.status === 'COMPLETED' ? '#10b981' : '#f59e0b' }}>{s.status}</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleOpenEdit(s)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Edit Session"
                >
                  <Edit3 style={{ width: 12, height: 12, color: '#64748b' }} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete Session"
                >
                  <Trash2 style={{ width: 12, height: 12, color: '#ef4444' }} />
                </button>
              </div>
            </div>
            {s.meetLink ? (
              <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2563eb', marginTop: 8, textDecoration: 'none', fontWeight: 600 }}>
                <Video style={{ width: 11, height: 11 }} /> Open Meet
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSession && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseEdit() }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Edit Training Session</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Modify scheduled class settings and timings.</p>
              </div>
              <button onClick={handleCloseEdit} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: 12, height: 12, color: '#64748b' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>Batch</span>
                  <select value={editBatchId} onChange={(e) => setEditBatchId(Number(e.target.value))} style={inputStyle}>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.course.title} · {batch.name} ({batch._count.enrollments})
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>Session Title</span>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} required />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>Description</span>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>
                    <Video style={{ width: 11, height: 11, display: 'inline-block', marginRight: 4 }} />
                    Meeting Link
                  </span>
                  <input
                    type="url"
                    value={editMeetLink}
                    onChange={(e) => setEditMeetLink(e.target.value)}
                    placeholder="e.g. https://meet.google.com/abc-defg-hij or a Zoom link"
                    style={inputStyle}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>
                      <CalendarDays style={{ width: 11, height: 11, display: 'inline-block', marginRight: 4 }} />
                      Date
                    </span>
                    <input type="date" value={editSessionDate} onChange={(e) => setEditSessionDate(e.target.value)} style={inputStyle} required />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>Status</span>
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
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>
                      <Clock3 style={{ width: 11, height: 11, display: 'inline-block', marginRight: 4 }} />
                      Start Time
                    </span>
                    <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} style={inputStyle} required />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em', color: '#94a3b8' }}>
                      <Clock3 style={{ width: 11, height: 11, display: 'inline-block', marginRight: 4 }} />
                      End Time
                    </span>
                    <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} style={inputStyle} required />
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
