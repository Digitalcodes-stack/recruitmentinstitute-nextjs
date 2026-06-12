'use client'

import { useEffect, useRef, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, X, Check, ImageIcon, FileText, Sparkles, AlignLeft, Type, Link2, Upload, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

interface AboutSection {
  id: number
  title: string | null
  subtitle: string | null
  description: string | null
  image: string | null
  createdAt: string
}

const EMPTY = { title: '', subtitle: '', description: '', image: '' }

const ACCENT_PALETTE = [
  { bar: 'linear-gradient(90deg,#3b82f6,#6366f1)', badge: '#EFF6FF', badgeText: '#2563EB', dot: '#3b82f6' },
  { bar: 'linear-gradient(90deg,#8b5cf6,#a78bfa)', badge: '#F5F3FF', badgeText: '#7C3AED', dot: '#8b5cf6' },
  { bar: 'linear-gradient(90deg,#06b6d4,#38bdf8)', badge: '#ECFEFF', badgeText: '#0891B2', dot: '#06b6d4' },
  { bar: 'linear-gradient(90deg,#10b981,#34d399)', badge: '#F0FDF4', badgeText: '#059669', dot: '#10b981' },
  { bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)', badge: '#FFFBEB', badgeText: '#D97706', dot: '#f59e0b' },
  { bar: 'linear-gradient(90deg,#ef4444,#f87171)', badge: '#FEF2F2', badgeText: '#DC2626', dot: '#ef4444' },
]

const fieldLabel = (text: string, required?: boolean) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
    {text}{required && <span style={{ color: '#ef4444', fontSize: 13, lineHeight: 1 }}>*</span>}
  </label>
)

const inputBase: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: 11, fontSize: 13.5,
  border: '1.5px solid #e8edf5', outline: 'none', background: '#f8faff',
  color: '#0f172a', transition: 'border-color 0.15s',
}
const inputErr: React.CSSProperties = { ...inputBase, border: '1.5px solid #fca5a5', background: '#fff8f8' }

export default function AdminAboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AboutSection | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'about')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setForm(f => ({ ...f, image: json.url }))
      toast.success('Image uploaded!')
    } catch (e: unknown) { toast.error((e as Error).message || 'Upload failed') }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/about')
    const json = await res.json()
    setSections(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (s: AboutSection) => {
    setEditing(s)
    setForm({ title: s.title || '', subtitle: s.subtitle || '', description: s.description || '', image: s.image || '' })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/about/${editing.id}` : '/api/admin/about'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(editing ? 'Section updated!' : 'Section added!')
      setShowForm(false)
      load()
    } catch (e: unknown) { toast.error((e as Error).message || 'Something went wrong') }
    finally { setSaving(false) }
  }

  const remove = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/about/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Section deleted'); load() }
    else toast.error(json.message || 'Delete failed')
  }

  const dynInp = (field: string, err?: boolean): React.CSSProperties => ({
    ...(err ? inputErr : inputBase),
    border: focusField === field ? '1.5px solid #3b82f6' : (err ? '1.5px solid #fca5a5' : '1.5px solid #e8edf5'),
    boxShadow: focusField === field ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
  })

  return (
    <AdminLayout title="About Us">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#f0f7ff 0%,#e8f0fe 50%,#f5f0ff 100%)',
        border: '1px solid #dce8fb', borderRadius: 24, padding: '32px 36px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 120, width: 100, height: 100, borderRadius: '50%', background: 'rgba(59,130,246,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            {/* pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.85)', border: '1px solid #c7d9f8', borderRadius: 50, padding: '5px 14px', marginBottom: 14, backdropFilter: 'blur(6px)' }}>
              <Sparkles style={{ width: 12, height: 12, color: '#6366f1' }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1' }}>Brand Content</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
              About Us
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 6, fontWeight: 400 }}>
              Manage your brand story, mission &amp; page content sections.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* stat card */}
            <div style={{ background: 'rgba(255,255,255,0.90)', border: '1px solid #dce8fb', borderRadius: 18, padding: '14px 22px', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(59,130,246,0.08)', minWidth: 110, textAlign: 'center' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <FileText style={{ width: 10, height: 10 }} /> Sections
              </p>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.04em' }}>{loading ? '—' : sections.length}</span>
            </div>

            {/* add button */}
            <button onClick={openNew} style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '12px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
              color: '#fff', fontSize: 13.5, fontWeight: 700, border: 'none',
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
              letterSpacing: '-0.01em',
            }}>
              <Plus style={{ width: 15, height: 15 }} /> Add Section
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 580, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', overflow: 'hidden', animation: 'fadeIn .15s ease' }}>

            {/* modal header */}
            <div style={{ background: 'linear-gradient(135deg,#f0f7ff,#f5f0ff)', borderBottom: '1px solid #e8edf5', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                  {editing ? <Pencil style={{ width: 16, height: 16, color: '#fff' }} /> : <Plus style={{ width: 16, height: 16, color: '#fff' }} />}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{editing ? 'Edit Section' : 'New Section'}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{editing ? 'Update the section details below' : 'Fill in the details for this section'}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* modal body */}
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Title */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Type style={{ width: 12, height: 12, color: '#6366f1' }} />
                  {fieldLabel('Title', true)}
                </div>
                <input
                  style={dynInp('title', !form.title.trim() && saving)}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onFocus={() => setFocusField('title')}
                  onBlur={() => setFocusField(null)}
                  placeholder="e.g. Our Mission"
                />
              </div>

              {/* Subtitle */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Sparkles style={{ width: 12, height: 12, color: '#8b5cf6' }} />
                  {fieldLabel('Subtitle')}
                </div>
                <input
                  style={dynInp('subtitle')}
                  value={form.subtitle}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  onFocus={() => setFocusField('subtitle')}
                  onBlur={() => setFocusField(null)}
                  placeholder="e.g. Empowering Every Talent"
                />
              </div>

              {/* Description */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <AlignLeft style={{ width: 12, height: 12, color: '#06b6d4' }} />
                  {fieldLabel('Description')}
                </div>
                <textarea
                  rows={4}
                  style={{ ...dynInp('desc'), resize: 'vertical' } as React.CSSProperties}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  onFocus={() => setFocusField('desc')}
                  onBlur={() => setFocusField(null)}
                  placeholder="Write the section body content here…"
                />
              </div>

              {/* Image URL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <Link2 style={{ width: 12, height: 12, color: '#10b981' }} />
                  {fieldLabel('Image')}
                </div>

                {/* hidden file input */}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />

                {/* URL input + Browse button row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...dynInp('image'), flex: 1 }}
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    onFocus={() => setFocusField('image')}
                    onBlur={() => setFocusField(null)}
                    placeholder="Paste URL or click Browse…"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
                      padding: '0 18px', borderRadius: 11, border: '1.5px solid #dbeafe',
                      background: uploading ? '#f1f5f9' : 'linear-gradient(135deg,#eff6ff,#e0e7ff)',
                      color: uploading ? '#94a3b8' : '#2563eb', fontSize: 13, fontWeight: 700,
                      cursor: uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {uploading
                      ? <><span style={{ width: 13, height: 13, border: '2px solid #c7d2fe', borderTopColor: '#6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Uploading…</>
                      : <><FolderOpen style={{ width: 14, height: 14 }} /> Browse</>
                    }
                  </button>
                </div>

                {/* image preview */}
                {form.image && (
                  <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0', position: 'relative' }}>
                    <img
                      src={form.image.startsWith('http') ? form.image : `/${form.image.replace(/^\/+/, '')}`}
                      alt="preview"
                      style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.45))', height: 48 }} />
                    <span style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Preview</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: '' }))}
                      style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid #f1f5f9', marginTop: 2 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving} style={{
                  flex: 2.5, padding: '11px', borderRadius: 12, border: 'none',
                  background: saving ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
                  color: '#fff', fontSize: 13.5, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                  letterSpacing: '-0.01em',
                }}>
                  {saving
                    ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                    : <><Check style={{ width: 15, height: 15 }} /> {editing ? 'Update Section' : 'Add Section'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content List ─────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2].map(n => (
            <div key={n} style={{ background: '#f8faff', border: '1px solid #e8edf5', borderRadius: 20, height: 120, animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : sections.length === 0 ? (
        /* Empty state */
        <div style={{ background: 'linear-gradient(135deg,#f8faff,#f5f0ff)', border: '1.5px dashed #c7d9f8', borderRadius: 24, padding: '72px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1px solid #dce8fb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <FileText style={{ width: 28, height: 28, color: '#a5b4fc' }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1e3a8a', marginBottom: 8, letterSpacing: '-0.02em' }}>No sections yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 22 }}>Start building your About Us page by adding your first content section.</p>
          <button onClick={openNew} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 26px', borderRadius: 14,
            background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
            color: '#fff', fontSize: 13.5, fontWeight: 700, border: 'none',
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
          }}>
            <Plus style={{ width: 14, height: 14 }} /> Add First Section
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((s, idx) => {
            const pal = ACCENT_PALETTE[idx % ACCENT_PALETTE.length]
            return (
              <div key={s.id} style={{
                background: '#fff',
                border: '1px solid #e8edf5',
                borderRadius: 22,
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(37,99,235,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
              >
                {/* coloured top accent bar */}
                <div style={{ height: 4, background: pal.bar }} />

                <div style={{ display: 'grid', gridTemplateColumns: s.image ? '220px 1fr' : '1fr' }}>
                  {s.image && (
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                      <img src={s.image && (s.image.startsWith('http') ? s.image : `/${s.image.replace(/^\/+/, '')}`)} alt={s.title || ''} style={{ width: '100%', height: '100%', minHeight: 160, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,transparent 70%,rgba(255,255,255,0.15))' }} />
                    </div>
                  )}

                  <div style={{ padding: '22px 28px' }}>
                    {/* top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* section number badge */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', background: pal.badge, color: pal.badgeText, border: `1px solid ${pal.badgeText}22`, borderRadius: 50, padding: '3px 11px', marginBottom: 10 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pal.dot, display: 'inline-block' }} />
                          Section {idx + 1}
                        </span>

                        {s.title && (
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.title}
                          </h3>
                        )}
                        {s.subtitle && (
                          <p style={{ fontSize: 13, fontWeight: 600, color: pal.badgeText, margin: '0 0 10px' }}>
                            {s.subtitle}
                          </p>
                        )}
                      </div>

                      {/* no-image placeholder icon */}
                      {!s.image && (
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: pal.badge, border: `1px solid ${pal.badgeText}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ImageIcon style={{ width: 18, height: 18, color: pal.badgeText }} />
                        </div>
                      )}
                    </div>

                    {/* description */}
                    {s.description && (
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', marginBottom: 16 }}>
                        {s.description}
                      </p>
                    )}

                    {/* footer row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>
                        Added {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(s)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 16px', borderRadius: 10,
                          border: '1.5px solid #dbeafe', background: '#eff6ff',
                          fontSize: 12, fontWeight: 700, color: '#2563eb', cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}>
                          <Pencil style={{ width: 12, height: 12 }} /> Edit
                        </button>
                        <button onClick={() => remove(s.id, s.title || `Section ${idx + 1}`)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 16px', borderRadius: 10,
                          border: '1.5px solid #fecaca', background: '#fef2f2',
                          fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}>
                          <Trash2 style={{ width: 12, height: 12 }} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </AdminLayout>
  )
}
