'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Award,
  Globe,
  Quote,
  FileText,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Camera,
  FolderOpen,
  Upload,
  Trash2,
} from 'lucide-react'

export interface TrainerProfileData {
  id: number
  name: string
  email: string
  phone: string
  image: string
  designation: string
  experienceYears: number
  companyEx: string
  linkedinUrl: string
  quote: string
  bio: string
  longBio: string
  specializationTags: string[]
  certifications: string[]
  coursesTaught: string[]
}

interface Props {
  initialData: TrainerProfileData
}

export default function TrainerProfileClient({ initialData }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<TrainerProfileData>(initialData)
  const [password, setPassword] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    setPhotoError(false)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/trainer/upload', {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Upload failed')
      setForm((prev) => ({ ...prev, image: json.url }))
      setSuccessMsg('Profile photo uploaded and updated successfully!')
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleTextChange = (field: keyof TrainerProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleNumberChange = (field: keyof TrainerProfileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: parseInt(e.target.value) || 0 }))
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Tag management
  const addTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput).trim()
    if (!val) return
    if (!form.specializationTags.includes(val)) {
      setForm((prev) => ({
        ...prev,
        specializationTags: [...prev.specializationTags, val],
      }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      specializationTags: prev.specializationTags.filter((t) => t !== tag),
    }))
  }

  // Certification management
  const addCert = () => {
    const val = certInput.trim()
    if (!val) return
    if (!form.certifications.includes(val)) {
      setForm((prev) => ({
        ...prev,
        certifications: [...prev.certifications, val],
      }))
    }
    setCertInput('')
  }

  const removeCert = (cert: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== cert),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const payload: any = {
        name: form.name,
        phone: form.phone,
        image: form.image,
        designation: form.designation,
        experienceYears: form.experienceYears,
        companyEx: form.companyEx,
        linkedinUrl: form.linkedinUrl,
        quote: form.quote,
        bio: form.bio,
        longBio: form.longBio,
        specializationTags: form.specializationTags,
        certifications: form.certifications,
        coursesTaught: form.coursesTaught,
      }

      if (password.trim()) {
        if (password.trim().length < 6) {
          setErrorMsg('Password must be at least 6 characters')
          setSaving(false)
          return
        }
        payload.password = password.trim()
      }

      const res = await fetch('/api/trainer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile')
      }

      setSuccessMsg('Your faculty profile has been updated and is live on the site!')
      setPassword('')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '32px',
          boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '50px',
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60A5FA',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: '10px',
            }}
          >
            <Sparkles style={{ width: '13px', height: '13px' }} />
            <span>Faculty Self-Service Portal</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 6px', color: '#FFFFFF' }}>
            Manage Your Faculty Profile
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '640px' }}>
            Updates made here are automatically synced to the live <strong>Recruitment Institute Faculty Directory</strong>, course pages, and prospective candidate modals.
          </p>
        </div>

        <a
          href="/trainers"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s',
          }}
        >
          <span>View Public Profile</span>
          <ExternalLink style={{ width: '14px', height: '14px' }} />
        </a>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669', flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '16px',
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            color: '#9F1239',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <AlertCircle style={{ width: '20px', height: '20px', color: '#E11D48', flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form (2 cols) & Live Card Preview (1 col) */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Column: Form Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', gridColumn: 'span 2' }}>
            
            {/* SECTION 1: Personal & Contact */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                <span>Personal &amp; Contact Details</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleTextChange('name')}
                    placeholder="e.g. Shesha Shhiv Mohanty"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Login Email (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '13.5px',
                      color: '#64748B',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={handleTextChange('phone')}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Change Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Professional Identity & Headings */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                <span>Professional Identity &amp; Credentials</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Executive Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={handleTextChange('designation')}
                    placeholder="e.g. AI Transformation & Recruitment Specialist"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Years of Industry Experience *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={form.experienceYears}
                    onChange={handleNumberChange('experienceYears')}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Headline / Ex-Companies / Leadership Roles
                  </label>
                  <input
                    type="text"
                    value={form.companyEx}
                    onChange={handleTextChange('companyEx')}
                    placeholder="e.g. AI Business Transformation Consultant | Startup Builder & Growth Strategist"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={handleTextChange('linkedinUrl')}
                    placeholder="https://www.linkedin.com/in/username/"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Faculty Philosophy / Quote
                </label>
                <input
                  type="text"
                  value={form.quote}
                  onChange={handleTextChange('quote')}
                  placeholder="e.g. AI will not replace recruiters. Recruiters who know how to use AI will outperform recruiters who don't."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* SECTION 3: Biography & Narrative */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                <span>Biography &amp; Executive Background</span>
              </h2>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                    Short Summary Bio (Displayed on Public Faculty Cards) *
                  </label>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{form.bio.length} / 400 chars</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={form.bio}
                  onChange={handleTextChange('bio')}
                  placeholder="A concise 2-3 sentence overview of your domain expertise and teaching focus..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Detailed Executive Background (Displayed in Profile Modal)
                </label>
                <textarea
                  rows={7}
                  value={form.longBio}
                  onChange={handleTextChange('longBio')}
                  placeholder="Full background, achievements, industry trajectory, methodologies, and mentorship approach..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    lineHeight: 1.6,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* SECTION 4: Core Competencies & Modules */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                <span>Core Competencies &amp; Training Modules</span>
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
                Add the key skills, hiring domains, and modules you teach at Recruitment Institute.
              </p>

              {/* Tag Input */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
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
                  placeholder="Type a skill or module and press Enter (e.g. AI-Powered Sourcing)"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => addTag()}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Active Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '36px' }}>
                {form.specializationTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1E40AF',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#3B82F6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      <X style={{ width: '13px', height: '13px' }} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SECTION 5: Certifications & Accreditations */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                <span>Certifications &amp; Accreditations</span>
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px' }}>
                Showcase industry credentials and badges awarded to you.
              </p>

              {/* Cert Input */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
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
                  placeholder="e.g. Master AI Talent Architect"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={addCert}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#059669',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Add Cert</span>
                </button>
              </div>

              {/* Active Certifications */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.certifications.map((cert) => (
                  <div
                    key={cert}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                      <Award style={{ width: '15px', height: '15px', color: '#2563EB' }} />
                      <span>{cert}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCert(cert)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: Profile Photo */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <span>Profile Photo</span>
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Upload your high-resolution corporate portrait photo (Square 1:1 or 3:4 portrait recommended).
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      background: uploadingPhoto ? '#94A3B8' : 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />
                        <span>Uploading to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen style={{ width: '16px', height: '16px' }} />
                        <span>{form.image ? 'Change / Browse Photo' : 'Browse & Upload Photo'}</span>
                      </>
                    )}
                  </button>

                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      title="Remove profile photo"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '90px',
                    height: '90px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#E2E8F0',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 4px 14px rgba(15,23,42,0.1)',
                    flexShrink: 0,
                  }}
                >
                  {form.image && !photoError ? (
                    <img
                      src={form.image}
                      alt={form.name}
                      onError={() => setPhotoError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', background: '#F1F5F9' }}>
                      <User style={{ width: '32px', height: '32px', marginBottom: '2px', color: '#94A3B8' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {form.name ? form.name.split(' ').map((w) => w[0]).slice(0, 2).join('') : 'Photo'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>
                    Photo URL / Storage Path
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => {
                      setPhotoError(false)
                      handleTextChange('image')(e)
                    }}
                    placeholder="https://storage.googleapis.com/... or /assets/images/trainers/..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      fontFamily: 'monospace',
                      color: '#0F172A',
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', display: 'block' }}>
                    💡 Clicking <strong>Browse &amp; Upload Photo</strong> automatically uploads to persistent Google Cloud Storage and updates your photo across the portal and faculty directory.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div
              style={{
                position: 'sticky',
                bottom: '20px',
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '16px 24px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 30,
              }}
            >
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                All changes will be updated live across the platform.
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save style={{ width: '16px', height: '16px' }} />
                    <span>Save &amp; Publish Profile</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Live Directory Card Preview */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '12px' }}>
              Live Public Card Preview
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                overflow: 'hidden',
                maxWidth: '360px',
              }}
            >
              {/* Photo Area */}
              <div style={{ position: 'relative', width: '100%', height: '280px', background: '#0F172A', overflow: 'hidden' }}>
                {form.image ? (
                  <Image
                    src={form.image}
                    alt={form.name}
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                    <User style={{ width: '64px', height: '64px' }} />
                  </div>
                )}

                {/* Gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 50%)' }} />

                {/* Experience Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 10px',
                    borderRadius: '50px',
                    background: 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {form.experienceYears}+ Yrs
                </div>

                {/* Rating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '4px 10px',
                    borderRadius: '50px',
                    background: 'rgba(15,23,42,0.85)',
                    color: '#FDE047',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  ★ 5.0
                </div>

                {/* Company Tag inside photo */}
                {form.companyEx && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(15,23,42,0.85)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {form.companyEx}
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{form.name || 'Your Name'}</span>
                    <ShieldCheck style={{ width: '16px', height: '16px', color: '#10B981' }} />
                  </h3>
                  {form.linkedinUrl && (
                    <span style={{ color: '#0A66C2', display: 'flex', alignItems: 'center' }}>
                      <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28m1.39 9.74v-8.37H5.07v8.37h2.78Z"/>
                      </svg>
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#DC2626', marginBottom: '10px' }}>
                  {form.designation || 'Your Designation'}
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {form.bio || 'Your short summary bio will appear here...'}
                </p>

                {/* Skill Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {form.specializationTags.slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#334155', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                  {form.specializationTags.length > 3 && (
                    <span style={{ fontSize: '10px', padding: '3px 6px', borderRadius: '6px', background: '#E2E8F0', color: '#475569', fontWeight: 700 }}>
                      +{form.specializationTags.length - 3}
                    </span>
                  )}
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#94A3B8' }}>
                  <span>Recruitment Institute Faculty</span>
                  <span style={{ color: '#2563EB', fontWeight: 700 }}>View Profile →</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
