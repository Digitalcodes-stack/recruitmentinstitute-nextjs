'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Loader2, Eye } from 'lucide-react'

export default function BatchActions({ id }: { id: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this batch? Enrollments and sessions tied to it must be removed first.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.message || 'Could not delete batch')
        return
      }
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <Link
        href={`/admin/batches/${id}`}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }}
      >
        <Eye style={{ width: 13, height: 13 }} />
      </Link>
      <Link
        href={`/admin/batches/${id}/edit`}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
      >
        <Pencil style={{ width: 13, height: 13 }} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
      >
        {deleting ? <Loader2 style={{ width: 13, height: 13 }} /> : <Trash2 style={{ width: 13, height: 13 }} />}
      </button>
    </div>
  )
}
