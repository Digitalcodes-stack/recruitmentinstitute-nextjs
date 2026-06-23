'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layers3, ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Course { id: number; title: string }
interface Trainer { id: number; name: string }

interface Batch {
  id: number
  name: string
  courseId: number
  trainerId: number
  capacity: number
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID'
  startDate: string | Date
  endDate: string | Date | null
  schedule: string | null
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

interface Props {
  courses: Course[]
  trainers: Trainer[]
  batch?: Batch
}

function toDateInput(value: string | Date | null) {
  if (!value) return ''
  const d = new Date(value)
  return d.toISOString().slice(0, 10)
}

export default function BatchForm({ courses, trainers, batch }: Props) {
  const router = useRouter()
  const isEdit = !!batch

  const [form, setForm] = useState({
    name: batch?.name ?? '',
    courseId: batch?.courseId ? String(batch.courseId) : '',
    trainerId: batch?.trainerId ? String(batch.trainerId) : '',
    capacity: String(batch?.capacity ?? 30),
    mode: batch?.mode ?? 'ONLINE',
    startDate: toDateInput(batch?.startDate ?? null),
    endDate: toDateInput(batch?.endDate ?? null),
    schedule: batch?.schedule ?? '',
    status: batch?.status ?? 'UPCOMING',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Batch name is required'
    if (!form.courseId) errs.courseId = 'Course is required'
    if (!form.trainerId) errs.trainerId = 'Trainer is required'
    if (!form.startDate) errs.startDate = 'Start date is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/batches/${batch!.id}` : '/api/admin/batches'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          courseId: Number(form.courseId),
          trainerId: Number(form.trainerId),
          capacity: Number(form.capacity),
          endDate: form.endDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          const mapped: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.errors as Record<string, string[]>))
            mapped[k] = v[0]
          setErrors(mapped)
        } else {
          setApiError(data.message || 'Something went wrong')
        }
        return
      }
      router.push('/admin/batches')
      router.refresh()
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = (key: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    border: `1px solid ${errors[key] ? '#ef4444' : '#e2e8f0'}`,
    outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff',
  })

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/batches')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <Layers3 style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Batch' : 'New Batch'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? `Edit: ${batch!.name}` : 'New Batch'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update batch schedule, trainer, or status.' : 'Create a batch and assign a course and trainer.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        {courses.length === 0 || trainers.length === 0 ? (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 18 }}>
            {courses.length === 0 && 'No courses exist yet. '}
            {trainers.length === 0 && 'No trainers exist yet. '}
            Create them first before adding a batch.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Batch Name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Python Batch A" style={inputStyle('name')} />
            {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Course *</label>
            <select value={form.courseId} onChange={set('courseId')} style={{ ...inputStyle('courseId'), color: form.courseId ? '#0f172a' : '#94a3b8' }}>
              <option value="">Select a course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {errors.courseId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.courseId}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Trainer *</label>
            <select value={form.trainerId} onChange={set('trainerId')} style={{ ...inputStyle('trainerId'), color: form.trainerId ? '#0f172a' : '#94a3b8' }}>
              <option value="">Select a trainer…</option>
              {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.trainerId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.trainerId}</p>}
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Capacity</label>
              <input type="number" min={1} value={form.capacity} onChange={set('capacity')} style={inputStyle('capacity')} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mode</label>
              <select value={form.mode} onChange={set('mode')} style={inputStyle('mode')}>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Start Date *</label>
              <input type="date" value={form.startDate} onChange={set('startDate')} style={inputStyle('startDate')} />
              {errors.startDate && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.startDate}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>End Date</label>
              <input type="date" value={form.endDate} onChange={set('endDate')} style={inputStyle('endDate')} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Schedule</label>
            <input type="text" value={form.schedule} onChange={set('schedule')} placeholder="e.g. Mon–Fri, 7–9 PM IST" style={inputStyle('schedule')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
            <select value={form.status} onChange={set('status')} style={inputStyle('status')}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/batches')}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1,
              }}
            >
              {saving
                ? <Loader2 style={{ width: 14, height: 14 }} />
                : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (isEdit ? 'Update Batch' : 'Save Batch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
