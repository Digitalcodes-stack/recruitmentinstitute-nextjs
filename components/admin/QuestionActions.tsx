'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function QuestionActions({ questionId }: { questionId: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this question and all its answers?')) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/questions/${questionId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title="Delete question"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
    >
      {deleting ? <Loader2 style={{ width: 11, height: 11 }} /> : <Trash2 style={{ width: 11, height: 11 }} />}
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  )
}
