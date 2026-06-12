'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Mail, Phone, CalendarDays } from 'lucide-react'

type Row = {
  id: number
  name: string
  email: string
  contact?: string | null
  mobile?: string | null
  isActive: boolean
  createdAt: string | Date
}

export default function EntityAdminTable({
  rows: initialRows,
  endpoint,
  entityLabel,
}: {
  rows: Row[]
  endpoint: string
  entityLabel: string
}) {
  const [rows, setRows] = useState(initialRows)

  const toggle = async (id: number, isActive: boolean) => {
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive }),
    })
    const data = await res.json()
    if (data.success) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive } : r)))
      toast.success(`${entityLabel} updated`)
    } else {
      toast.error(data.message || 'Update failed')
    }
  }

  if (rows.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #e8ecf0', borderRadius: 20, padding: '72px 32px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Users style={{ width: 22, height: 22, color: '#cbd5e1' }} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>No {entityLabel.toLowerCase()} records found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

      {/* Table header panel */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{entityLabel} Directory</p>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Name, contact details, status, and actions</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#fff', border: '1px solid #e8ecf0', color: '#64748b' }}>
          {rows.length} records
        </span>
      </div>

      {/* Column headers */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc', display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr 110px 110px 120px' }}>
        {['Name', 'Email', 'Contact', 'Status', 'Joined', 'Actions'].map((col) => (
          <span key={col} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, idx) => (
          <div
            key={row.id}
            style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 1fr 110px 110px 120px',
              alignItems: 'center', padding: '18px 24px',
              borderBottom: idx < rows.length - 1 ? '1px solid #f8fafc' : 'none',
              transition: 'background 0.12s',
            }}


          >
            {/* Name */}
            <div style={{ paddingRight: 16, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{entityLabel} account</p>
            </div>

            {/* Email */}
            <div style={{ paddingRight: 16, minWidth: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                <Mail style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email}</span>
              </span>
            </div>

            {/* Contact */}
            <div style={{ paddingRight: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                <Phone style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                {row.contact || row.mobile || '—'}
              </span>
            </div>

            {/* Status */}
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                padding: '4px 10px', borderRadius: 100,
                ...(row.isActive
                  ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                  : { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }),
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.isActive ? '#22c55e' : '#f59e0b', flexShrink: 0 }} />
                {row.isActive ? 'Active' : 'Pending'}
              </span>
            </div>

            {/* Joined */}
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                <CalendarDays style={{ width: 12, height: 12, flexShrink: 0 }} />
                {new Date(row.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => toggle(row.id, !row.isActive)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  ...(row.isActive
                    ? { background: '#f1f5f9', color: '#374151' }
                    : { background: '#2563eb', color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }),
                }}


              >
                {row.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
