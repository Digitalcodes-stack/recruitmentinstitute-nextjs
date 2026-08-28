'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, ArrowLeft, Save, Loader2, Clock,
  ExternalLink, Sparkles, GraduationCap, Users,
  CheckCircle2, Target, Wrench, Layers, ShieldCheck,
  Layout, HelpCircle, MessageSquare, Star, ChevronRight,
  Compass
} from 'lucide-react'
import type { DynamicCourseData } from '@/lib/services/courseDataService'

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
  dynamicData?: DynamicCourseData
}

const COMMON_DURATIONS = ['3 Months', '6 Weeks', '2 Months', '6 Months', '4 Weeks', '12 Weeks', 'Flexible / Custom']

export default function CourseForm({ categories, course, dynamicData }: Props) {
  const router = useRouter()
  const isEdit = !!course

  const [activeTab, setActiveTab] = useState<'basic' | 'overview' | 'curriculum' | 'outcomes' | 'certification'>('basic')

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
    <div style={{ maxWidth: 1000 }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => router.push('/admin/courses')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Courses
          </button>
          <span style={{ color: '#e2e8f0' }}>·</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0891b2' }}>
            <BookOpen style={{ width: 11, height: 11 }} />
            {isEdit ? 'Course Master Editor' : 'Add Course'}
          </div>
        </div>

        {/* Quick Action Links if editing */}
        {isEdit && dynamicData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href={dynamicData.route}
              target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} /> Live Public View
            </Link>
            <Link
              href={`/admin/courses/${course!.id}/curriculum`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}
            >
              <GraduationCap style={{ width: 12, height: 12 }} /> Edit LMS Curriculum
            </Link>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 32, marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {isEdit ? `Edit: ${course!.title}` : 'New Course'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              Single source of truth across Public Site, Student LMS, Trainer Portals & Admin Catalogs.
            </p>
          </div>

          {isEdit && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 6 }}>
                Duration: {form.duration}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 6 }}>
                Enrolled: {Number(form.totalStudents).toLocaleString('en-IN')}+
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 6 }}>
                ⭐ {form.rating || '5.0'} / 5.0
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation for Course Details */}
        {isEdit && dynamicData && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 8, margin: '24px 0 20px', overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { id: 'basic', label: '1. Basic Info & Hero', icon: BookOpen },
              { id: 'overview', label: '2. Overview & Audience', icon: Users },
              { id: 'curriculum', label: `3. Modules & Curriculum (${dynamicData.curriculum.length})`, icon: GraduationCap },
              { id: 'outcomes', label: '4. Outcomes & Tools', icon: Target },
              { id: 'certification', label: '5. Certification & FAQs', icon: ShieldCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as typeof activeTab)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  background: 'none',
                  color: activeTab === id ? '#2563eb' : '#64748b',
                  borderBottom: activeTab === id ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />
                {label}
              </button>
            ))}
          </div>
        )}

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* TAB 1: BASIC INFO & HERO */}
          {(activeTab === 'basic' || !isEdit) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Short Hero Description * (80–120 Words)
                </label>
                <textarea value={form.description} onChange={set('description')} placeholder="Concise course description displayed in the hero section and course cards…" rows={4}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Instructor / By</label>
                  <input type="text" value={form.courseBy} onChange={set('courseBy')} placeholder="e.g. Industry Mentors" style={inp('courseBy')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Rating (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={set('rating')} placeholder="e.g. 5.0" style={inp('rating')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Total Students</label>
                  <input type="number" min="0" value={form.totalStudents} onChange={set('totalStudents')} placeholder="5000" style={inp('totalStudents')} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED PROGRAM OVERVIEW & AUDIENCE */}
          {activeTab === 'overview' && dynamicData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Compass style={{ width: 14, height: 14, color: '#2563eb' }} /> Detailed Course Overview Narrative
                </h4>
                <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                  {dynamicData.overview}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users style={{ width: 14, height: 14, color: '#059669' }} /> Who Should Enroll (Target Candidate Profiles)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {dynamicData.whoShouldEnroll.map((item, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                      <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{item.role}</h5>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURRICULUM & MODULES */}
          {activeTab === 'curriculum' && dynamicData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap style={{ width: 15, height: 15, color: '#7c3aed' }} /> Structured Curriculum Modules ({dynamicData.curriculum.length})
                </h4>
                <Link
                  href={`/admin/courses/${course!.id}/curriculum`}
                  style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}
                >
                  Manage in LMS Builder →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dynamicData.curriculum.map((mod, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: 6 }}>
                        {mod.week}
                      </span>
                      <h5 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', flex: 1, marginLeft: 8 }}>
                        {mod.title}
                      </h5>
                      {mod.duration && (
                        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{mod.duration}</span>
                      )}
                    </div>
                    {mod.description && (
                      <p style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>{mod.description}</p>
                    )}
                    {mod.learningObjectives && mod.learningObjectives.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                          Objectives:
                        </span>
                        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#334155' }}>
                          {mod.learningObjectives.map((obj, oIdx) => (
                            <li key={oIdx} style={{ marginBottom: 2 }}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {mod.practicalActivity && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#92400e', marginTop: 8 }}>
                        <strong>Practical Activity: </strong>{mod.practicalActivity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OUTCOMES & TECH STACK */}
          {activeTab === 'outcomes' && dynamicData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Target style={{ width: 14, height: 14, color: '#2563eb' }} /> Measurable Learning Outcomes (9 Competencies)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {dynamicData.learningOutcomes.map((out, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#059669', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>{out}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers style={{ width: 14, height: 14, color: '#d97706' }} /> Tools & Platforms Covered
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {dynamicData.toolsCovered.map((toolGroup, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#d97706', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                        {toolGroup.category}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {toolGroup.tools.map((t, tIdx) => (
                          <span key={tIdx} style={{ fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 6 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATION & FAQS */}
          {activeTab === 'certification' && dynamicData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: '#0f172a', color: '#fff', borderRadius: 16, padding: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.16em', display: 'block', marginBottom: 6 }}>
                  ISO-Accredited Credential
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                  {dynamicData.certificationDetails.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dynamicData.certificationDetails.bullets.map((b, bIdx) => (
                    <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
                      <CheckCircle2 style={{ width: 13, height: 13, color: '#34d399' }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare style={{ width: 14, height: 14, color: '#2563eb' }} /> Course FAQs ({dynamicData.faqs.length})
                  </h4>
                  <Link href="/admin/faqs" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                    Manage FAQs →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dynamicData.faqs.slice(0, 5).map((f, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{f.q}</p>
                      <p style={{ fontSize: 11, color: '#475569', margin: 0, lineHeight: 1.5 }}>{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', marginTop: 10 }}>
            <button type="button" onClick={() => router.push('/admin/courses')}
              style={{ flex: 1, padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (isEdit ? 'Update Course' : 'Save Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
