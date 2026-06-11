'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users2, ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Category { id: number; name: string }

interface Expert {
  id: number
  title: string
  profession: string | null
  image: string | null
  categoryId: number
}

interface Props {
  categories: Category[]
  expert?: Expert
}

export default function ExpertForm({ categories, expert }: Props) {
  const router = useRouter()
  const isEdit = !!expert

  const [form, setForm] = useState({
    title:      expert?.title      ?? '',
    profession: expert?.profession ?? '',
    image:      expert?.image      ?? '',
    categoryId: expert?.categoryId ? String(expert.categoryId) : '',
  })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [saving, setSaving]   = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.title.trim())   errs.title      = 'Name is required'
    if (!form.categoryId)     errs.categoryId = 'Category is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/experts/${expert!.id}` : '/api/admin/experts'
      const method = isEdit ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: Number(form.categoryId) }),
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
      router.push('/admin/experts')
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
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/experts')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}>
          <Users2 style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Expert' : 'Add Expert'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? `Edit: ${expert!.title}` : 'New Expert'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update the expert\'s details.' : 'Add a new faculty member or subject matter expert.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Dr. Anand Kulkarni" style={inputStyle('title')} />
            {errors.title && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Profession */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Profession / Role</label>
            <input type="text" value={form.profession} onChange={set('profession')} placeholder="e.g. Senior HR Consultant" style={inputStyle('profession')} />
          </div>

          {/* Photo URL */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Photo URL</label>
            <input type="url" value={form.image} onChange={set('image')} placeholder="https://…" style={inputStyle('image')} />
            {form.image && (
              <img src={form.image} alt="preview" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginTop: 8, border: '2px solid #e2e8f0' }} />
            )}
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category *</label>
            <select
              value={form.categoryId}
              onChange={set('categoryId')}
              style={{ ...inputStyle('categoryId'), color: form.categoryId ? '#0f172a' : '#94a3b8' }}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.categoryId}</p>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => router.push('/admin/experts')}
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
              {saving ? 'Saving…' : (isEdit ? 'Update Expert' : 'Save Expert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
