'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CreditCard, Plus, IndianRupee, Tag, TrendingDown, Pencil, Trash2, X, Check } from 'lucide-react'
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
  couponCode: string | null
}

const EMPTY = { courseName: '', categoryId: '', fees: '', discount: '', subtotal: '', feeTotal: '', finalTotal: '', couponCode: '' }

const inp = (err?: boolean) => ({
  width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
  border: `1px solid ${err ? '#fca5a5' : '#e2e8f0'}`, outline: 'none',
  background: '#fafafa', color: '#0f172a',
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

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (f: CourseFee) => {
    setEditing(f)
    setForm({
      courseName: f.courseName,
      categoryId: String(f.categoryId),
      fees: f.fees ? String(Number(f.fees)) : '',
      discount: f.discount ? String(Number(f.discount)) : '',
      subtotal: f.subtotal ? String(Number(f.subtotal)) : '',
      feeTotal: f.feeTotal ? String(Number(f.feeTotal)) : '',
      finalTotal: f.finalTotal ? String(Number(f.finalTotal)) : '',
      couponCode: f.couponCode || '',
    })
    setShowForm(true)
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
  const avgFee = fees.length ? (fees.reduce((s, f) => s + Number(f.fees || 0), 0) / fees.length).toFixed(0) : '0'
  const avgDiscount = fees.length ? (fees.reduce((s, f) => s + Number(f.discount || 0), 0) / fees.length).toFixed(0) : '0'

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value
    setForm(f => {
      const next = { ...f, [k]: val }
      if (k === 'fees' || k === 'discount') {
        const fee = Number(k === 'fees' ? val : f.fees) || 0
        const disc = Number(k === 'discount' ? val : f.discount) || 0
        const calc = fee - disc
        next.subtotal = calc > 0 ? String(calc) : ''
        next.finalTotal = calc > 0 ? String(calc) : ''
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
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>Course Fees</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Manage course pricing, discounts and final totals.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Entries', value: totalFees, icon: CreditCard },
            { label: 'Avg Fee (₹)', value: `₹${Number(avgFee).toLocaleString('en-IN')}`, icon: IndianRupee },
            { label: 'Avg Discount', value: `₹${Number(avgDiscount).toLocaleString('en-IN')}`, icon: TrendingDown },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 120 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} /> {label}
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <button onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Fee Entry
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{editing ? 'Edit Fee Entry' : 'Add Fee Entry'}</p>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Course Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inp(!form.courseName.trim())} value={form.courseName} onChange={F('courseName')} placeholder="e.g. HR Corporate Training" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                <select style={{ ...inp(!form.categoryId), appearance: 'none' }} value={form.categoryId} onChange={F('categoryId')}>
                  <option value="">Select category…</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([
                  ['fees', 'Fee Amount (₹)', 'e.g. 25000'],
                  ['discount', 'Discount (₹)', 'e.g. 5000'],
                  ['subtotal', 'Subtotal (₹)', 'auto-calculated'],
                  ['feeTotal', 'Fee Total (₹)', 'after adjustments'],
                  ['finalTotal', 'Final Total (₹)', 'what student pays'],
                  ['couponCode', 'Coupon Code', 'e.g. HRPRO10'],
                ] as const).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
                    <input
                      style={inp()}
                      type={key === 'couponCode' ? 'text' : 'number'}
                      value={form[key]}
                      onChange={F(key)}
                      placeholder={placeholder}
                      min={key !== 'couponCode' ? '0' : undefined}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button onClick={save} disabled={saving}
                  style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check style={{ width: 14, height: 14 }} /> {saving ? 'Saving…' : (editing ? 'Update Entry' : 'Add Entry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Fee Schedule</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{totalFees} entries</p>
        </div>
        {loading ? (
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 48 }}>Loading…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['#', 'Course Name', 'Category', 'Fee (₹)', 'Discount (₹)', 'Final Total (₹)', 'Coupon', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>No fee entries yet.</p>
                      <button onClick={openNew} style={{ padding: '8px 20px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Add First Entry</button>
                    </td>
                  </tr>
                ) : fees.map((f, idx) => {
                  const feeAmt = Number(f.fees || 0)
                  const discAmt = Number(f.discount || 0)
                  const calcFinal = feeAmt > 0 ? feeAmt - discAmt : 0
                  return (
                    <tr key={f.id} style={{ borderBottom: idx < fees.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a', minWidth: 180 }}>{f.courseName}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' }}>{f.category?.name}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {feeAmt > 0 ? `₹${feeAmt.toLocaleString('en-IN')}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {discAmt > 0
                          ? <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>-₹{discAmt.toLocaleString('en-IN')}</span>
                          : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {calcFinal > 0
                          ? <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>₹{calcFinal.toLocaleString('en-IN')}</span>
                          : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {f.couponCode
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}><Tag style={{ width: 10, height: 10 }} />{f.couponCode}</span>
                          : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(f)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 11, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>
                            <Pencil style={{ width: 11, height: 11 }} /> Edit
                          </button>
                          <button onClick={() => remove(f.id, f.courseName)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
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
