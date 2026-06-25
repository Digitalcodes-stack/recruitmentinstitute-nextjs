'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ArrowLeft, Send, Loader2, Clock } from 'lucide-react'

interface Template {
  id: number
  name: string
  channel: string
}

interface Batch {
  id: number
  name: string
  course: { title: string }
}

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP']
const AUDIENCES = [
  { value: 'ALL_STUDENTS', label: 'All Active Students' },
  { value: 'ALL_CANDIDATES', label: 'All Candidates' },
  { value: 'SEGMENT', label: 'Students in a Batch' },
]

export default function NotificationCampaignForm({ templates, batches }: { templates: Template[]; batches: Batch[] }) {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    templateId: '',
    channels: [] as string[],
    audienceType: 'ALL_STUDENTS',
    batchId: '',
    sendMode: 'now' as 'now' | 'schedule',
    scheduledAt: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleChannel(c: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(c) ? f.channels.filter((x) => x !== c) : [...f.channels, c],
    }))
    setErrors((e) => ({ ...e, channels: '' }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (form.channels.length === 0) errs.channels = 'Select at least one channel'
    if (!form.templateId) errs.templateId = 'Select a template'
    if (form.audienceType === 'SEGMENT' && !form.batchId) errs.batchId = 'Select a batch'
    if (form.sendMode === 'schedule' && !form.scheduledAt) errs.scheduledAt = 'Pick a date/time'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setApiError('')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          templateId: Number(form.templateId),
          channels: form.channels,
          audienceType: form.audienceType,
          audienceFilter: form.audienceType === 'SEGMENT' ? { batchId: Number(form.batchId) } : undefined,
          scheduledAt: form.sendMode === 'schedule' ? new Date(form.scheduledAt).toISOString() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          const mapped: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.errors as Record<string, string[]>)) mapped[k] = v[0]
          setErrors(mapped)
        } else {
          setApiError(data.message || 'Something went wrong')
        }
        return
      }
      router.push(`/admin/notifications/${data.data.id}`)
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
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/notifications')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <Bell style={{ width: 11, height: 11 }} />
          New Campaign
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        {templates.length === 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#b45309', marginBottom: 18 }}>
            No templates yet. <a href="/admin/notifications/templates/new" style={{ fontWeight: 700, textDecoration: 'underline' }}>Create one first</a>.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Campaign Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. June Batch Session Reminder" style={inputStyle('title')} />
            {errors.title && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.title}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Template *</label>
            <select value={form.templateId} onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))} style={inputStyle('templateId')}>
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
              ))}
            </select>
            {errors.templateId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.templateId}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Channels *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CHANNELS.map((c) => {
                const active = form.channels.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                      background: active ? '#eff6ff' : '#fff',
                      color: active ? '#2563eb' : '#64748b',
                    }}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
            {errors.channels && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.channels}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Audience *</label>
            <select value={form.audienceType} onChange={(e) => setForm((f) => ({ ...f, audienceType: e.target.value }))} style={inputStyle('audienceType')}>
              {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          {form.audienceType === 'SEGMENT' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Batch *</label>
              <select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))} style={inputStyle('batchId')}>
                <option value="">Select a batch…</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} — {b.course.title}</option>
                ))}
              </select>
              {errors.batchId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.batchId}</p>}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>When</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button type="button" onClick={() => setForm((f) => ({ ...f, sendMode: 'now' }))}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${form.sendMode === 'now' ? '#2563eb' : '#e2e8f0'}`,
                  background: form.sendMode === 'now' ? '#eff6ff' : '#fff', color: form.sendMode === 'now' ? '#2563eb' : '#64748b' }}>
                <Send style={{ width: 12, height: 12, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Send Now
              </button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, sendMode: 'schedule' }))}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${form.sendMode === 'schedule' ? '#2563eb' : '#e2e8f0'}`,
                  background: form.sendMode === 'schedule' ? '#eff6ff' : '#fff', color: form.sendMode === 'schedule' ? '#2563eb' : '#64748b' }}>
                <Clock style={{ width: 12, height: 12, display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Schedule
              </button>
            </div>
            {form.sendMode === 'schedule' && (
              <>
                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))} style={inputStyle('scheduledAt')} />
                {errors.scheduledAt && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.scheduledAt}</p>}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/notifications')}
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
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Send style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (form.sendMode === 'now' ? 'Create & Send' : 'Schedule Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
