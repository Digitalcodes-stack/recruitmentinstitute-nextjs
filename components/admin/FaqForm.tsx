'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Category { id: number; name: string }

interface Faq {
  id: number
  question: string
  answer: string
  categoryId: number | null
}

interface Props {
  categories: Category[]
  faq?: Faq
}

export default function FaqForm({ categories, faq }: Props) {
  const router = useRouter()
  const isEdit = !!faq

  const [form, setForm] = useState({
    question:   faq?.question   ?? '',
    answer:     faq?.answer     ?? '',
    categoryId: faq?.categoryId ? String(faq.categoryId) : '',
  })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [saving, setSaving]     = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.question.trim()) errs.question = 'Question is required'
    if (!form.answer.trim())   errs.answer   = 'Answer is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/faqs/${faq!.id}` : '/api/admin/faqs'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question:   form.question,
          answer:     form.answer,
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
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
      router.push('/admin/faqs')
      router.refresh()
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inp = (key: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    border: `1px solid ${errors[key] ? '#ef4444' : '#e2e8f0'}`,
    outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff',
  })

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => router.push('/admin/faqs')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0891b2' }}>
          <HelpCircle style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit FAQ' : 'Add FAQ'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? 'Edit FAQ' : 'New FAQ'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update the question and answer.' : 'Add a new frequently asked question.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Question */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Question *</label>
            <input type="text" value={form.question} onChange={set('question')} placeholder="e.g. What is the course duration?" style={inp('question')} />
            {errors.question && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.question}</p>}
          </div>

          {/* Answer */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Answer *</label>
            <textarea value={form.answer} onChange={set('answer')} placeholder="Provide a clear and concise answer…" rows={5}
              style={{ ...inp('answer'), resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
            {errors.answer && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.answer}</p>}
          </div>

          {/* Category (optional) */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Category <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
            </label>
            <select value={form.categoryId} onChange={set('categoryId')}
              style={{ ...inp('categoryId'), color: form.categoryId ? '#0f172a' : '#94a3b8' }}>
              <option value="">General (no category)</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={() => router.push('/admin/faqs')}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (isEdit ? 'Update FAQ' : 'Save FAQ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
