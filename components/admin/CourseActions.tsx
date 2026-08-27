'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, Loader2, GraduationCap, ClipboardCheck, Zap } from 'lucide-react'

export default function CourseActions({ id }: { id: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)

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

  async function handleGenerateNextBatch() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}/generate-next-batch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message || 'Could not generate the next batch.')
        return
      }
      alert(`Batch "${data.data.batchName}" created — trainer ${data.data.trainerName} assigned, ${data.data.sessionsCreated} sessions scheduled starting ${data.data.startDate}.`)
      router.push(`/admin/batches/${data.data.batchId}`)
      router.refresh()
    } catch {
      alert('Network error — please try again')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
      <Link href={`/admin/courses/${id}/curriculum`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none' }}>
        <GraduationCap style={{ width: 11, height: 11 }} /> Curriculum
      </Link>
      <Link href={`/admin/courses/${id}/assessment`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#7c3aed', textDecoration: 'none' }}>
        <ClipboardCheck style={{ width: 11, height: 11 }} /> Assessment
      </Link>
      <button onClick={handleGenerateNextBatch} disabled={generating} title="Auto-create the next batch and assign the best available trainer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.6 : 1 }}>
        {generating ? <Loader2 style={{ width: 11, height: 11 }} /> : <Zap style={{ width: 11, height: 11 }} />}
        {generating ? 'Generating…' : 'Generate Next Batch'}
      </button>
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
