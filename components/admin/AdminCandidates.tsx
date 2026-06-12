'use client'

import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
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

    </AdminLayout>
  )
}
