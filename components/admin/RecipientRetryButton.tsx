'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RecipientRetryButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function retry() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/notifications/recipients/${id}/retry`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Retry failed')
        return
      }
      toast.success('Queued for retry')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={retry}
      disabled={loading}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid #e2e8f0', background: '#fff', color: '#b45309', cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? <Loader2 style={{ width: 10, height: 10 }} /> : <RotateCcw style={{ width: 10, height: 10 }} />}
      Retry
    </button>
  )
}
