'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react'

interface Props {
  answerId: number
  isApproved: boolean
}

export default function AnswerActions({ answerId, isApproved }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(approve: boolean) {
    setLoading(approve ? 'approve' : 'reject')
    setError(null)
    try {
      const res = await fetch(`/api/admin/answers/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || `Error ${res.status}`)
        return
      }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this answer permanently?')) return
    setLoading('delete')
    setError(null)
    try {
      const res = await fetch(`/api/admin/answers/${answerId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || `Error ${res.status}`)
        return
      }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(null)
    }
  }

  const busy = loading !== null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!isApproved ? (
          <button
            onClick={() => toggle(true)}
            disabled={busy}
            title="Approve"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {loading === 'approve' ? <Loader2 style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 style={{ width: 11, height: 11 }} />}
            Approve
          </button>
        ) : (
          <button
            onClick={() => toggle(false)}
            disabled={busy}
            title="Revoke approval"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {loading === 'reject' ? <Loader2 style={{ width: 11, height: 11 }} /> : <XCircle style={{ width: 11, height: 11 }} />}
            Revoke
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={busy}
          title="Delete answer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
        >
          {loading === 'delete' ? <Loader2 style={{ width: 11, height: 11 }} /> : <Trash2 style={{ width: 11, height: 11 }} />}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>{error}</span>
      )}
    </div>
  )
}
