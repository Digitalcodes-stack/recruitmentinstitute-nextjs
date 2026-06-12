'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import ImageUploadField from './ImageUploadField'

interface Service {
  id: number
  title: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  sortOrder: number
}

interface Props {
  service?: Service | null
  onClose: () => void
}

export default function ServiceModal({ service, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: service?.title || '',
    description: service?.description || '',
    image: service?.image || '',
    isActive: service?.isActive !== false,
    sortOrder: service?.sortOrder ?? 0,
  })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const set = (field: string, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = service ? `/api/admin/services/${service.id}` : '/api/admin/services'
    const method = service ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.message || 'Something went wrong')
      return
    }

    router.refresh()
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
    border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a',
    background: '#f8fafc', boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{service ? 'Edit Service' : 'Add Service'}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{service ? `Editing: ${service.title}` : 'Create a new service offering'}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 14, height: 14, color: '#64748b' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Title */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Recruitment Training"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Brief description of this service..."
              />
            </div>

            {/* Image */}
            <ImageUploadField
              label="Image"
              value={form.image}
              onChange={url => set('image', url)}
              folder="services"
              previewShape="rect"
              placeholder="Paste URL or click Browse…"
            />

            {/* Sort Order + Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Sort Order</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.sortOrder}
                  onChange={(e) => set('sortOrder', Number(e.target.value))}
                  min={0}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Status</label>
                <select
                  style={inputStyle}
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(e) => set('isActive', e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>{error}</p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading && <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />}
                {service ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
