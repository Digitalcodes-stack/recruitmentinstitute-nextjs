'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'

interface Props {
  assignmentId: number
  submissionId: number
  initialScore: number | null
  initialFeedback: string | null
}

export default function SubmissionGradeForm({ assignmentId, submissionId, initialScore, initialFeedback }: Props) {
  const router = useRouter()
  const [score, setScore] = useState(initialScore !== null ? String(initialScore) : '')
  const [feedback, setFeedback] = useState(initialFeedback ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (score === '' || isNaN(Number(score))) { setError('Enter a valid score'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(score), feedback: feedback || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Could not save grade'); return }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8, fontSize: 12.5, border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a', background: '#fff',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number" min={0} max={100} step="0.5" placeholder="Score"
          value={score} onChange={(e) => setScore(e.target.value)}
          style={{ ...inputStyle, width: 70 }}
        />
        <span style={{ fontSize: 11, color: '#94a3b8' }}>/ 100</span>
      </div>
      <textarea
        placeholder="Feedback (optional)" rows={2} value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
      />
      {error && <p style={{ fontSize: 11, color: '#ef4444' }}>{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
          background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669',
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? <Loader2 style={{ width: 12, height: 12 }} /> : <Check style={{ width: 12, height: 12 }} />}
        {initialScore !== null ? 'Update Grade' : 'Save Grade'}
      </button>
    </div>
  )
}
