'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, ArrowLeft, Save, Loader2 } from 'lucide-react'
import ImageUploadField from './ImageUploadField'

interface Trainer {
  id: number
  name: string
  email: string
  phone: string | null
  specialization: string | null
  bio: string | null
  image: string | null
  isActive: boolean
}

interface Props {
  trainer?: Trainer
}

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

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
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/trainers/${trainer!.id}` : '/api/admin/trainers'
      const method = isEdit ? 'PUT' : 'POST'
      const payload: Record<string, unknown> = { ...form }
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
