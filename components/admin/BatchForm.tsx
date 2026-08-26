'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layers3, ArrowLeft, Save, Loader2, BookOpen, Calendar, CheckCircle2,
  ChevronDown, ChevronRight, Clock, Users, Zap, AlertCircle
} from 'lucide-react'

interface Course { id: number; title: string }
interface Trainer { id: number; name: string }
interface TopicItem { id: number; title: string }
interface ChapterItem { id: number; title: string; topics: TopicItem[] }
interface ModuleItem { id: number; title: string; description?: string | null; chapters: ChapterItem[] }

interface CourseWithModules extends Course {
  modules?: ModuleItem[]
}

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

interface SessionPreviewItem {
  moduleTitle: string
  moduleId: number | null
  sessionNumber: number
  sessionDate: string
  topics: string[]
}

interface Props {
  courses: CourseWithModules[]
  trainers: Trainer[]
  batch?: Batch
}

function toDateInput(value: string | Date | null) {
  if (!value) return ''
  const d = new Date(value)
  return d.toISOString().slice(0, 10)
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_CLASS_DAYS = [1, 3, 5] // Mon, Wed, Fri

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

  // Auto-generate sessions settings
  const [autoGenerate, setAutoGenerate] = useState(!isEdit)
  const [classDays, setClassDays] = useState<number[]>(DEFAULT_CLASS_DAYS)
  const [classStartTime, setClassStartTime] = useState('19:00')
  const [classEndTime, setClassEndTime] = useState('21:00')

  // Syllabus preview
  const [courseModules, setCourseModules] = useState<ModuleItem[]>([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  // Schedule preview
  const [schedulePreview, setSchedulePreview] = useState<SessionPreviewItem[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Post-save success state
  const [savedResult, setSavedResult] = useState<{ batchId: number; sessionsCreated: number; preview: SessionPreviewItem[] } | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  // Load course modules when courseId changes
  useEffect(() => {
    if (!form.courseId) { setCourseModules([]); return }
    const course = courses.find((c) => c.id === Number(form.courseId))
    setCourseModules(course?.modules ?? [])
  }, [form.courseId, courses])

  // Build schedule preview when relevant fields change
  const buildPreview = useCallback(async () => {
    if (!form.courseId || !form.startDate || !courseModules.length || !autoGenerate) {
      setSchedulePreview([])
      return
    }
    setLoadingPreview(true)
    try {
      const [sh, sm] = classStartTime.split(':').map(Number)
      const [eh, em] = classEndTime.split(':').map(Number)
      const qs = new URLSearchParams({
        classDays: classDays.join(','),
        startHour: String(sh),
        startMinute: String(sm),
        endHour: String(eh),
        endMinute: String(em),
      })

      // Build preview inline (no saved batch yet) — derive from modules + startDate
      const startDate = new Date(form.startDate)
      const preview: SessionPreviewItem[] = []
      const cursor = new Date(startDate)
      cursor.setHours(0, 0, 0, 0)

      function nextClassDay(from: Date): Date {
        const d = new Date(from)
        for (let i = 0; i < 14; i++) {
          if (classDays.includes(d.getDay())) return d
          d.setDate(d.getDate() + 1)
        }
        return d
      }

      for (let i = 0; i < courseModules.length; i++) {
        const mod = courseModules[i]
        const topics = mod.chapters.flatMap((ch) => ch.topics.map((t) => t.title))
        const sd = nextClassDay(cursor)
        preview.push({
          moduleTitle: mod.title,
          moduleId: mod.id,
          sessionNumber: i + 1,
          sessionDate: sd.toISOString().slice(0, 10),
          topics,
        })
        cursor.setTime(sd.getTime())
        cursor.setDate(cursor.getDate() + 1)
      }
      setSchedulePreview(preview)
    } catch { setSchedulePreview([]) }
    finally { setLoadingPreview(false) }
  }, [form.courseId, form.startDate, courseModules, classDays, classStartTime, classEndTime, autoGenerate])

  useEffect(() => { buildPreview() }, [buildPreview])

  function toggleClassDay(day: number) {
    setClassDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  function toggleModule(id: number) {
    setExpandedModules((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Batch name is required'
    if (!form.courseId) errs.courseId = 'Course is required'
    if (!form.trainerId) errs.trainerId = 'Trainer is required'
    if (!form.startDate) errs.startDate = 'Start date is required'
    if (autoGenerate && classDays.length === 0) errs.classDays = 'Select at least one class day'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const [sh, sm] = classStartTime.split(':').map(Number)
    const [eh, em] = classEndTime.split(':').map(Number)

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
          // Session generation options
          autoGenerateSessions: autoGenerate && !isEdit,
          classDays,
          classStartHour: sh,
          classStartMinute: sm,
          classEndHour: eh,
          classEndMinute: em,
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

      if (data.sessionsCreated > 0) {
        setSavedResult({ batchId: data.data.id, sessionsCreated: data.sessionsCreated, preview: data.sessionPreview ?? [] })
      } else {
        router.push('/admin/batches')
        router.refresh()
      }
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

  // ── Success screen after batch + sessions created ─────────────────────────
  if (savedResult) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 style={{ width: 32, height: 32, color: '#16a34a' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Batch Created Successfully!</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            <strong>{savedResult.sessionsCreated} sessions</strong> were auto-generated from the course syllabus and Google Meet links were sent to enrolled students.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 24 }}>
            <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 12 }}>Session Schedule</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {savedResult.preview.map((s) => (
                <div key={s.sessionNumber} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.sessionNumber}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.moduleTitle}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(s.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.topics.length} topic(s)</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => router.push('/admin/batches')} style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
              View All Batches
            </button>
            <button onClick={() => router.push(`/admin/batches/${savedResult.batchId}`)} style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              View This Batch
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => router.push('/admin/batches')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}>
          <Layers3 style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Batch' : 'New Batch'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: form.courseId && !isEdit ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Form */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            {isEdit ? `Edit: ${batch!.name}` : 'New Batch'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
            {isEdit ? 'Update batch schedule, trainer, or status.' : 'Create a batch — sessions will be auto-generated from the course syllabus.'}
          </p>

          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Batch name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Batch Name *</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. End-to-End Recruitment — Batch A" style={inputStyle('name')} />
              {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
            </div>

            {/* Course */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Course *</label>
              <select value={form.courseId} onChange={set('courseId')} style={{ ...inputStyle('courseId'), color: form.courseId ? '#0f172a' : '#94a3b8' }}>
                <option value="">Select a course…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.courseId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.courseId}</p>}
            </div>

            {/* Trainer */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Trainer *</label>
              <select value={form.trainerId} onChange={set('trainerId')} style={{ ...inputStyle('trainerId'), color: form.trainerId ? '#0f172a' : '#94a3b8' }}>
                <option value="">Select a trainer…</option>
                {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.trainerId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.trainerId}</p>}
            </div>

            {/* Capacity + Mode */}
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

            {/* Start + End dates */}
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

            {/* Status (edit only) */}
            {isEdit && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                <select value={form.status} onChange={set('status')} style={inputStyle('status')}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}

            {/* Auto-generate sessions toggle (new only) */}
            {!isEdit && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, background: autoGenerate ? '#eff6ff' : '#f8fafc' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div
                    onClick={() => setAutoGenerate((v) => !v)}
                    style={{
                      width: 40, height: 22, borderRadius: 11,
                      background: autoGenerate ? '#2563eb' : '#cbd5e1',
                      position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: autoGenerate ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap style={{ width: 13, height: 13, color: '#2563eb' }} />
                      Auto-generate sessions from syllabus
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      One session per course module — Meet links &amp; student emails auto-sent
                    </div>
                  </div>
                </label>

                {autoGenerate && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Class days */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Days</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {DAY_LABELS.map((label, i) => {
                          const active = classDays.includes(i)
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleClassDay(i)}
                              style={{
                                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                                background: active ? '#2563eb' : '#fff',
                                color: active ? '#fff' : '#64748b',
                                transition: 'all 0.15s',
                              }}
                            >{label}</button>
                          )
                        })}
                      </div>
                      {errors.classDays && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.classDays}</p>}
                    </div>

                    {/* Class times */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Start Time</label>
                        <input
                          type="time"
                          value={classStartTime}
                          onChange={(e) => setClassStartTime(e.target.value)}
                          style={{ ...inputStyle('classStart'), fontSize: 13 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class End Time</label>
                        <input
                          type="time"
                          value={classEndTime}
                          onChange={(e) => setClassEndTime(e.target.value)}
                          style={{ ...inputStyle('classEnd'), fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={() => router.push('/admin/batches')} style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
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
                {saving ? (autoGenerate ? 'Creating & generating sessions…' : 'Saving…') : (isEdit ? 'Update Batch' : 'Create Batch')}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Syllabus Preview + Schedule Preview */}
        {form.courseId && !isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Course Syllabus */}
            <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BookOpen style={{ width: 16, height: 16, color: '#2563eb' }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Course Syllabus</h3>
                {loadingModules && <Loader2 style={{ width: 12, height: 12, color: '#94a3b8', animation: 'spin 1s linear infinite' }} />}
              </div>

              {!loadingModules && courseModules.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
                  <AlertCircle style={{ width: 14, height: 14, color: '#d97706', flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#92400e' }}>No syllabus modules found for this course. Sessions won't be auto-generated.</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                {courseModules.map((mod, idx) => {
                  const isExpanded = expandedModules.has(mod.id)
                  const totalTopics = mod.chapters.reduce((sum, ch) => sum + ch.topics.length, 0)
                  return (
                    <div key={mod.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: isExpanded ? '#eff6ff' : '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{mod.title}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{totalTopics} topic(s)</span>
                        {isExpanded ? <ChevronDown style={{ width: 14, height: 14, color: '#64748b' }} /> : <ChevronRight style={{ width: 14, height: 14, color: '#64748b' }} />}
                      </button>
                      {isExpanded && (
                        <div style={{ padding: '8px 14px 12px 46px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                          {mod.chapters.map((ch) => (
                            <div key={ch.id} style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{ch.title}</div>
                              {ch.topics.map((t) => (
                                <div key={t.id} style={{ fontSize: 11, color: '#64748b', paddingLeft: 10, lineHeight: '1.8' }}>• {t.title}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Session Schedule Preview */}
            {autoGenerate && form.startDate && (
              <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Calendar style={{ width: 16, height: 16, color: '#7c3aed' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Session Schedule Preview</h3>
                  {loadingPreview && <Loader2 style={{ width: 12, height: 12, color: '#94a3b8' }} />}
                  {!loadingPreview && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6 }}>
                      {schedulePreview.length} sessions
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
                  {schedulePreview.map((s) => (
                    <div key={s.sessionNumber} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <span style={{ minWidth: 22, height: 22, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.sessionNumber}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{s.moduleTitle}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Calendar style={{ width: 11, height: 11, color: '#7c3aed' }} />
                          <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                            {new Date(s.sessionDate).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </span>
                          <Clock style={{ width: 11, height: 11, color: '#64748b' }} />
                          <span style={{ fontSize: 11, color: '#64748b' }}>{classStartTime} – {classEndTime}</span>
                        </div>
                        {s.topics.length > 0 && (
                          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>
                            {s.topics.slice(0, 3).join(' · ')}{s.topics.length > 3 ? ` +${s.topics.length - 3} more` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {schedulePreview.length === 0 && !loadingPreview && (
                    <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>Select class days and start date to preview schedule</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
