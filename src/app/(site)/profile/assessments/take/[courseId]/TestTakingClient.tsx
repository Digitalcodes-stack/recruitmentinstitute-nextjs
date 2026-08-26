'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Flag, Clock, AlertCircle, Sparkles } from 'lucide-react'

interface Question {
  id: number
  topic_name: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface AssessmentSummary {
  id: number
  assessment_name: string
  total_marks: number
  duration_minutes: number
}

type LoadState = 'generating' | 'ready' | 'error'

const MAX_POLL = 60        // 60 × 5s = 5 minutes max
const POLL_INTERVAL = 5000 // 5 seconds between attempts

export default function TestTakingClient({ courseId, courseTitle }: { courseId: number, courseTitle: string }) {
  const router = useRouter()

  const [loadState, setLoadState]     = useState<LoadState>('generating')
  const [pollCount, setPollCount]     = useState(0)
  const [error, setError]             = useState<string | null>(null)

  const [assessment, setAssessment]   = useState<AssessmentSummary | null>(null)
  const [questions, setQuestions]     = useState<Question[]>([])

  const [answers, setAnswers]         = useState<Record<number, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting]   = useState(false)
  const [timeLeft, setTimeLeft]       = useState(0)

  const cancelledRef = useRef(false)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Polling loop ─────────────────────────────────── */
  useEffect(() => {
    cancelledRef.current = false

    async function tryLoad(): Promise<boolean> {
      try {
        // Step 1 – get (or trigger generation of) the assessment for this course
        const res = await fetch(`/api/assessment/course/${courseId}`)
        if (!res.ok) return false
        const json = await res.json()
        const data = (json && (json.data ?? json)) as AssessmentSummary
        if (!data?.id) return false

        // Step 2 – fetch the question bank (fails with 404 if still generating)
        const qRes = await fetch(`/api/assessment/${data.id}/start`)
        if (!qRes.ok) return false
        const qJson = await qRes.json()
        const qList = (qJson && (qJson.data ?? qJson)) as Question[]
        if (!Array.isArray(qList) || !qList.length) return false

        if (!cancelledRef.current) {
          setAssessment(data)
          setQuestions(qList)
          setTimeLeft((data.duration_minutes || 30) * 60)
          setLoadState('ready')
        }
        return true
      } catch {
        return false
      }
    }

    // First attempt immediately
    tryLoad().then((ok) => {
      if (ok || cancelledRef.current) return

      // Poll until questions are ready
      let attempts = 1
      timerRef.current = setInterval(async () => {
        if (cancelledRef.current) { clearInterval(timerRef.current!); return }
        attempts++
        setPollCount(attempts)
        const ready = await tryLoad()
        if (ready) { clearInterval(timerRef.current!); return }
        if (attempts >= MAX_POLL) {
          clearInterval(timerRef.current!)
          if (!cancelledRef.current) {
            setError('Assessment generation is taking longer than expected. Please refresh the page to try again.')
            setLoadState('error')
          }
        }
      }, POLL_INTERVAL)
    })

    return () => {
      cancelledRef.current = true
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [courseId])

  /* ── Countdown timer ──────────────────────────────── */
  useEffect(() => {
    if (loadState !== 'ready' || timeLeft <= 0 || submitting) return
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [loadState, timeLeft, submitting])

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !submitting && loadState === 'ready') {
      handleSubmit()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const handleSelect = (qId: number, option: string) =>
    setAnswers((prev) => ({ ...prev, [qId]: option }))

  const handleSubmit = async () => {
    if (!assessment) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/assessment/${assessment.id}/grade-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessment.id,
          answers: Object.entries(answers).map(([qId, opt]) => ({
            question_id: parseInt(qId, 10),
            selected_option: opt,
          })),
        }),
      })
      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.message || 'Failed to submit assessment')
      }
      const json = await res.json()

      const studentAssessmentId = json?.data?.student_assessment_id ?? json?.student_assessment_id
      if (!studentAssessmentId) throw new Error('Could not determine submission ID')
      router.push(`/profile/assessments/${studentAssessmentId}`)
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment')
      setSubmitting(false)
    }
  }

  /* ── Generating ───────────────────────────────────── */
  if (loadState === 'generating') {
    const progressPct = Math.min((pollCount / MAX_POLL) * 100 + 5, 90)
    const elapsed = pollCount * (POLL_INTERVAL / 1000)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <Sparkles style={{ width: 36, height: 36, color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
          Generating Your Personalised Assessment…
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 8, maxWidth: 480 }}>
          Our AI is reading the <strong>{courseTitle}</strong> curriculum and crafting{' '}
          <strong>25–50 custom questions</strong> based on the syllabus topics.
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32 }}>
          This usually takes <strong>20–60 seconds</strong> for the first attempt.
        </p>
        <div style={{ width: '100%', maxWidth: 420, height: 10, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden', marginBottom: 14 }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            width: `${progressPct}%`,
            transition: 'width 5s ease',
          }} />
        </div>
        {elapsed > 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            {elapsed}s elapsed · checking every 5 seconds…
          </p>
        )}
        <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 8 }}>Please don&apos;t close this page</p>
        <style>{`
          @keyframes pulse { 0%,100% { transform:scale(1);opacity:1; } 50% { transform:scale(1.08);opacity:0.85; } }
        `}</style>
      </div>
    )
  }

  /* ── Error ────────────────────────────────────────── */
  if (loadState === 'error') {
    return (
      <div style={{ background: '#fff', padding: 48, borderRadius: 20, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: 560, margin: '0 auto' }}>
        <AlertCircle style={{ width: 48, height: 48, color: '#ef4444', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Assessment Unavailable</h2>
        <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => { setLoadState('generating'); setPollCount(0); setError(null) }}
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
          <button onClick={() => router.push('/profile')}
            style={{ padding: '10px 22px', background: '#f1f5f9', color: '#475569', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  /* ── Quiz ─────────────────────────────────────────── */
  if (!assessment || questions.length === 0) return null

  const currentQuestion = questions[currentIndex]
  const isLast          = currentIndex === questions.length - 1
  const isFirst         = currentIndex === 0
  const answeredCount   = Object.keys(answers).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{assessment.assessment_name}</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{courseTitle} · {questions.length} questions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '10px 20px', borderRadius: 100, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Clock style={{ width: 18, height: 18, color: timeLeft < 300 ? '#ef4444' : '#2563eb' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: timeLeft < 300 ? '#ef4444' : '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Question panel */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Topic: {currentQuestion.topic_name}</span>
          </div>

          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: 28 }}>
            {currentQuestion.question_text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const text = currentQuestion[`option_${opt.toLowerCase()}` as keyof Question] as string
              if (!text) return null
              const isSelected = answers[currentQuestion.id] === opt
              return (
                <button key={opt} onClick={() => handleSelect(currentQuestion.id, opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, textAlign: 'left',
                    background: isSelected ? '#eff6ff' : '#fff',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: isSelected ? '#3b82f6' : '#f1f5f9', color: isSelected ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                    {opt}
                  </div>
                  <span style={{ fontSize: 15, color: isSelected ? '#1e3a8a' : '#334155', fontWeight: 500, flex: 1 }}>{text}</span>
                  {isSelected && <CheckCircle2 style={{ width: 20, height: 20, color: '#3b82f6', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
            <button onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))} disabled={isFirst}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', color: isFirst ? '#94a3b8' : '#0f172a', fontWeight: 600, cursor: isFirst ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft style={{ width: 18, height: 18 }} /> Previous
            </button>
            {!isLast ? (
              <button onClick={() => setCurrentIndex((c) => Math.min(questions.length - 1, c + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                Next <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                {submitting ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <Flag style={{ width: 18, height: 18 }} />}
                Submit Assessment
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Questions</h3>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{answeredCount} / {questions.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isCurrent  = idx === currentIndex
              return (
                <button key={q.id} onClick={() => setCurrentIndex(idx)}
                  style={{
                    aspectRatio: '1', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    border: isCurrent ? '2px solid #2563eb' : isAnswered ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isCurrent ? '#eff6ff' : isAnswered ? '#3b82f6' : '#f8fafc',
                    color: isCurrent ? '#1d4ed8' : isAnswered ? '#fff' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 32 }}>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: answeredCount === questions.length ? '#16a34a' : '#f1f5f9', border: 'none', color: answeredCount === questions.length ? '#fff' : '#64748b', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
