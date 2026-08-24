'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

export default function GenerateAssessmentButton({ courseId, courseTitle }: { courseId: number; courseTitle: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          name: `${courseTitle} Assessment`,
          question_types: ['mcq'],
          question_count: 10,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Generation failed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: loading ? '#93c5fd' : '#2563eb', color: '#ffffff',
          border: 'none', borderRadius: 20, padding: '7px 16px',
          fontSize: 12, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {loading ? 'Generating…' : 'Generate Assessment'}
      </button>
      {error && <p style={{ fontSize: 11, color: '#dc2626', maxWidth: 220, textAlign: 'right' }}>{error}</p>}
    </div>
  )
}
