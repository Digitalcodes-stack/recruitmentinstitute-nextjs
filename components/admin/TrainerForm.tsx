'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, ArrowLeft, Save, Loader2, Clock, Plus, X } from 'lucide-react'
import ImageUploadField from './ImageUploadField'

interface AvailabilitySlot {
  id?: number
  dayOfWeek: number // 0=Sun ... 6=Sat
  startTime: string // "HH:mm"
  endTime: string   // "HH:mm"
}

interface Trainer {
  id: number
  name: string
  email: string
  phone: string | null
  specialization: string | null
  bio: string | null
  image: string | null
  isActive: boolean
  availability?: AvailabilitySlot[]
}

interface Props {
  trainer?: Trainer
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function TrainerForm({ trainer }: Props) {
  const router = useRouter()
  const isEdit = !!trainer

  const [form, setForm] = useState({
    name: trainer?.name ?? '',
    email: trainer?.email ?? '',
    password: '',
    phone: trainer?.phone ?? '',
    specialization: trainer?.specialization ?? '',
    bio: trainer?.bio ?? '',
    image: trainer?.image ?? '',
    isActive: trainer?.isActive ?? true,
  })
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    trainer?.availability?.length
      ? trainer.availability.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }))
      : []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  function addSlot(day: number) {
    setAvailability((prev) => [...prev, { dayOfWeek: day, startTime: '18:00', endTime: '21:00' }])
  }
  function removeSlot(index: number) {
    setAvailability((prev) => prev.filter((_, i) => i !== index))
  }
  function updateSlot(index: number, field: 'startTime' | 'endTime', value: string) {
    setAvailability((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }
  function toggleDay(day: number) {
    const hasDay = availability.some((s) => s.dayOfWeek === day)
    if (hasDay) {
      setAvailability((prev) => prev.filter((s) => s.dayOfWeek !== day))
    } else {
      addSlot(day)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!isEdit && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    for (const slot of availability) {
      if (slot.endTime <= slot.startTime) { errs.availability = 'Each slot\'s end time must be after its start time'; break }
    }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/trainers/${trainer!.id}` : '/api/admin/trainers'
      const method = isEdit ? 'PUT' : 'POST'
      const payload: Record<string, unknown> = { ...form, availability }
      if (isEdit && !form.password) delete payload.password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      router.push('/admin/trainers')
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
          onClick={() => router.push('/admin/trainers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}>
          <GraduationCap style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Trainer' : 'Add Trainer'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? `Edit: ${trainer!.name}` : 'New Trainer'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update trainer details and account status.' : 'Add a trainer who can be assigned to batches.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Priya Sharma" style={inputStyle('name')} />
            {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="trainer@example.com" style={inputStyle('email')} />
            {errors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" style={inputStyle('password')} />
            {errors.password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone</label>
            <input type="text" value={form.phone} onChange={set('phone')} placeholder="e.g. 9876543210" style={inputStyle('phone')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Specialization</label>
            <input type="text" value={form.specialization} onChange={set('specialization')} placeholder="e.g. Talent Acquisition, HR Analytics" style={inputStyle('specialization')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Short professional bio…" style={{ ...inputStyle('bio'), resize: 'vertical' }} />
          </div>

          {/* Availability */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock style={{ width: 13, height: 13, color: '#7c3aed' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Weekly Availability</span>
            </div>
            <p style={{ fontSize: 11.5, color: '#64748b', marginBottom: 12 }}>
              Select the days this trainer can take classes, then set the time window(s) for each day. Times are IST. Used to auto-assign trainers to new batches.
            </p>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {DAY_SHORT.map((label, day) => {
                const active = availability.some((s) => s.dayOfWeek === day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${active ? '#7c3aed' : '#e2e8f0'}`,
                      background: active ? '#7c3aed' : '#fff',
                      color: active ? '#fff' : '#64748b',
                      transition: 'all 0.15s',
                    }}
                  >{label}</button>
                )
              })}
            </div>

            {availability.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...availability]
                  .map((slot, idx) => ({ slot, idx }))
                  .sort((a, b) => a.slot.dayOfWeek - b.slot.dayOfWeek)
                  .map(({ slot, idx }) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px' }}>
                      <span style={{ minWidth: 68, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{DAY_LABELS[slot.dayOfWeek].slice(0, 3)}</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0', outline: 'none' }}
                      />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => addSlot(slot.dayOfWeek)}
                        title="Add another time slot on this day"
                        style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus style={{ width: 12, height: 12, color: '#64748b' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(idx)}
                        title="Remove this slot"
                        style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X style={{ width: 12, height: 12, color: '#dc2626' }} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {errors.availability && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 8 }}>{errors.availability}</p>}
          </div>

          <ImageUploadField
            label="Photo"
            value={form.image}
            onChange={url => setForm(f => ({ ...f, image: url }))}
            folder="trainers"
            previewShape="circle"
            placeholder="Paste URL or click Browse…"
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              style={{ width: 16, height: 16 }}
            />
            Active (can be assigned to batches and can log in)
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/trainers')}
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
              {saving ? 'Saving…' : (isEdit ? 'Update Trainer' : 'Save Trainer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
