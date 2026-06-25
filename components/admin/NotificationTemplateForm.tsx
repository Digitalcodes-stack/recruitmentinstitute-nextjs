'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ArrowLeft, Save, Loader2 } from 'lucide-react'

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP']

export default function NotificationTemplateForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    key: '',
    name: '',
    channel: 'EMAIL',
    subject: '',
    bodyHtml: '',
    bodyText: '',
    whatsappTemplateName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.key.trim()) errs.key = 'Key is required'
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.channel === 'EMAIL' && !form.bodyHtml.trim()) errs.bodyHtml = 'Email body is required'
    if (form.channel !== 'EMAIL' && !form.bodyText.trim()) errs.bodyText = 'Message body is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setApiError('')
    try {
      const res = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, variables: [] }),
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
      router.push('/admin/notifications/templates')
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
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/notifications/templates')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <FileText style={{ width: 11, height: 11 }} />
          New Template
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Key * <span style={{ color: '#94a3b8', fontWeight: 400 }}>(unique, e.g. session_reminder)</span></label>
            <input type="text" value={form.key} onChange={set('key')} placeholder="e.g. fee_due_reminder" style={inputStyle('key')} />
            {errors.key && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.key}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Fee Due Reminder" style={inputStyle('name')} />
            {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Channel *</label>
            <select value={form.channel} onChange={set('channel')} style={inputStyle('channel')}>
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {form.channel === 'EMAIL' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject</label>
              <input type="text" value={form.subject} onChange={set('subject')} placeholder="e.g. Your fee for {{courseName}} is due" style={inputStyle('subject')} />
            </div>
          )}

          {form.channel === 'EMAIL' ? (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Body (HTML) *</label>
              <textarea value={form.bodyHtml} onChange={set('bodyHtml')} rows={6} placeholder="<p>Hi {{studentName}}, ...</p>" style={{ ...inputStyle('bodyHtml'), resize: 'vertical', fontFamily: 'monospace', fontSize: 12.5 }} />
              {errors.bodyHtml && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.bodyHtml}</p>}
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message Body *</label>
              <textarea value={form.bodyText} onChange={set('bodyText')} rows={4} placeholder="Hi {{studentName}}, your session starts at {{startTime}}." style={{ ...inputStyle('bodyText'), resize: 'vertical' }} />
              {errors.bodyText && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.bodyText}</p>}
            </div>
          )}

          {form.channel === 'WHATSAPP' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Meta-approved Template Name (optional)</label>
              <input type="text" value={form.whatsappTemplateName} onChange={set('whatsappTemplateName')} placeholder="e.g. session_reminder_en" style={inputStyle('whatsappTemplateName')} />
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Leave blank to send as a free-form text message (only works within a 24h customer-initiated session).</p>
            </div>
          )}

          <p style={{ fontSize: 11.5, color: '#94a3b8' }}>Use <code>{'{{variableName}}'}</code> placeholders — they're filled in per-campaign or per-recipient when sent.</p>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/notifications/templates')}
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
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
