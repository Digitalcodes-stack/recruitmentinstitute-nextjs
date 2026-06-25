'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, ClipboardCheck } from 'lucide-react'

interface AssessmentRow {
  id: number
  course_id: number
  assessment_name: string
  total_marks: number
  duration_minutes: number
}

interface QuestionRow {
  id: number
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
}

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed')
  return data.data
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0', outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff' }

export default function AssessmentBuilder({ courseId }: { courseId: number }) {
  const [assessment, setAssessment] = useState<AssessmentRow | null | undefined>(undefined)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ assessmentName: '', totalMarks: 100, durationMinutes: 30 })
  const [qForm, setQForm] = useState({
    topic_name: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
  })

  async function loadAssessment() {
    const data = await api(`/api/admin/courses/${courseId}/assessment`, 'GET')
    setAssessment(data)
    if (data) {
      const q = await api(`/api/admin/assessment/${data.id}/questions`, 'GET')
      setQuestions(q)
    }
  }

  useEffect(() => { loadAssessment() }, [courseId])

  async function handleCreateAssessment() {
    if (!form.assessmentName.trim()) return
    setBusy(true)
    setError('')
    try {
      await api(`/api/admin/courses/${courseId}/assessment`, 'POST', form)
      await loadAssessment()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create assessment')
    } finally {
      setBusy(false)
    }
  }

  async function handleAddQuestion() {
    if (!assessment) return
    if (!qForm.topic_name.trim() || !qForm.question_text.trim() || !qForm.option_a.trim() || !qForm.option_b.trim() || !qForm.option_c.trim() || !qForm.option_d.trim()) {
      setError('All question fields are required')
      return
    }
    setBusy(true)
    setError('')
    try {
      await api(`/api/admin/assessment/${assessment.id}/questions`, 'POST', qForm)
      setQForm({ topic_name: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' })
      await loadAssessment()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add question')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!assessment) return
    if (!confirm('Delete this question?')) return
    await api(`/api/admin/assessment/${assessment.id}/questions/${questionId}`, 'DELETE')
    await loadAssessment()
  }

  if (assessment === undefined) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}><Loader2 style={{ width: 20, height: 20 }} /></div>
  }

  if (assessment === null) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: 28, maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ClipboardCheck style={{ width: 18, height: 18, color: '#2563eb' }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Assessment</h3>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>No assessment exists for this course yet. Create one to start adding questions.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Assessment Name</label>
            <input style={inputStyle} value={form.assessmentName} onChange={(e) => setForm({ ...form, assessmentName: e.target.value })} placeholder="e.g. HR Recruitment Final Test" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Total Marks</label>
              <input type="number" style={inputStyle} value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Duration (minutes)</label>
              <input type="number" style={inputStyle} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
          <button onClick={handleCreateAssessment} disabled={busy} style={btnPrimary}>
            {busy ? <Loader2 style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />}
            Create Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{assessment.assessment_name}</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{assessment.total_marks} marks · {assessment.duration_minutes} min · {questions.length} question{questions.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Add Question</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Topic Name</label>
              <input style={inputStyle} value={qForm.topic_name} onChange={(e) => setQForm({ ...qForm, topic_name: e.target.value })} placeholder="e.g. Recruitment Lifecycle" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Question Text</label>
            <input style={inputStyle} value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, idx) => (
              <div key={key}>
                <label style={labelStyle}>Option {String.fromCharCode(65 + idx)}</label>
                <input style={inputStyle} value={qForm[key]} onChange={(e) => setQForm({ ...qForm, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div>
            <label style={labelStyle}>Correct Option</label>
            <select style={inputStyle} value={qForm.correct_option} onChange={(e) => setQForm({ ...qForm, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          {error && <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>}
          <button onClick={handleAddQuestion} disabled={busy} style={{ ...btnPrimary, alignSelf: 'flex-start' }}>
            {busy ? <Loader2 style={{ width: 14, height: 14 }} /> : <Plus style={{ width: 14, height: 14 }} />}
            Add Question
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map((q, idx) => (
          <div key={q.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{q.topic_name}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{idx + 1}. {q.question_text}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>
                A) {q.option_a}  B) {q.option_b}  C) {q.option_c}  D) {q.option_d} — <strong style={{ color: '#059669' }}>Correct: {q.correct_option}</strong>
              </p>
            </div>
            <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
              <Trash2 style={{ width: 15, height: 15 }} />
            </button>
          </div>
        ))}
        {questions.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 20 }}>No questions added yet.</p>}
      </div>
    </div>
  )
}
