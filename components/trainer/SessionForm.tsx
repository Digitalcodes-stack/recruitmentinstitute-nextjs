'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CalendarDays, Clock3, Loader2, Video } from 'lucide-react'

type BatchOption = {
  id: number
  name: string
  course: { title: string }
  _count: { enrollments: number }
}

export default function SessionForm({ batches }: { batches: BatchOption[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState<number>(batches[0]?.id ?? 0)
  const [title, setTitle] = useState('Training Session')
  const [description, setDescription] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const selectedBatch = useMemo(() => batches.find((b) => b.id === batchId) ?? null, [batches, batchId])

  async function submit() {
    if (!batchId || !sessionDate || !startTime || !endTime) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      const datePart = sessionDate
      const startIso = new Date(`${datePart}T${startTime}:00`).toISOString()
      const endIso = new Date(`${datePart}T${endTime}:00`).toISOString()
      const res = await fetch('/api/trainer/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          title,
          description,
          sessionDate,
          startTime: startIso,
          endTime: endIso,
          status: 'UPCOMING',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not create session')
      toast.success('Session created and queued for calendar sync')
      router.refresh()
      setDescription('')
      setTitle('Training Session')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Video style={{ width: 16, height: 16, color: '#7c3aed' }} />
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Session</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Batch</span>
          <select value={batchId} onChange={(e) => setBatchId(Number(e.target.value))} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13 }}>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.course.title} · {batch.name} ({batch._count.enrollments})
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Session Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13 }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13, resize: 'vertical' }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
            <CalendarDays style={{ width: 12, height: 12, display: 'inline-block', marginRight: 6 }} />
            Date
          </span>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13 }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
            <Clock3 style={{ width: 12, height: 12, display: 'inline-block', marginRight: 6 }} />
            Start Time
          </span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13 }} />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
            <Clock3 style={{ width: 12, height: 12, display: 'inline-block', marginRight: 6 }} />
            End Time
          </span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '11px 12px', borderRadius: 12, border: '1px solid #dbe4ee', fontSize: 13 }} />
        </label>
      </div>

      {selectedBatch ? (
        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
          Session will be created for <strong>{selectedBatch.course.title}</strong> in batch <strong>{selectedBatch.name}</strong>.
        </div>
      ) : null}

      <button
        onClick={submit}
        disabled={loading || batches.length === 0}
        style={{
          marginTop: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 18px',
          borderRadius: 12,
          border: 'none',
          background: loading ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: loading || batches.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Video style={{ width: 14, height: 14 }} />}
        Create Session
      </button>
    </div>
  )
}
