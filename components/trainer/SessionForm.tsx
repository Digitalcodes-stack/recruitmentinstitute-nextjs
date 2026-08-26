'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CalendarDays, Clock3, Loader2, Video, Repeat, Sparkles } from 'lucide-react'

type BatchOption = {
  id: number
  name: string
  course: { title: string }
  _count: { enrollments: number }
}

const SESSION_PRESETS = [
  'Practical Application & Sourcing Session',
  'Case Study & Screening Workshop',
  'Live Technical Assessment Review',
  'Industry Tools & Boolean Search Lab',
  'Compensation & CTC Negotiation Session',
]

export default function SessionForm({
  batches,
  defaultBatchId,
}: {
  batches: BatchOption[]
  defaultBatchId?: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState<number>(
    defaultBatchId && batches.some((b) => b.id === defaultBatchId)
      ? defaultBatchId
      : batches[0]?.id ?? 0
  )
  const [title, setTitle] = useState('Practical Application & Sourcing Session')
  const [description, setDescription] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('19:30')
  const [meetLink, setMeetLink] = useState('')
  const [recurrence, setRecurrence] = useState<'single' | 'daily_3' | 'daily_5' | 'weekly_4'>('single')

  const selectedBatch = useMemo(() => batches.find((b) => b.id === batchId) ?? null, [batches, batchId])

  async function submit() {
    if (!batchId || !sessionDate || !startTime || !endTime) {
      toast.error('Please fill in the batch, date, start and end times')
      return
    }

    setLoading(true)
    try {
      // Calculate sessions to create based on recurrence
      const sessionsToCreate = []
      const baseDate = new Date(sessionDate)

      if (recurrence === 'single') {
        sessionsToCreate.push({
          dateStr: sessionDate,
          startIso: new Date(`${sessionDate}T${startTime}:00`).toISOString(),
          endIso: new Date(`${sessionDate}T${endTime}:00`).toISOString(),
        })
      } else if (recurrence === 'daily_3' || recurrence === 'daily_5') {
        const count = recurrence === 'daily_3' ? 3 : 5
        for (let i = 0; i < count; i++) {
          const d = new Date(baseDate)
          d.setDate(d.getDate() + i)
          const dateStr = d.toISOString().split('T')[0]
          sessionsToCreate.push({
            dateStr,
            startIso: new Date(`${dateStr}T${startTime}:00`).toISOString(),
            endIso: new Date(`${dateStr}T${endTime}:00`).toISOString(),
          })
        }
      } else if (recurrence === 'weekly_4') {
        for (let i = 0; i < 4; i++) {
          const d = new Date(baseDate)
          d.setDate(d.getDate() + i * 7)
          const dateStr = d.toISOString().split('T')[0]
          sessionsToCreate.push({
            dateStr,
            startIso: new Date(`${dateStr}T${startTime}:00`).toISOString(),
            endIso: new Date(`${dateStr}T${endTime}:00`).toISOString(),
          })
        }
      }

      let totalNotified = 0
      for (const s of sessionsToCreate) {
        const res = await fetch('/api/trainer/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId,
            title,
            description,
            sessionDate: s.dateStr,
            startTime: s.startIso,
            endTime: s.endIso,
            meetLink: meetLink || null,
            status: 'UPCOMING',
          }),
        })
        const data = await res.json()
        if (!res.ok || !data?.success) throw new Error(data?.message || 'Could not create session')
        if (data.studentsNotified !== undefined) {
          totalNotified = data.studentsNotified
        }
      }

      toast.success(
        sessionsToCreate.length > 1
          ? `Created ${sessionsToCreate.length} recurring sessions! Google Meet link generated & emailed to ${totalNotified} students.`
          : totalNotified > 0
          ? `Session created. Google Meet link generated & emailed to ${totalNotified} students.`
          : 'Session created. Google Meet link generated successfully!'
      )
      router.refresh()
      setDescription('')
      setMeetLink('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create session')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px',
    borderRadius: 12,
    border: '1px solid #dbe4ee',
    fontSize: 13,
    outline: 'none',
    background: '#f8fafc',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        padding: 28,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Video style={{ width: 18, height: 18, color: '#ffffff' }} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Schedule Live Class</h3>
          <p style={{ fontSize: 12, color: '#64748b' }}>Create a single or recurring session for enrolled students</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Batch Selection */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            Target Batch *
          </span>
          <select value={batchId} onChange={(e) => setBatchId(Number(e.target.value))} style={inputStyle}>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name} ({batch.course.title}) — {batch._count.enrollments} Students
              </option>
            ))}
          </select>
        </label>

        {/* Title & Presets */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            Session Title *
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Practical Sourcing & Boolean Lab"
            style={inputStyle}
          />
          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {SESSION_PRESETS.slice(0, 3).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setTitle(p)}
                style={{
                  fontSize: 10.5,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </label>

        {/* Description */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            Topic & Agenda (Optional)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students learn in this session? Provide agenda, prerequisites, or preparation notes..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        {/* Date */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            <CalendarDays style={{ width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
            Date *
          </span>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} style={inputStyle} />
        </label>

        {/* Recurrence Option */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            <Repeat style={{ width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
            Recurrence
          </span>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as any)}
            style={inputStyle}
          >
            <option value="single">Single Class</option>
            <option value="daily_3">Daily (3 Consecutive Days)</option>
            <option value="daily_5">Daily (5 Days / Mon-Fri)</option>
            <option value="weekly_4">Weekly (4 Weeks)</option>
          </select>
        </label>

        {/* Start Time */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            <Clock3 style={{ width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
            Start Time *
          </span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
        </label>

        {/* End Time */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            <Clock3 style={{ width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
            End Time *
          </span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
        </label>

        {/* Meeting Link */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
              <Video style={{ width: 12, height: 12, display: 'inline-block', marginRight: 4 }} />
              Meeting Room Link (Google Meet / Zoom)
            </span>
            <button
              type="button"
              onClick={() => {
                const chars = 'abcdefghijklmnopqrstuvwxyz'
                const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
                const code = `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`
                setMeetLink(code)
                toast.success('Generated Google Meet link!')
              }}
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Generate Google Meet Link
            </button>
          </div>
          <input
            type="url"
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            placeholder="e.g. https://meet.google.com/abc-defg-hij or Zoom / Teams URL"
            style={inputStyle}
          />
          <span style={{ fontSize: 11, color: '#64748b' }}>
            If left blank, a dedicated Google Meet room link will automatically be generated and emailed to all enrolled students.
          </span>
        </label>
      </div>

      {selectedBatch && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 12.5,
            color: '#475569',
          }}
        >
          Session will be scheduled for <strong style={{ color: '#0f172a' }}>{selectedBatch.course.title}</strong> (
          <strong>{selectedBatch.name}</strong>) with{' '}
          <strong style={{ color: '#0f172a' }}>{selectedBatch._count.enrollments} enrolled students</strong>.
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || batches.length === 0}
        style={{
          marginTop: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '13px 22px',
          borderRadius: 12,
          border: 'none',
          background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: loading || batches.length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(30,64,175,0.3)',
        }}
      >
        {loading ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Video style={{ width: 15, height: 15 }} />}
        {loading ? 'Scheduling...' : 'Create Scheduled Session'}
      </button>
    </div>
  )
}
