'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Building2, Plus, Pencil, Trash2, ExternalLink, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface ClientLogo {
  id: number
  name: string
  logo: string
  website: string | null
  isActive: boolean
  sortOrder: number
}

const EMPTY: Omit<ClientLogo, 'id'> = { name: '', logo: '', website: '', isActive: true, sortOrder: 0 }

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClientLogo | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/clients')
    const json = await res.json()
    setClients(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (c: ClientLogo) => { setEditing(c); setForm({ name: c.name, logo: c.logo, website: c.website || '', isActive: c.isActive, sortOrder: c.sortOrder }); setShowForm(true) }

  const save = async () => {
    if (!form.name.trim() || !form.logo.trim()) { toast.error('Name and Logo URL are required'); return }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/clients/${editing.id}` : '/api/admin/clients'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(editing ? 'Client updated' : 'Client added')
      setShowForm(false)
      load()
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    load()
  }

  const active = clients.filter((c) => c.isActive).length

  return (
    <AdminLayout title="Client Logos">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1d4ed8' }}>
            <Building2 style={{ width: 11, height: 11 }} />
            Client / Company Logos
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>Client Logos</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Logos shown in the client strip on blog pages.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {[{ label: 'Total', value: clients.length, accent: '#2563eb' }, { label: 'Active', value: active, accent: '#059669' }].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '14px 18px', minWidth: 80 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <span style={{ fontSize: 22, fontWeight: 900, color: accent }}>{value}</span>
            </div>
          ))}
          <button onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
            <Plus style={{ width: 14, height: 14 }} /> Add Client
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, padding: 32, boxShadow: '0 24px 80px rgba(15,23,42,0.25)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>{editing ? 'Edit Client' : 'Add Client'}</h3>
            {[
              { label: 'Company Name *', key: 'name', placeholder: 'e.g. Infosys' },
              { label: 'Website URL', key: 'website', placeholder: 'https://infosys.com' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
                <input value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <ImageUploadField
                label="Logo *"
                value={form.logo}
                onChange={url => setForm(f => ({ ...f, logo: url }))}
                folder="clients"
                previewShape="rect"
                placeholder="/uploads/clients/infosys.png"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Active</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>Loading…</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <Building2 style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No clients yet. Click "Add Client" to start.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Logo', 'Name', 'Website', 'Order', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, idx) => (
                <tr key={c.id} style={{ borderBottom: idx < clients.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {c.logo ? (
                      <img src={c.logo} alt={`${c.name} logo`} style={{ height: 36, maxWidth: 80, objectFit: 'contain', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 40, height: 36, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon style={{ width: 14, height: 14, color: '#cbd5e1' }} />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                        <ExternalLink style={{ width: 11, height: 11 }} />{c.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{c.sortOrder}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, ...(c.isActive ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }) }}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#374151' }}>
                        <Pencil style={{ width: 12, height: 12 }} /> Edit
                      </button>
                      <button onClick={() => remove(c.id, c.name)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#dc2626' }}>
                        <Trash2 style={{ width: 12, height: 12 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
