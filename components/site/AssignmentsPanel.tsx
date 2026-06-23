'use client'

import { useState } from 'react'
import { Paperclip, Upload, Loader2, CheckCircle2, Clock } from 'lucide-react'

interface Submission {
  id: number
  fileUrl: string
  note: string | null
  submittedAt: string | Date
  score: string | number | null
  feedback: string | null
}

interface AssignmentRow {
  id: number
  title: string
  description: string | null
  fileUrl: string | null
  dueAt: string | Date
  batch: { name: string; course: { title: string } }
  submissions: Submission[]
}

interface Props {
  assignments: AssignmentRow[]
}

function SubmitForm({ assignmentId, onSubmitted }: { assignmentId: number; onSubmitted: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!file) { setError('Choose a file to upload'); return }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/student/upload', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setError(uploadData.message || 'Upload failed'); return }

      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: uploadData.url, note: note || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Could not submit'); return }
      onSubmitted()
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ fontSize: 12.5 }}
      />
      <textarea
        placeholder="Add a note (optional)" rows={2} value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12.5, border: '1px solid #e2e8f0', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
      />
      {error && <p style={{ fontSize: 11, color: '#ef4444' }}>{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, alignSelf: 'flex-start',
          padding: '7px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
          background: '#2563eb', color: '#fff', border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? <Loader2 style={{ width: 12, height: 12 }} /> : <Upload style={{ width: 12, height: 12 }} />}
        {saving ? 'Submitting…' : 'Submit Assignment'}
      </button>
    </div>
  )
}

export default function AssignmentsPanel({ assignments }: Props) {
  const [items, setItems] = useState(assignments)

  if (items.length === 0) return null

  const now = new Date()

  async function refresh() {
    const res = await fetch('/api/student/assignments')
    const data = await res.json()
    if (data.success) setItems(data.data)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((a) => {
        const submission = a.submissions[0]
        const overdue = !submission && new Date(a.dueAt) < now

        return (
          <div key={a.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>{a.title}</h4>
                <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  {a.batch.name} · {a.batch.course.title}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                background: overdue ? '#fef2f2' : '#eff6ff', color: overdue ? '#dc2626' : '#2563eb',
                border: `1px solid ${overdue ? '#fecaca' : '#bfdbfe'}`,
              }}>
                Due {new Date(a.dueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>

            {a.description && <p style={{ fontSize: 13, color: '#475569', marginTop: 10, lineHeight: 1.6 }}>{a.description}</p>}
            {a.fileUrl && (
              <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2563eb', marginTop: 8 }}>
                <Paperclip style={{ width: 11, height: 11 }} /> View attachment
              </a>
            )}

            {submission ? (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                <p style={{ fontSize: 12, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 style={{ width: 12, height: 12 }} /> Submitted {new Date(submission.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', marginTop: 4, display: 'inline-block' }}>
                  View my submission
                </a>
                {submission.score !== null && (
                  <p style={{ fontSize: 12, color: '#0f172a', marginTop: 6, fontWeight: 600 }}>
                    Score: {submission.score}/100{submission.feedback ? ` — ${submission.feedback}` : ''}
                  </p>
                )}
              </div>
            ) : (
              <>
                {overdue && (
                  <p style={{ fontSize: 11.5, color: '#dc2626', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 11, height: 11 }} /> Deadline passed — submission is overdue
                  </p>
                )}
                <SubmitForm assignmentId={a.id} onSubmitted={refresh} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
