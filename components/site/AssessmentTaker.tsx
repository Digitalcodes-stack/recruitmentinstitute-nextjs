'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ClipboardX, CheckCircle2 } from 'lucide-react'

interface QuestionRow {
  id: number
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

type LoadState = 'loading' | 'no-assessment' | 'ready' | 'submitting' | 'error'

const optionBtn = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
  border: active ? '2px solid #2563eb' : '1px solid #e2e8f0',
  background: active ? '#eff6ff' : '#fff',
  fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#1e40af' : '#334155',
})

export default function AssessmentTaker({ courseId }: { courseId: number }) {
  const router = useRouter()
  const [state, setState] = useState<LoadState>('loading')
  const [assessmentId, setAssessmentId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const courseRes = await fetch(`/api/student/assessment/by-course/${courseId}`)
        const courseData = await courseRes.json()
        if (!courseData.success || !courseData.data) {
          setState('no-assessment')
          return
        }
        const id = courseData.data.id
        setAssessmentId(id)

        const startRes = await fetch(`/api/student/assessment/${id}/start`)
        const startData = await startRes.json()
        if (!startData.success || !startData.data?.length) {
          setState('no-assessment')
          return
        }
        setQuestions(startData.data)
        setState('ready')
      } catch {
        setState('no-assessment')
      }
    }
    load()
  }, [courseId])

  function selectOption(questionId: number, option: 'A' | 'B' | 'C' | 'D') {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])

  async function handleSubmit() {
    if (!assessmentId || !allAnswered) return
    setState('submitting')
    setError('')
    try {
      const res = await fetch(`/api/student/assessment/${assessmentId}/grade-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([question_id, selected_option]) => ({ question_id: Number(question_id), selected_option })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Unable to submit assessment')
      router.push(`/profile/assessments/${data.data.student_assessment_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit assessment')
      setState('ready')
    }
  }

  if (state === 'loading') {
    return <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}><Loader2 style={{ width: 24, height: 24 }} /></div>
  }

  if (state === 'no-assessment') {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <ClipboardX style={{ width: 36, height: 36, color: '#94a3b8', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Assessment Available</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>An assessment hasn&apos;t been set up for this course yet. Check back soon.</p>
        <Link href={`/profile/courses/${courseId}`} style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
          ← Back to Course
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Assessment</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>Answer All Questions</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>Your AI-analyzed results, personalized notes, and study plan will be generated after you submit.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {questions.map((q, idx) => (
          <div key={q.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{q.topic_name}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{idx + 1}. {q.question_text}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]] as const).map(([opt, text]) => (
                <div key={opt} onClick={() => selectOption(q.id, opt)} style={optionBtn(answers[q.id] === opt)}>
                  {answers[q.id] === opt ? <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }} /> : <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1', flexShrink: 0 }} />}
                  <span>{opt}) {text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p style={{ fontSize: 13, color: '#dc2626', marginTop: 16 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || state === 'submitting'}
        style={{
          marginTop: 24, width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700,
          cursor: allAnswered && state !== 'submitting' ? 'pointer' : 'not-allowed',
          background: allAnswered ? 'linear-gradient(135deg,#1d4ed8,#2563eb)' : '#e2e8f0',
          color: allAnswered ? '#fff' : '#94a3b8',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {state === 'submitting' ? <Loader2 style={{ width: 16, height: 16 }} /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
        {state === 'submitting' ? 'Submitting...' : allAnswered ? 'Submit Assessment' : `Answer all ${questions.length} questions to submit`}
      </button>
    </div>
  )
}
