'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface Props {
  id: number
  status: string
}

export default function ReviewActions({ id, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleStatus(newStatus: 'approved' | 'rejected') {
    setLoading(newStatus)
    setError('')
    const res = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this review permanently?')) return
    setLoading('delete')
    setError('')
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error || 'Failed')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {status !== 'approved' && (
        <button
          onClick={() => handleStatus('approved')}
          disabled={!!loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
            background: loading === 'approved' ? '#d1fae5' : '#f0fdf4',
            color: '#059669', border: '1px solid #6ee7b7',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <CheckCircle style={{ width: 12, height: 12 }} />
          {loading === 'approved' ? '...' : 'Approve'}
        </button>
      )}
      {status !== 'rejected' && (
        <button
          onClick={() => handleStatus('rejected')}
          disabled={!!loading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
            background: loading === 'rejected' ? '#fee2e2' : '#fff7f7',
            color: '#dc2626', border: '1px solid #fca5a5',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <XCircle style={{ width: 12, height: 12 }} />
          {loading === 'rejected' ? '...' : 'Reject'}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={!!loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
          background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Trash2 style={{ width: 12, height: 12 }} />
        {loading === 'delete' ? '...' : 'Delete'}
      </button>
      {error && <span style={{ fontSize: 10, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}
