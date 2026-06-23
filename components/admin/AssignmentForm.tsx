'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Batch { id: number; name: string }

interface Assignment {
  id: number
  batchId: number
  title: string
  description: string | null
  fileUrl: string | null
  dueAt: string | Date
}

interface Props {
  batches: Batch[]
  assignment?: Assignment
}

function toDateTimeInput(value: string | Date | null) {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AssignmentForm({ batches, assignment }: Props) {
  const router = useRouter()
  const isEdit = !!assignment

  const [form, setForm] = useState({
    batchId: assignment?.batchId ? String(assignment.batchId) : '',
    title: assignment?.title ?? '',
    description: assignment?.description ?? '',
    fileUrl: assignment?.fileUrl ?? '',
    dueAt: toDateTimeInput(assignment?.dueAt ?? null),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.batchId) errs.batchId = 'Batch is required'
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.dueAt) errs.dueAt = 'Due date is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/assignments/${assignment!.id}` : '/api/admin/assignments'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          batchId: Number(form.batchId),
          dueAt: new Date(form.dueAt).toISOString(),
          fileUrl: form.fileUrl || undefined,
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
      router.push('/admin/assignments')
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
          onClick={() => router.push('/admin/assignments')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <ClipboardList style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Assignment' : 'New Assignment'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? `Edit: ${assignment!.title}` : 'New Assignment'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update assignment details or deadline.' : 'Create an assignment for a batch with a submission deadline.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        {batches.length === 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 18 }}>
            No batches exist yet. Create one first before adding an assignment.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Batch *</label>
            <select value={form.batchId} onChange={set('batchId')} style={{ ...inputStyle('batchId'), color: form.batchId ? '#0f172a' : '#94a3b8' }}>
              <option value="">Select a batch…</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.batchId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.batchId}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Title *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Build a REST API" style={inputStyle('title')} />
            {errors.title && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.title}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Instructions for the assignment…" style={{ ...inputStyle('description'), resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Attachment URL</label>
            <input type="text" value={form.fileUrl} onChange={set('fileUrl')} placeholder="/uploads/assignments/brief.pdf" style={inputStyle('fileUrl')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Due Date *</label>
            <input type="datetime-local" value={form.dueAt} onChange={set('dueAt')} style={inputStyle('dueAt')} />
            {errors.dueAt && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.dueAt}</p>}
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/assignments')}
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
              {saving ? 'Saving…' : (isEdit ? 'Update Assignment' : 'Save Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
