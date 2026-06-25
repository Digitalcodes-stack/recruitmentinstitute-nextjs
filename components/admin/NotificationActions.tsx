'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Ban, RotateCcw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationActions({ id, status }: { id: number; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function run(action: string, url: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    setLoading(action)
    try {
      const res = await fetch(url, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Action failed')
        return
      }
      toast.success('Done')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  const btnStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
    borderRadius: 8, fontSize: 11.5, fontWeight: 600, border: '1px solid #e2e8f0',
    background: '#fff', color, cursor: 'pointer',
  })

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {(status === 'DRAFT' || status === 'SCHEDULED') && (
        <button onClick={() => run('send', `/api/admin/notifications/${id}/send`)} disabled={!!loading} style={btnStyle('#2563eb')}>
          {loading === 'send' ? <Loader2 style={{ width: 11, height: 11 }} /> : <Send style={{ width: 11, height: 11 }} />}
          Send Now
        </button>
      )}
      {(status === 'DRAFT' || status === 'SCHEDULED') && (
        <button onClick={() => run('cancel', `/api/admin/notifications/${id}/cancel`, 'Cancel this notification?')} disabled={!!loading} style={btnStyle('#dc2626')}>
          {loading === 'cancel' ? <Loader2 style={{ width: 11, height: 11 }} /> : <Ban style={{ width: 11, height: 11 }} />}
          Cancel
        </button>
      )}
      {(status === 'FAILED' || status === 'PARTIALLY_FAILED') && (
        <button onClick={() => run('retry', `/api/admin/notifications/${id}/retry`)} disabled={!!loading} style={btnStyle('#b45309')}>
          {loading === 'retry' ? <Loader2 style={{ width: 11, height: 11 }} /> : <RotateCcw style={{ width: 11, height: 11 }} />}
          Retry Failed
        </button>
      )}
    </div>
  )
}
