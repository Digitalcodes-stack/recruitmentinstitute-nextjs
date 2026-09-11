'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  Plus,
  X,
  Briefcase,
  Award,
  Globe,
  Quote,
  Sparkles,
  FileText,
  User,
  CheckCircle2,
} from 'lucide-react'
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
  profileJson?: any
  availability?: AvailabilitySlot[]
}

interface Props {
  trainer?: Trainer
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const POPULAR_TAGS = [
  'AI in Recruitment',
  'Boolean Search',
  'Recruitment Automation',
  'Candidate Screening',
  'Executive Search',
  'Tech Recruitment',
  'Talent Acquisition',
  'HR Analytics',
  'Employer Branding',
  'Client Acquisition',
]

export default function TrainerForm({ trainer }: Props) {
  const router = useRouter()
  const isEdit = !!trainer
  const pj = (trainer?.profileJson && typeof trainer.profileJson === 'object') ? trainer.profileJson : {}

  const [form, setForm] = useState({
    name: trainer?.name ?? '',
    email: trainer?.email ?? '',
    password: '',
    phone: trainer?.phone ?? '',
    specialization: trainer?.specialization ?? (pj.designation || ''),
    bio: trainer?.bio ?? (pj.bio || ''),
    image: trainer?.image ?? '',
    isActive: trainer?.isActive ?? true,
    // Extended fields
    designation: pj.designation ?? '',
    experienceYears: pj.experienceYears !== undefined && pj.experienceYears !== null ? String(pj.experienceYears) : '',
    companyEx: pj.companyEx ?? '',
    linkedinUrl: pj.linkedinUrl ?? '',
    quote: pj.quote ?? '',
    longBio: pj.longBio ?? '',
  })

  const [specializationTags, setSpecializationTags] = useState<string[]>(
    Array.isArray(pj.specializationTags) ? pj.specializationTags : []
  )
  const [certifications, setCertifications] = useState<string[]>(
    Array.isArray(pj.certifications) ? pj.certifications : []
  )
  const [tagInput, setTagInput] = useState('')
  const [certInput, setCertInput] = useState('')

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    trainer?.availability?.length
      ? trainer.availability.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }))
      : []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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

  function addTag(val?: string) {
    const t = (val || tagInput).trim()
    if (!t) return
    if (!specializationTags.includes(t)) {
      setSpecializationTags((prev) => [...prev, t])
    }
    setTagInput('')
  }
  function removeTag(t: string) {
    setSpecializationTags((prev) => prev.filter((x) => x !== t))
  }

  function addCert() {
    const c = certInput.trim()
    if (!c) return
    if (!certifications.includes(c)) {
      setCertifications((prev) => [...prev, c])
    }
    setCertInput('')
  }
  function removeCert(c: string) {
    setCertifications((prev) => prev.filter((x) => x !== c))
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
    setSuccessMsg('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!isEdit && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    for (const slot of availability) {
      if (slot.endTime <= slot.startTime) { errs.availability = "Each slot's end time must be after its start time"; break }
    }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/trainers/${trainer!.id}` : '/api/admin/trainers'
      const method = isEdit ? 'PUT' : 'POST'
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialization: form.designation?.trim() || form.specialization?.trim() || '',
        bio: form.bio.trim(),
        image: form.image.trim(),
        isActive: form.isActive,
        designation: form.designation.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        companyEx: form.companyEx.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        quote: form.quote.trim(),
        longBio: form.longBio.trim(),
        specializationTags,
        certifications,
        availability,
      }
      if (form.password) {
        payload.password = form.password
      }

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

      setSuccessMsg('Faculty profile saved successfully!')
      router.push('/admin/trainers')
      router.refresh()
    } catch {
      setApiError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = (key: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13.5,
    border: `1px solid ${errors[key] ? '#ef4444' : '#e2e8f0'}`,
    outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff',
  })

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => router.push('/admin/trainers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Faculty List
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7c3aed' }}>
          <GraduationCap style={{ width: 13, height: 13 }} />
          {isEdit ? 'Edit Faculty Profile' : 'Add New Trainer'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 20, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {isEdit ? `Edit Profile: ${trainer!.name}` : 'New Faculty Member'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {isEdit
                ? 'Manage account credentials, public profile, teaching philosophy, and weekly availability.'
                : 'Add a new faculty member with public credentials and batch availability.'}
            </p>
          </div>
          {isEdit && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: form.isActive ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${form.isActive ? '#a7f3d0' : '#fecaca'}`,
              color: form.isActive ? '#059669' : '#dc2626',
              borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: form.isActive ? '#10b981' : '#ef4444' }} />
              {form.isActive ? 'Active Trainer' : 'Inactive'}
            </span>
          )}
        </div>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 20 }}>
            {apiError}
          </div>
        )}

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#059669', marginBottom: 20 }}>
            <CheckCircle2 style={{ width: 16, height: 16 }} />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* SECTION 1: ACCOUNT & CONTACT */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <User style={{ width: 16, height: 16, color: '#2563eb' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Account & Contact Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Full Name *</label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Shesha Shhiv Mohanty" style={inputStyle('name')} />
                {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Email (Login ID) *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="trainer@recruitmentinstitute.in" style={inputStyle('email')} />
                {errors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  {isEdit ? 'New Password (leave blank to keep current)' : 'Login Password *'}
                </label>
                <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" style={inputStyle('password')} />
                {errors.password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Phone Number</label>
                <input type="text" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" style={inputStyle('phone')} />
              </div>
            </div>
          </div>

          {/* SECTION 2: PROFESSIONAL PROFILE */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <Briefcase style={{ width: 16, height: 16, color: '#7c3aed' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Public Faculty Credentials & Headline
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={set('designation')}
                  placeholder="e.g. AI Transformation & Recruitment Specialist"
                  style={inputStyle('designation')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.experienceYears}
                  onChange={set('experienceYears')}
                  placeholder="e.g. 15"
                  style={inputStyle('experienceYears')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Industry Background / Past Companies
                </label>
                <input
                  type="text"
                  value={form.companyEx}
                  onChange={set('companyEx')}
                  placeholder="e.g. Ex-Deloitte, Ex-Capgemini, Tech Advisor"
                  style={inputStyle('companyEx')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={set('linkedinUrl')}
                  placeholder="https://linkedin.com/in/username"
                  style={inputStyle('linkedinUrl')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Faculty Teaching Philosophy / Quote
              </label>
              <input
                type="text"
                value={form.quote}
                onChange={set('quote')}
                placeholder="e.g. AI will not replace recruiters. Recruiters who use AI will replace those who don't."
                style={inputStyle('quote')}
              />
            </div>
          </div>

          {/* SECTION 3: BIOS */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <FileText style={{ width: 16, height: 16, color: '#059669' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Short Bio & Extended Story
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Card Summary Bio (2-3 sentences shown on faculty cards)
                </label>
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={3}
                  placeholder="Brief introductory overview highlighting core expertise and impact..."
                  style={{ ...inputStyle('bio'), resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Full In-Depth Bio (Shown in Detailed View Modal)
                </label>
                <textarea
                  value={form.longBio}
                  onChange={set('longBio')}
                  rows={6}
                  placeholder="Comprehensive background, achievements, training pedagogy, hands-on lab focus, and mentoring approach..."
                  style={{ ...inputStyle('longBio'), resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SPECIALIZATION TAGS & CERTIFICATIONS */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <Sparkles style={{ width: 16, height: 16, color: '#d97706' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. Specialization Tags & Certifications
              </h3>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Specialization Tags (Displayed as badges on cards & modal)
              </label>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Type a skill/tag and press Enter or Add..."
                  style={{ ...inputStyle('tags'), flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => addTag()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
                    background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> Add Tag
                </button>
              </div>

              {/* Tag Suggestions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 4 }}>Quick add:</span>
                {POPULAR_TAGS.filter((t) => !specializationTags.includes(t)).slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: '#fff', border: '1px dashed #cbd5e1', color: '#64748b', cursor: 'pointer'
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Active Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 36, padding: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                {specializationTags.length === 0 ? (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>No tags added yet. Add skills or click suggestions above.</span>
                ) : (
                  specializationTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#7c3aed' }}
                      >
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Key Certifications & Honors
              </label>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCert()
                    }
                  }}
                  placeholder="e.g. SHRM-SCP, Certified Talent Sourcing Specialist..."
                  style={{ ...inputStyle('certs'), flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addCert}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
                    background: '#059669', color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> Add Cert
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 36, padding: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                {certifications.length === 0 ? (
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>No certifications listed.</span>
                ) : (
                  certifications.map((cert) => (
                    <span
                      key={cert}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0'
                      }}
                    >
                      <Award style={{ width: 13, height: 13 }} />
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCert(cert)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#059669' }}
                      >
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: PHOTO & STATUS */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <Globe style={{ width: 16, height: 16, color: '#2563eb' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                5. Faculty Portrait & Portal Visibility
              </h3>
            </div>

            <div style={{ marginBottom: 16 }}>
              <ImageUploadField
                label="Profile Photo URL"
                value={form.image}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                folder="trainers"
                previewShape="circle"
                placeholder="Paste URL or click Browse…"
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 600, color: '#1e293b', cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: '#2563eb' }}
              />
              Active Trainer (can be assigned to batches, can log in, and listed on the faculty directory)
            </label>
          </div>

          {/* SECTION 6: WEEKLY AVAILABILITY */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Clock style={{ width: 16, height: 16, color: '#7c3aed' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                6. Weekly Teaching Availability
              </h3>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
              Select the days this faculty member can lead batches, then adjust the time slots (IST).
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
                      padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${active ? '#7c3aed' : '#e2e8f0'}`,
                      background: active ? '#7c3aed' : '#fff',
                      color: active ? '#fff' : '#64748b',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {availability.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...availability]
                  .map((slot, idx) => ({ slot, idx }))
                  .sort((a, b) => a.slot.dayOfWeek - b.slot.dayOfWeek)
                  .map(({ slot, idx }) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px' }}>
                      <span style={{ minWidth: 70, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{DAY_LABELS[slot.dayOfWeek].slice(0, 3)}</span>
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
                        style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus style={{ width: 13, height: 13, color: '#64748b' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(idx)}
                        title="Remove this slot"
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X style={{ width: 13, height: 13, color: '#dc2626' }} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {errors.availability && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 8 }}>{errors.availability}</p>}
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => router.push('/admin/trainers')}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2, padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              {saving ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
              {saving ? 'Saving Profile…' : (isEdit ? 'Save Changes' : 'Create Faculty Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
