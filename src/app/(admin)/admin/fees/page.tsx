'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  CreditCard, Plus, IndianRupee, Tag, TrendingDown, Pencil,
  Trash2, X, Check, FileSpreadsheet, Monitor, Building2, Percent,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Category { id: number; name: string }
interface CourseFee {
  id: number
  courseName: string
  categoryId: number
  category: Category
  fees: string | null
  discount: string | null
  subtotal: string | null
  feeTotal: string | null
  finalTotal: string | null
  onlineFees: string | null
  onlineDiscount: string | null
  onlineFinal: string | null
  offlineFees: string | null
  offlineDiscount: string | null
  offlineFinal: string | null
  modeNotes: string | null
  couponCode: string | null
}

const EMPTY = {
  courseName: '',
  categoryId: '',
  fees: '',
  discount: '',
  subtotal: '',
  feeTotal: '',
  finalTotal: '',
  onlineFees: '',
  onlineDiscount: '',
  onlineFinal: '',
  offlineFees: '',
  offlineDiscount: '',
  offlineFinal: '',
  modeNotes: '',
  couponCode: '',
}

const inp = (err?: boolean) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  fontSize: 13,
  border: `1px solid ${err ? '#fca5a5' : '#e2e8f0'}`,
  outline: 'none',
  background: '#fafafa',
  color: '#0f172a',
})

export default function AdminFeesPage() {
  const [fees, setFees] = useState<CourseFee[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CourseFee | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [fr, cr] = await Promise.all([
      fetch('/api/admin/fees').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ])
    setFees(fr.data || [])
    setCats(cr.data || cr || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  const openEdit = (f: CourseFee) => {
    setEditing(f)
    const baseFee = f.fees ? String(Number(f.fees)) : ''
    const onBase = f.onlineFees ? String(Number(f.onlineFees)) : baseFee
    const onDisc = f.onlineDiscount ? String(Number(f.onlineDiscount)) : (onBase ? String(Math.round(Number(onBase) * 0.5)) : '')
    const onFinal = f.onlineFinal ? String(Number(f.onlineFinal)) : (onBase ? String(Number(onBase) - Number(onDisc)) : '')

    const offBase = f.offlineFees ? String(Number(f.offlineFees)) : baseFee
    const offDisc = f.offlineDiscount ? String(Number(f.offlineDiscount)) : (offBase ? String(Math.round(Number(offBase) * 0.1)) : '')
    const offFinal = f.offlineFinal ? String(Number(f.offlineFinal)) : (offBase ? String(Number(offBase) - Number(offDisc)) : '')

    setForm({
      courseName: f.courseName,
      categoryId: String(f.categoryId),
      fees: baseFee,
      discount: f.discount ? String(Number(f.discount)) : onDisc,
      subtotal: f.subtotal ? String(Number(f.subtotal)) : onFinal,
      feeTotal: f.feeTotal ? String(Number(f.feeTotal)) : onFinal,
      finalTotal: f.finalTotal ? String(Number(f.finalTotal)) : onFinal,
      onlineFees: onBase,
      onlineDiscount: onDisc,
      onlineFinal: onFinal,
      offlineFees: offBase,
      offlineDiscount: offDisc,
      offlineFinal: offFinal,
      modeNotes: f.modeNotes || '',
      couponCode: f.couponCode || '',
    })
    setShowForm(true)
  }

  const autoComputePricing = (baseVal: string) => {
    const b = Number(baseVal) || 0
    if (b <= 0) return

    const onDisc = Math.round(b * 0.50)
    const onFinal = Math.max(0, b - onDisc)

    const offDisc = Math.round(b * 0.10)
    const offFinal = Math.max(0, b - offDisc)

    setForm(prev => ({
      ...prev,
      fees: baseVal,
      onlineFees: baseVal,
      onlineDiscount: String(onDisc),
      onlineFinal: String(onFinal),
      offlineFees: baseVal,
      offlineDiscount: String(offDisc),
      offlineFinal: String(offFinal),
      discount: String(onDisc),
      subtotal: String(onFinal),
      feeTotal: String(onFinal),
      finalTotal: String(onFinal),
    }))
  }

  const save = async () => {
    if (!form.courseName.trim()) { toast.error('Course name is required'); return }
    if (!form.categoryId) { toast.error('Category is required'); return }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/fees/${editing.id}` : '/api/admin/fees'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(editing ? 'Fee entry updated' : 'Fee entry added')
      setShowForm(false)
      load()
    } catch (e: unknown) { toast.error((e as Error).message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete fee entry for "${name}"?`)) return
    const res = await fetch(`/api/admin/fees/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) { toast.success('Deleted'); load() }
    else toast.error(json.message || 'Delete failed')
  }

  const totalFees = fees.length

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.value
    setForm(f => {
      const next = { ...f, [k]: val }
      if (k === 'onlineFees' || k === 'onlineDiscount') {
        const onB = Number(k === 'onlineFees' ? val : f.onlineFees) || 0
        const onD = Number(k === 'onlineDiscount' ? val : f.onlineDiscount) || 0
        const onFin = Math.max(0, onB - onD)
        next.onlineFinal = onFin > 0 ? String(onFin) : ''
        next.fees = String(onB)
        next.discount = String(onD)
        next.finalTotal = String(onFin)
      }
      if (k === 'offlineFees' || k === 'offlineDiscount') {
        const offB = Number(k === 'offlineFees' ? val : f.offlineFees) || 0
        const offD = Number(k === 'offlineDiscount' ? val : f.offlineDiscount) || 0
        const offFin = Math.max(0, offB - offD)
        next.offlineFinal = offFin > 0 ? String(offFin) : ''
      }
      return next
    })
  }

  return (
    <AdminLayout title="Course Fees">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#15803d' }}>
            <IndianRupee style={{ width: 11, height: 11 }} /> Pricing Management
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>Online & Offline Course Fees</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Manage transparent tuition fees: <strong>Online (50% OFF)</strong> and <strong>Offline Classroom (10% OFF)</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '14px 18px' }}>
            <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              <Monitor style={{ width: 12, height: 12 }} /> Online Discount
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#1e40af' }}>50% OFF Default</span>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16, padding: '14px 18px' }}>
            <div className="flex items-center gap-1.5 mb-1" style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              <Building2 style={{ width: 12, height: 12 }} /> Offline Discount
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#92400e' }}>10% OFF Default</span>
          </div>

          <a
            href="/api/admin/fees/export"
            download="recruitment_institute_all_courses.xlsx"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
          >
            <FileSpreadsheet style={{ width: 15, height: 15 }} /> Export to Excel
          </a>
          <button onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Fee Entry
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{editing ? 'Edit Course Pricing' : 'Add Course Pricing'}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Configure Base Fee, Online (50% Off) & Offline (10% Off) amounts.</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Course Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={inp(!form.courseName.trim())} value={form.courseName} onChange={F('courseName')} placeholder="e.g. Recruitment Career Starter" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select style={{ ...inp(!form.categoryId), appearance: 'none' }} value={form.categoryId} onChange={F('categoryId')}>
                    <option value="">Select category…</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Base Quick Setup Bar */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Standard Base Tuition Fee (₹)
                    </label>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Changing this auto-calculates 50% Online & 10% Offline</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      style={{ ...inp(), width: 160, fontWeight: 700, fontSize: 14 }}
                      type="number"
                      placeholder="e.g. 10000"
                      value={form.fees}
                      onChange={(e) => {
                        F('fees')(e)
                        autoComputePricing(e.target.value)
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── ONLINE TIER (50% OFF) ── */}
              <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 14, padding: '16px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Monitor style={{ width: 11, height: 11 }} /> ONLINE MODE
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>Live Interactive Sessions (50% Discount)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#0284c7', marginBottom: 4 }}>Online Base (₹)</label>
                    <input style={inp()} type="number" value={form.onlineFees} onChange={F('onlineFees')} placeholder="e.g. 10000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#0284c7', marginBottom: 4 }}>Online Discount (₹)</label>
                    <input style={inp()} type="number" value={form.onlineDiscount} onChange={F('onlineDiscount')} placeholder="e.g. 5000 (50%)" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#0369a1', marginBottom: 4 }}>Online Final Price (₹)</label>
                    <input style={{ ...inp(), fontWeight: 800, color: '#0369a1', background: '#e0f2fe' }} type="number" value={form.onlineFinal} onChange={F('onlineFinal')} placeholder="e.g. 5000" />
                  </div>
                </div>
              </div>

              {/* ── OFFLINE TIER (10% OFF) ── */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '16px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ background: '#d97706', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 style={{ width: 11, height: 11 }} /> OFFLINE / CLASSROOM
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>Pune Center In-Person Training (10% Discount)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>Offline Base (₹)</label>
                    <input style={inp()} type="number" value={form.offlineFees} onChange={F('offlineFees')} placeholder="e.g. 10000" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>Offline Discount (₹)</label>
                    <input style={inp()} type="number" value={form.offlineDiscount} onChange={F('offlineDiscount')} placeholder="e.g. 1000 (10%)" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#92400e', marginBottom: 4 }}>Offline Final Price (₹)</label>
                    <input style={{ ...inp(), fontWeight: 800, color: '#92400e', background: '#fef3c7' }} type="number" value={form.offlineFinal} onChange={F('offlineFinal')} placeholder="e.g. 9000" />
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Coupon Code (Optional)</label>
                  <input style={inp()} type="text" value={form.couponCode} onChange={F('couponCode')} placeholder="e.g. FLAT50" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Classroom / Mode Notes</label>
                  <input style={inp()} type="text" value={form.modeNotes} onChange={F('modeNotes')} placeholder="e.g. Pune Center • Weekend Batches" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button onClick={save} disabled={saving}
                  style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check style={{ width: 14, height: 14 }} /> {saving ? 'Saving…' : (editing ? 'Update Course Fees' : 'Save Course Fees')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Program Pricing & Discount Comparison</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{totalFees} active course fee configurations</p>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 48 }}>Loading…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['#', 'Course & Category', 'Standard Base', 'Online Mode (50% OFF)', 'Offline Mode (10% OFF)', 'Coupon', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>No fee entries yet.</p>
                      <button onClick={openNew} style={{ padding: '8px 20px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Add First Entry</button>
                    </td>
                  </tr>
                ) : fees.map((f, idx) => {
                  const baseFee = Number(f.fees || f.onlineFees || 0)
                  const onFinal = Number(f.onlineFinal || (baseFee * 0.5))
                  const offFinal = Number(f.offlineFinal || (baseFee * 0.9))

                  const onDisc = Number(f.onlineDiscount || (baseFee * 0.5))
                  const offDisc = Number(f.offlineDiscount || (baseFee * 0.1))

                  const onPct = baseFee > 0 ? Math.round((onDisc / baseFee) * 100) : 50
                  const offPct = baseFee > 0 ? Math.round((offDisc / baseFee) * 100) : 10

                  return (
                    <tr key={f.id} style={{ borderBottom: idx < fees.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '14px 20px', minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{f.courseName}</div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', display: 'inline-block', marginTop: 4 }}>
                          {f.category?.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                        {baseFee > 0 ? `₹${baseFee.toLocaleString('en-IN')}` : '—'}
                      </td>

                      {/* Online Column */}
                      <td style={{ padding: '14px 20px', minWidth: 170 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#0284c7' }}>
                            ₹{onFinal.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 6 }}>
                            {onPct}% OFF
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2 }}>
                          Save ₹{onDisc.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Offline Column */}
                      <td style={{ padding: '14px 20px', minWidth: 170 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#d97706' }}>
                            ₹{offFinal.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 6 }}>
                            {offPct}% OFF
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          Save ₹{offDisc.toLocaleString('en-IN')} • Pune Center
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {f.couponCode
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}><Tag style={{ width: 10, height: 10 }} />{f.couponCode}</span>
                          : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(f)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 11, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
                            <Pencil style={{ width: 11, height: 11 }} /> Edit
                          </button>
                          <button onClick={() => remove(f.id, f.courseName)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', fontSize: 11, fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
                            <Trash2 style={{ width: 11, height: 11 }} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
