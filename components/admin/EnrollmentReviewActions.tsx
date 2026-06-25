'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ThumbsUp, Ban, PauseCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type ReviewStatus = 'APPROVED' | 'REJECTED' | 'ON_HOLD'

export default function EnrollmentReviewActions({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState<ReviewStatus | null>(null)

  async function updateStatus(status: ReviewStatus) {
    setLoading(status)
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNote:
            status === 'APPROVED' ? 'Approved from admin review panel'
            : status === 'REJECTED' ? 'Enrollment request rejected'
            : 'Enrollment placed on hold',
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Could not update enrollment')
      }

      toast.success(`Enrollment ${status.toLowerCase().replace('_', ' ')}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update enrollment')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={() => updateStatus('APPROVED')}
        disabled={loading !== null}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#059669', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}
      >
        {loading === 'APPROVED' ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <ThumbsUp style={{ width: 13, height: 13 }} />}
        Approve
      </button>
      <button
        onClick={() => updateStatus('ON_HOLD')}
        disabled={loading !== null}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}
      >
        {loading === 'ON_HOLD' ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <PauseCircle style={{ width: 13, height: 13 }} />}
        Hold
      </button>
      <button
        onClick={() => updateStatus('REJECTED')}
        disabled={loading !== null}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1 }}
      >
        {loading === 'REJECTED' ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Ban style={{ width: 13, height: 13 }} />}
        Reject
      </button>
    </div>
  )
}
