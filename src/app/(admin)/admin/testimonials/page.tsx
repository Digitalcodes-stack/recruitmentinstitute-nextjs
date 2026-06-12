'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Star, Quote, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface Testimonial {
  id: number
  title: string | null
  description: string | null
  author: string
  image: string | null
  rating: number
  isActive: boolean
  createdAt: string
}

const EMPTY = { title: '', description: '', author: '', image: '', rating: 5, isActive: true }

const inp = (err?: boolean) => ({
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
  border: `1px solid ${err ? '#fca5a5' : '#e2e8f0'}`, outline: 'none',
  background: '#fafafa', color: '#0f172a',
})

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/testimonials')
    const json = await res.json()
    setItems(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({ title: t.title || '', description: t.description || '', author: t.author, image: t.image || '', rating: t.rating, isActive: t.isActive })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.author.trim()) { toast.error('Author is required'); return }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : '/api/admin/testimonials'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(editing ? 'Testimonial updated' : 'Testimonial added')
      setShowForm(false)
      load()
    } catch (e: unknown) { toast.error((e as Error).message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id: number, author: string) => {
    if (!confirm(`Delete testimonial by "${author}"?`)) return
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Deleted'); load() }
    else toast.error(json.message || 'Delete failed')
  }

  const toggle = async (id: number, isActive: boolean) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive }),
    })
    const json = await res.json()
    if (json.success) { setItems(prev => prev.map(t => t.id === id ? { ...t, isActive } : t)); toast.success('Updated') }
    else toast.error('Update failed')
  }

  const active = items.filter(t => t.isActive).length
  const avgRating = items.length ? (items.reduce((s, t) => s + t.rating, 0) / items.length).toFixed(1) : '0.0'
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']

  return (
    <AdminLayout title="Testimonials">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b45309' }}>
            <Quote style={{ width: 11, height: 11 }} /> Social Proof
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>Testimonials</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Student and alumni testimonials displayed on the website.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: items.length, accent: '#2563eb' },
            { label: 'Active',   value: active,       accent: '#059669' },
            { label: 'Inactive', value: items.length - active, accent: '#94a3b8' },
            { label: 'Avg ★',   value: avgRating,    accent: '#f59e0b' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 80 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>{value}</span>
            </div>
          ))}
          <button onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Testimonial
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</p>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Author <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inp(!form.author.trim())} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Student name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Title / Role</label>
                <input style={inp()} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. HR Executive, Tech Startup" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Testimonial Text</label>
                <textarea rows={4} style={{ ...inp(), resize: 'none' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What the student said..." />
              </div>
              <div>
                <ImageUploadField
                  label="Photo"
                  value={form.image}
                  onChange={url => setForm(f => ({ ...f, image: url }))}
                  folder="testimonials"
                  previewShape="circle"
                  placeholder="Paste URL or click Browse…"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rating (1–5)</label>
                  <select style={inp()} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</label>
                  <select style={inp()} value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                    <option value="true">Active</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button onClick={save} disabled={saving}
                  style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check style={{ width: 14, height: 14 }} /> {saving ? 'Saving…' : (editing ? 'Update' : 'Add Testimonial')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 48 }}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <Quote style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No testimonials yet</p>
          <button onClick={openNew} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Add First Testimonial</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {items.map((t) => {
            const initials = (t.author || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
            const color = colors[t.id % colors.length]
            return (
              <div key={t.id} style={{ background: '#fff', border: `1px solid ${t.isActive ? '#e8ecf0' : '#f1f5f9'}`, borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20, opacity: t.isActive ? 1 : 0.65, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stars + status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} style={{ width: 13, height: 13, fill: i < t.rating ? '#f59e0b' : 'transparent', color: i < t.rating ? '#f59e0b' : '#e2e8f0' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, ...(t.isActive ? { background: '#f0fdf4', color: '#15803d' } : { background: '#f1f5f9', color: '#94a3b8' }) }}>
                    {t.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                {/* Text */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <Quote style={{ width: 18, height: 18, color: '#e2e8f0', position: 'absolute', top: 0, left: 0 }} />
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, paddingLeft: 24, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {t.description || t.title || '—'}
                  </p>
                </div>
                {/* Author */}
                <div className="flex items-center gap-3" style={{ borderTop: '1px solid #f8fafc', paddingTop: 12 }}>
                  {t.image ? (
                    <img src={t.image} alt={t.author} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{t.author}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggle(t.id, !t.isActive)} title={t.isActive ? 'Hide' : 'Show'}
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.isActive ? '#059669' : '#94a3b8', fontSize: 11, fontWeight: 700 }}>
                      {t.isActive ? '●' : '○'}
                    </button>
                    <button onClick={() => openEdit(t)} title="Edit"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                      <Pencil style={{ width: 13, height: 13 }} />
                    </button>
                    <button onClick={() => remove(t.id, t.author)} title="Delete"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
