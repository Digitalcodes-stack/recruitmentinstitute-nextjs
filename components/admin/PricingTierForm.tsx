'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IndianRupee, ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Category { id: number; name: string }

interface Tier {
  id: number
  categoryId: number
  name: string
  priceRange: string
  duration: string | null
  badge: string | null
  bestFor: string | null
  isHighlighted: boolean
  sortOrder: number
}

interface Props {
  categories: Category[]
  tier?: Tier
  defaultCategoryId?: number
}

export default function PricingTierForm({ categories, tier, defaultCategoryId }: Props) {
  const router = useRouter()
  const isEdit = !!tier

  const [form, setForm] = useState({
    categoryId:    tier?.categoryId ? String(tier.categoryId) : (defaultCategoryId ? String(defaultCategoryId) : ''),
    name:          tier?.name ?? '',
    priceRange:    tier?.priceRange ?? '',
    duration:      tier?.duration ?? '',
    badge:         tier?.badge ?? '',
    bestFor:       tier?.bestFor ?? '',
    isHighlighted: tier?.isHighlighted ?? false,
    sortOrder:     tier?.sortOrder != null ? String(tier.sortOrder) : '0',
  })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [saving, setSaving]     = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm((f) => ({ ...f, [k]: val }))
    setErrors((er) => ({ ...er, [k]: '' }))
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.categoryId)          errs.categoryId = 'Category is required'
    if (!form.name.trim())         errs.name       = 'Plan name is required'
    if (!form.priceRange.trim())   errs.priceRange = 'Price is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/pricing-tiers/${tier!.id}` : '/api/admin/pricing-tiers'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId:    Number(form.categoryId),
          name:          form.name,
          priceRange:    form.priceRange,
          duration:      form.duration,
          badge:         form.badge,
          bestFor:       form.bestFor,
          isHighlighted: form.isHighlighted,
          sortOrder:     Number(form.sortOrder) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.message || 'Something went wrong')
        return
      }
      router.push('/admin/pricing-tiers')
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={() => router.push('/admin/pricing-tiers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </button>
        <span style={{ color: '#e2e8f0' }}>·</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#15803d' }}>
          <IndianRupee style={{ width: 11, height: 11 }} />
          {isEdit ? 'Edit Pricing Tier' : 'Add Pricing Tier'}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {isEdit ? 'Edit Pricing Tier' : 'New Pricing Tier'}
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>
          Used on multi-tier program pages (e.g. Recruitment Business Accelerator's Launch / Incubator / Accelerator plans).
        </p>

        {apiError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Course Category *</label>
            <select value={form.categoryId} onChange={set('categoryId')} style={inp('categoryId')}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.categoryId}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Plan Name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Plan 2 — Incubator" style={inp('name')} />
            {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Price Range *</label>
            <input type="text" value={form.priceRange} onChange={set('priceRange')} placeholder="e.g. ₹75,000 – ₹99,000" style={inp('priceRange')} />
            {errors.priceRange && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.priceRange}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Duration</label>
              <input type="text" value={form.duration} onChange={set('duration')} placeholder="e.g. 6 Months" style={inp('duration')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={set('sortOrder')} placeholder="1" style={inp('sortOrder')} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Badge Label</label>
            <input type="text" value={form.badge} onChange={set('badge')} placeholder="e.g. HERO • MOST POPULAR & RECOMMENDED" style={inp('badge')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Best For</label>
            <textarea value={form.bestFor} onChange={set('bestFor')} placeholder="Who this plan is best suited for…" rows={3}
              style={{ ...inp('bestFor'), resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isHighlighted} onChange={set('isHighlighted')} style={{ width: 16, height: 16 }} />
            Highlight as recommended plan
          </label>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={() => router.push('/admin/pricing-tiers')}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 style={{ width: 14, height: 14 }} /> : <Save style={{ width: 14, height: 14 }} />}
              {saving ? 'Saving…' : (isEdit ? 'Update Tier' : 'Save Tier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
