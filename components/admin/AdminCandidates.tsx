'use client'

import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { CheckCircle, XCircle, Clock, Users, Pencil, X, Lock, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Candidate {
  id: number
  name: string
  email: string
  mobile: string | null
  phone: string | null
  courseSelect: string | null
  acceptSignin: number
  createdAt: Date
  city: string | null
  gender: string | null
  address?: string | null
}

interface Props {
  candidates: Candidate[]
}

type Filter = 'all' | 'pending' | 'approved'

export default function AdminCandidates({ candidates: initial }: Props) {
  const [candidates, setCandidates] = useState(initial)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = candidates.filter((c) => {
    if (filter === 'pending') return c.acceptSignin === 0
    if (filter === 'approved') return c.acceptSignin === 1
    return true
  })

  const pendingCount  = candidates.filter((c) => c.acceptSignin === 0).length
  const approvedCount = candidates.filter((c) => c.acceptSignin === 1).length

  const handleApprove = async (id: number) => {
    const res = await fetch(`/api/admin/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptSignin: 1 }),
    })
    const data = await res.json()
    if (data.success) {
      setCandidates((c) => c.map((x) => (x.id === id ? { ...x, acceptSignin: 1 } : x)))
      toast.success('Candidate approved')
    }
  }

  const handleReject = async (id: number) => {
    if (!confirm('Remove this candidate?')) return
    const res = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setCandidates((c) => c.filter((x) => x.id !== id))
      toast.success('Candidate removed')
    }
  }

  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    gender: '',
    address: '',
    courseSelect: '',
    acceptSignin: 0,
    password: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const handleOpenEdit = (c: Candidate) => {
    setEditingCandidate(c)
    setEditForm({
      name: c.name,
      email: c.email,
      phone: c.mobile || c.phone || '',
      city: c.city || '',
      gender: c.gender || '',
      address: c.address || '',
      courseSelect: c.courseSelect || '',
      acceptSignin: c.acceptSignin,
      password: '',
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCandidate) return
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/candidates/${editingCandidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim().toLowerCase(),
          mobile: editForm.phone.trim() || null,
          phone: editForm.phone.trim() || null,
          city: editForm.city.trim() || null,
          gender: editForm.gender.trim() || null,
          address: editForm.address.trim() || null,
          courseSelect: editForm.courseSelect.trim() || null,
          acceptSignin: editForm.acceptSignin,
          password: editForm.password ? editForm.password.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Candidate profile updated successfully!')
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === editingCandidate.id
              ? {
                  ...c,
                  name: editForm.name.trim(),
                  email: editForm.email.trim().toLowerCase(),
                  mobile: editForm.phone.trim() || null,
                  phone: editForm.phone.trim() || null,
                  city: editForm.city.trim() || null,
                  gender: editForm.gender.trim() || null,
                  address: editForm.address.trim() || null,
                  courseSelect: editForm.courseSelect.trim() || null,
                  acceptSignin: editForm.acceptSignin,
                }
              : c
          )
        )
        setEditingCandidate(null)
      } else {
        toast.error(data.message || 'Failed to update candidate')
      }
    } catch {
      toast.error('Network error saving candidate changes')
    } finally {
      setSavingEdit(false)
    }
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: candidates.length },
    { key: 'pending',  label: 'Pending',  count: pendingCount },
    { key: 'approved', label: 'Approved', count: approvedCount },
  ]

  return (
    <AdminLayout title="Candidates">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 100, padding: '5px 13px', marginBottom: 12,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb',
            }}
          >
            <Users style={{ width: 11, height: 11 }} />
            Candidate Management
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Candidates
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            {candidates.length} total{pendingCount > 0 && ` · ${pendingCount} pending approval`}
          </p>
        </div>

        {/* Stat mini-cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    value: candidates.length, accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Pending',  value: pendingCount,      accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Approved', value: approvedCount,     accent: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
          ].map(({ label, value, accent, bg, border }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 90 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: accent, border: `1px solid ${border}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: filter === key ? 'none' : '1px solid #e8ecf0',
              background: filter === key ? '#2563eb' : '#ffffff',
              color: filter === key ? '#ffffff' : '#475569',
              boxShadow: filter === key ? '0 4px 12px rgba(37,99,235,0.28)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
              background: filter === key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              color: filter === key ? '#ffffff' : '#64748b',
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr 110px 100px 90px', gap: 0 }}>
          {['Name', 'Email', 'Course', 'Status', 'Date', 'Actions'].map((col) => (
            <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '72px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>No candidates found.</p>
          </div>
        ) : (
          <div>
            {filtered.map((c, idx) => (
              <div
                key={c.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr 110px 100px 90px',
                  alignItems: 'center', padding: '18px 24px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                  transition: 'background 0.12s',
                }}


              >
                {/* Name */}
                <div style={{ paddingRight: 16, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  {(c.city || c.gender) && (
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {[c.city, c.gender].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div style={{ paddingRight: 16, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.email}</span>
                </div>

                {/* Course */}
                <div style={{ paddingRight: 16, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textTransform: 'capitalize' }}>
                    {c.courseSelect || '—'}
                  </span>
                </div>

                {/* Status */}
                <div>
                  {c.acceptSignin === 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                      <Clock style={{ width: 11, height: 11 }} />
                      Pending
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                      <CheckCircle style={{ width: 11, height: 11 }} />
                      Approved
                    </span>
                  )}
                </div>

                {/* Date */}
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    title="Edit Candidate Profile"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ecf0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', transition: 'all 0.15s' }}
                  >
                    <Pencil style={{ width: 13, height: 13 }} />
                  </button>
                  {c.acceptSignin === 0 && (
                    <button
                      onClick={() => handleApprove(c.id)}
                      title="Approve"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                    >
                      <CheckCircle style={{ width: 13, height: 13 }} />
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(c.id)}
                    title="Remove"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                  >
                    <XCircle style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Showing {filtered.length} of {candidates.length} candidates
            </span>
          </div>
        )}
      </div>

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => {
            if (!savingEdit) setEditingCandidate(null)
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                  }}
                >
                  <Pencil style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Edit Candidate Profile
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                    Candidate #{editingCandidate.id} • Updates sync to student portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                disabled={savingEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Mobile / Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone number"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="e.g. Pune, Gadag"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                      background: '#fff',
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Course Selection
                  </label>
                  <input
                    type="text"
                    value={editForm.courseSelect}
                    onChange={(e) => setEditForm({ ...editForm, courseSelect: e.target.value })}
                    placeholder="e.g. End-to-End Recruitment"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Street / Area / Address"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', display: 'block' }}>Approval Status</span>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                    {editForm.acceptSignin === 1 ? 'Approved (can sign in to portal)' : 'Pending (sign in not yet approved)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, acceptSignin: editForm.acceptSignin === 1 ? 0 : 1 })}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: editForm.acceptSignin === 1 ? '#dcfce7' : '#fef3c7',
                    color: editForm.acceptSignin === 1 ? '#15803d' : '#b45309',
                  }}
                >
                  {editForm.acceptSignin === 1 ? 'Approved' : 'Pending'}
                </button>
              </div>

              {/* Reset Password */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock style={{ width: 13, height: 13, color: '#64748b' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Reset Password (Optional)</span>
                </div>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep existing password"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  disabled={savingEdit}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={{
                    flex: 1.5,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    cursor: savingEdit ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {savingEdit ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Check style={{ width: 14, height: 14 }} />}
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
