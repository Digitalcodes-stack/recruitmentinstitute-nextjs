'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

type Props = {
  batchId: number
  disabled?: boolean
  disabledLabel?: string
  onSuccess?: () => void
}

export default function EnrollButton({ batchId, disabled, disabledLabel = 'Enrollment unavailable', onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  async function handleEnroll() {
    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const res = await fetch('/api/student/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Unable to submit enrollment request')
      }

      setStatus('success')
      setMessage('Request submitted. Pending admin approval.')
      onSuccess?.()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to submit enrollment request')
    } finally {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontSize: 13, fontWeight: 700 }}
      >
        {disabledLabel}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          background: loading ? '#93c5fd' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <CheckCircle2 style={{ width: 14, height: 14 }} />}
        {loading ? 'Submitting...' : 'Enroll Now'}
      </button>
      {message ? (
        <p style={{ fontSize: 12, fontWeight: 600, color: status === 'error' ? '#dc2626' : '#059669' }}>{message}</p>
      ) : null}
    </div>
  )
}
