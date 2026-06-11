'use client'

import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { Plus, Edit2, Trash2, Lightbulb, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { KnowledgeItem } from '@/types'

interface Props {
  items: KnowledgeItem[]
}

export default function AdminKnowledgeList({ items: initial }: Props) {
  const [items, setItems]       = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ question: '', answer: '', addedBy: '' })
  const [editId, setEditId]     = useState<number | null>(null)
  const [loading, setLoading]   = useState(false)

  const resetForm = () => { setForm({ question: '', answer: '', addedBy: '' }); setEditId(null); setShowForm(false) }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const url    = editId ? `/api/admin/knowledge/${editId}` : '/api/admin/knowledge'
    const method = editId ? 'PUT' : 'POST'
    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) {
        toast.success(editId ? 'Updated!' : 'Created!')
        setItems((i) => editId ? i.map((x) => (x.id === editId ? data.data : x)) : [data.data, ...i])
        resetForm()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setForm({ question: item.question, answer: item.answer, addedBy: item.addedBy || '' })
    setEditId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this knowledge item?')) return
    const res = await fetch(`/api/admin/knowledge/${id}`, { method: 'DELETE' })
    if ((await res.json()).success) {
      setItems((i) => i.filter((x) => x.id !== id))
      toast.success('Deleted')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 12, border: '1px solid #e8ecf0',
    background: '#fff', padding: '10px 16px', fontSize: 13,
    color: '#0f172a', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  return (
    <AdminLayout title="Knowledge Base">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 100, padding: '5px 13px', marginBottom: 12,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b45309',
            }}
          >
            <Lightbulb style={{ width: 11, height: 11 }} />
            Knowledge Library
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Knowledge Base
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {items.length} Q&amp;A items in the library
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Stat mini-card */}
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 90 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Items</p>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{items.length}</span>
          </div>

          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ question: '', answer: '', addedBy: '' }) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Add Item
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 20, boxShadow: '0 4px 20px rgba(37,99,235,0.08)', padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              {editId ? 'Edit Item' : 'New Knowledge Item'}
            </h3>
            <button
              onClick={resetForm}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = '#f1f5f9'; el.style.color = '#475569' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = '#fff'; el.style.color = '#94a3b8' }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Question *</label>
              <input
                type="text" required value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="Enter the question"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#60a5fa' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e8ecf0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Answer *</label>
              <textarea
                required rows={4} value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Enter a detailed answer"
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#60a5fa' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e8ecf0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Added By</label>
              <input
                type="text" value={form.addedBy}
                onChange={(e) => setForm({ ...form, addedBy: e.target.value })}
                placeholder="Author name"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#60a5fa' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e8ecf0' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit" disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Saving…' : editId ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button" onClick={resetForm}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Item cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #e8ecf0', borderRadius: 20, padding: '72px 32px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lightbulb style={{ width: 22, height: 22, color: '#fbbf24' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No knowledge items yet.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Add your first item
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '20px 24px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = '#cbd5e1'; el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = '#e8ecf0'; el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lightbulb style={{ width: 16, height: 16, color: '#f59e0b' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8, lineHeight: 1.4 }}>
                      {item.question}
                    </h3>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                      {item.answer}
                    </p>
                    {item.addedBy && (
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>— {item.addedBy}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => handleEdit(item)}
                    title="Edit"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = '#2563eb'; el.style.background = '#eff6ff'; el.style.borderColor = '#bfdbfe' }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = '#94a3b8'; el.style.background = '#fff'; el.style.borderColor = '#e8ecf0' }}
                  >
                    <Edit2 style={{ width: 12, height: 12 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = '#e11d48'; el.style.background = '#fff1f2'; el.style.borderColor = '#fecdd3' }}
                    onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = '#94a3b8'; el.style.background = '#fff'; el.style.borderColor = '#e8ecf0' }}
                  >
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </AdminLayout>
  )
}
