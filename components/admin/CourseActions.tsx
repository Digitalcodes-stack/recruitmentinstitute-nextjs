'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

export default function CourseActions({ id }: { id: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this course? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
      <Link href={`/admin/courses/${id}/edit`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none' }}>
        <Pencil style={{ width: 11, height: 11 }} /> Edit
      </Link>
      <button onClick={handleDelete} disabled={deleting}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
        {deleting ? <Loader2 style={{ width: 11, height: 11 }} /> : <Trash2 style={{ width: 11, height: 11 }} />}
        {deleting ? '…' : 'Delete'}
      </button>
    </div>
  )
}
