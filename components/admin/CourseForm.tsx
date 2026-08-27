'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ArrowLeft, Save, Loader2, Clock } from 'lucide-react'

interface Category { id: number; name: string }

interface Course {
  id: number
  title: string
  description: string
  categoryId: number
  totalStudents: number
  rating: number | null
  courseBy: string | null
  duration?: string | null
}

interface Props {
  categories: Category[]
  course?: Course
}

const COMMON_DURATIONS = ['3 Months', '6 Weeks', '2 Months', '6 Months', '4 Weeks', '12 Weeks', 'Flexible / Custom']

export default function CourseForm({ categories, course }: Props) {
  const router = useRouter()
  const isEdit = !!course

  const [form, setForm] = useState({
    title:         course?.title         ?? '',
    description:   course?.description   ?? '',
    categoryId:    course?.categoryId    ? String(course.categoryId) : '',
    duration:      course?.duration      ?? '3 Months',
    totalStudents: String(course?.totalStudents ?? 0),
    rating:        course?.rating != null ? String(course.rating) : '',
    courseBy:      course?.courseBy      ?? '',
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
    if (!form.title.trim())       errs.title      = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.categoryId)         errs.categoryId  = 'Category is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/courses/${course!.id}` : '/api/admin/courses'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:         form.title,
          description:   form.description,
          categoryId:    Number(form.categoryId),
          duration:      form.duration.trim() || undefined,
          totalStudents: Number(form.totalStudents || 0),
          rating:        form.rating !== '' ? Number(form.rating) : undefined,
          courseBy:      form.courseBy || undefined,
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
      router.push('/admin/courses')
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
    <div style={{ maxWidth: 680 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => router.push('/admin/courses')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0891b2' }}>
          <BookOpen style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Course' : 'Add Course'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? `Edit: ${course!.title}` : 'New Course'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          {isEdit ? 'Update course details and duration. Changes immediately reflect across the site.' : 'Add a new course to a category.'}
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Course Title *</label>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. End-to-End Recruitment Training" style={inp('title')} />
            {errors.title && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Duration with quick suggestions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                <Clock style={{ width: 13, height: 13, color: '#2563eb' }} /> Course Duration * (e.g. 3 Months, 6 Weeks, 2 Months)
              </label>
            </div>
            <input
              type="text"
              value={form.duration}
              onChange={set('duration')}
              placeholder="e.g. 3 Months or 6 Weeks"
              style={inp('duration')}
            />
            {/* Quick Suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {COMMON_DURATIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, duration: dur }))}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: form.duration === dur ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    background: form.duration === dur ? '#eff6ff' : '#f8fafc',
                    color: form.duration === dur ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description *</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Detailed course description…" rows={5}
              style={{ ...inp('description'), resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
            {errors.description && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Category *</label>
            <select value={form.categoryId} onChange={set('categoryId')}
              style={{ ...inp('categoryId'), color: form.categoryId ? '#0f172a' : '#94a3b8' }}>
              <option value="">Select a category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.categoryId}</p>}
          </div>

          {/* Row: courseBy + rating + totalStudents */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Instructor / By</label>
              <input type="text" value={form.courseBy} onChange={set('courseBy')} placeholder="e.g. Industry Mentors" style={inp('courseBy')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Rating (0–5)</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={set('rating')} placeholder="e.g. 4.9" style={inp('rating')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Total Students</label>
              <input type="number" min="0" value={form.totalStudents} onChange={set('totalStudents')} placeholder="5000" style={inp('totalStudents')} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={() => router.push('/admin/courses')}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (isEdit ? 'Update Course' : 'Save Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
