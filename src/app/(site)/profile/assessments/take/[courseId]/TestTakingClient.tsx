'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Flag, Clock, AlertCircle } from 'lucide-react'

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

export default function TestTakingClient({ courseId, courseTitle }: { courseId: number, courseTitle: string }) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [assessment, setAssessment] = useState<AssessmentSummary | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    async function loadTest() {
      try {
        const res = await fetch(`/api/assessment/course/${courseId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('No final assessment is configured for this course yet. Please contact your trainer.')
          }
          throw new Error('Failed to load assessment details.')
        }
        const json = await res.json()
        const data = json.data as AssessmentSummary
        setAssessment(data)
        setTimeLeft(data.duration_minutes * 60)

        // Now load questions
        const qRes = await fetch(`/api/assessment/${data.id}/start`)
        if (!qRes.ok) throw new Error('Failed to load assessment questions.')
        const qJson = await qRes.json()
        setQuestions(qJson.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadTest()
  }, [courseId])

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timerId)
    } else if (timeLeft === 0 && questions.length > 0 && !submitting) {
      // Auto submit when time runs out
      handleSubmit()
    }
  }, [timeLeft, submitting, questions.length])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  const handleSubmit = async () => {
    if (!assessment) return
    setSubmitting(true)
    try {
      const payload = {
        assessment_id: assessment.id,
        answers: Object.entries(answers).map(([qId, opt]) => ({
          question_id: parseInt(qId, 10),
          selected_option: opt
        }))
      }
      
      const res = await fetch(`/api/assessment/${assessment.id}/grade-and-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to submit assessment')
      
      const json = await res.json()
      // Redirect to the result page
      router.push(`/profile/assessments/${json.data.student_assessment_id}`)
    } catch (err: any) {
      alert(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" style={{ width: 40, height: 40, color: '#2563EB', marginBottom: 16 }} />
        <p style={{ color: '#64748B', fontWeight: 600 }}>Preparing your personalized assessment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: '#fff', padding: 40, borderRadius: 20, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <AlertCircle style={{ width: 48, height: 48, color: '#EF4444', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>Assessment Unavailable</h2>
        <p style={{ color: '#64748B', marginBottom: 24 }}>{error}</p>
        <button onClick={() => router.push('/profile')} style={{ padding: '10px 20px', background: '#F1F5F9', color: '#475569', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          Back to Profile
        </button>
      </div>
    )
  }

  if (!assessment || questions.length === 0) return null

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const isFirst = currentIndex === 0
  const answeredCount = Object.keys(answers).length

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{assessment.assessment_name}</h1>
          <p style={{ color: '#64748B', fontSize: 14 }}>{courseTitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '10px 20px', borderRadius: 100, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <Clock style={{ width: 18, height: 18, color: timeLeft < 300 ? '#EF4444' : '#2563EB' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: timeLeft < 300 ? '#EF4444' : '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Topic: {currentQuestion.topic_name}</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', lineHeight: 1.5, marginBottom: 32 }}>
            {currentQuestion.question_text}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['A', 'B', 'C', 'D'].map((optLetter) => {
              const optKey = `option_${optLetter.toLowerCase()}` as keyof Question
              const optText = currentQuestion[optKey] as string
              if (!optText) return null
              
              const isSelected = answers[currentQuestion.id] === optLetter
              
              return (
                <button
                  key={optLetter}
                  onClick={() => handleSelect(currentQuestion.id, optLetter)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, textAlign: 'left',
                    background: isSelected ? '#EFF6FF' : '#fff',
                    border: `2px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSelected ? '#3B82F6' : '#F1F5F9', color: isSelected ? '#fff' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                    {optLetter}
                  </div>
                  <span style={{ fontSize: 15, color: isSelected ? '#1E3A8A' : '#334155', fontWeight: 500, flex: 1 }}>{optText}</span>
                  {isSelected && <CheckCircle2 style={{ width: 20, height: 20, color: '#3B82F6' }} />}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, paddingTop: 32, borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
              disabled={isFirst}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', color: isFirst ? '#94A3B8' : '#0F172A', fontWeight: 600, cursor: isFirst ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft style={{ width: 18, height: 18 }} /> Previous
            </button>
            
            {!isLast ? (
              <button
                onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
              >
                Next <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #16A34A, #22C55E)', border: 'none', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
              >
                {submitting ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : <Flag style={{ width: 18, height: 18 }} />}
                Submit Assessment
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Questions</h3>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{answeredCount} / {questions.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    border: isCurrent ? '2px solid #2563EB' : (isAnswered ? '1px solid #3B82F6' : '1px solid #E2E8F0'),
                    background: isCurrent ? '#EFF6FF' : (isAnswered ? '#3B82F6' : '#F8FAFC'),
                    color: isCurrent ? '#1D4ED8' : (isAnswered ? '#fff' : '#64748B'),
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          
          <div style={{ marginTop: 32 }}>
             <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: answeredCount === questions.length ? '#16A34A' : '#F1F5F9', border: 'none', color: answeredCount === questions.length ? '#fff' : '#64748B', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : 'Submit Test'}
              </button>
          </div>
        </div>
      </div>
    </div>
  )
}
