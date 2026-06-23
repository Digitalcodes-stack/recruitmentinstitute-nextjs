'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

export default function TrainerActions({ id }: { id: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this trainer? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/trainers/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      <Link
        href={`/admin/trainers/${id}/edit`}
        style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none',
        }}
      >
        <Pencil style={{ width: 12, height: 12 }} /> Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
        }}
      >
        {deleting ? <Loader2 style={{ width: 12, height: 12 }} /> : <Trash2 style={{ width: 12, height: 12 }} />}
        {deleting ? '…' : 'Delete'}
      </button>
    </div>
  )
}
