import AdminLayout from '@/components/admin/AdminLayout'
import GenerateAssessmentButton from '@/components/admin/GenerateAssessmentButton'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FastApiError } from '@/lib/fastapiClient'
import { getAssessmentByCourseAdmin, listQuestions, type QuestionBankItem } from '@/lib/fastapiAdminClient'
import type { AssessmentSummary } from '@/lib/fastapiClient'
import { ListChecks, Clock, Award, AlertCircle } from 'lucide-react'

/* ── Design tokens (mirrors AdminDashboard) ─────────────────── */

const C = {
  white:      '#ffffff',
  border:     '#e6eaf0',
  borderSoft: '#f0f3f7',
  text:       '#0f172a',
  textMid:    '#475569',
  textSoft:   '#94a3b8',
  shadow:     '0 1px 4px rgba(15,23,42,0.07)',
  radius:     16,
  radiusSm:   10,
}

type CourseAssessment = {
  courseId: number
  courseTitle: string
  assessment: AssessmentSummary | null
  questions: QuestionBankItem[]
}

async function loadCourseAssessment(courseId: number, courseTitle: string): Promise<CourseAssessment> {
  try {
    const assessment = await getAssessmentByCourseAdmin(courseId)
    const questions = await listQuestions(assessment.id).catch(() => [])
    return { courseId, courseTitle, assessment, questions }
  } catch (err) {
    if (err instanceof FastApiError) {
      return { courseId, courseTitle, assessment: null, questions: [] }
    }
    throw err
  }
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: C.white, borderRadius: C.radius,
      border: `1px solid ${C.border}`, boxShadow: C.shadow,
    }}>
      {children}
    </div>
  )
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

export default async function AdminAssessmentsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const courses = await prisma.course.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  const courseAssessments = await Promise.all(
    courses.map((c) => loadCourseAssessment(c.id, c.title))
  )

  const withAssessment = courseAssessments.filter((c) => c.assessment)
  const withoutAssessment = courseAssessments.filter((c) => !c.assessment)
  const totalQuestions = courseAssessments.reduce((sum, c) => sum + c.questions.length, 0)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <AdminLayout title="Assessments">
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Hero ─────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(130deg,#0c1a2e 0%,#13305c 50%,#1a4fac 100%)',
          boxShadow: '0 20px 56px rgba(15,23,42,0.22)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: -60, top: -60,
            width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(96,165,250,0.18),transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: 32,
            padding: '44px 52px',
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(96,165,250,0.14)',
                border: '1px solid rgba(96,165,250,0.22)',
                borderRadius: 24, padding: '4px 14px',
                fontSize: 10, fontWeight: 800,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#93c5fd',
              }}>
                Assessment Question Bank
              </span>
              <h1 style={{
                marginTop: 16,
                fontSize: 38, fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                Course Assessments
              </h1>
              <p style={{
                marginTop: 12, maxWidth: 520,
                fontSize: 14, lineHeight: 1.8, color: '#94b8d8',
              }}>
                Duration, total marks, and the full question-and-answer bank for every course&apos;s assessment.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: withoutAssessment.length > 0 ? 'rgba(248,113,113,0.13)' : 'rgba(34,197,94,0.13)',
                border: `1px solid ${withoutAssessment.length > 0 ? 'rgba(248,113,113,0.25)' : 'rgba(34,197,94,0.25)'}`,
                borderRadius: 24, padding: '8px 18px',
              }}>
                <AlertCircle size={13} color={withoutAssessment.length > 0 ? '#fca5a5' : '#4ade80'} />
                <span style={{ fontSize: 12, fontWeight: 600, color: withoutAssessment.length > 0 ? '#fecaca' : '#86efac' }}>
                  {withoutAssessment.length > 0 ? `${withoutAssessment.length} course${withoutAssessment.length > 1 ? 's' : ''} without an assessment` : 'Every course has an assessment'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#5a7a99' }}>{today}</p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ───────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 18,
        }}>
          {[
            { label: 'Total Courses', value: String(courses.length), sub: 'In catalog', icon: ListChecks, bg: '#eff6ff', color: '#2563eb' },
            { label: 'With Assessment', value: String(withAssessment.length), sub: 'Ready for students', icon: Award, bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Without Assessment', value: String(withoutAssessment.length), sub: 'Needs setup', icon: AlertCircle, bg: '#fff7ed', color: '#ea580c' },
            { label: 'Total Questions', value: String(totalQuestions), sub: 'Across all courses', icon: Clock, bg: '#faf5ff', color: '#7c3aed' },
          ].map((s) => (
            <div key={s.label} style={{
              borderRadius: C.radius,
              background: C.white, border: `1px solid ${C.border}`,
              boxShadow: C.shadow, padding: '26px 24px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textSoft }}>
                  {s.label}
                </p>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={18} color={s.color} />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: C.text }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 12, color: C.textSoft, marginTop: 8 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Per-course assessment panels ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {courseAssessments.map((c) => (
            <Card key={c.courseId}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                padding: '22px 28px 20px',
                borderBottom: `1px solid ${C.borderSoft}`,
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{c.courseTitle}</p>
                  {c.assessment ? (
                    <p style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>
                      {c.assessment.assessment_name} · {c.assessment.duration_minutes} min · {c.assessment.total_marks} marks
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>No assessment set up yet</p>
                  )}
                </div>
                {c.assessment ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#f0fdf4', color: '#15803d',
                    borderRadius: 20, padding: '5px 12px',
                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    {c.questions.length} question{c.questions.length === 1 ? '' : 's'}
                  </span>
                ) : (
                  <GenerateAssessmentButton courseId={c.courseId} courseTitle={c.courseTitle} />
                )}
              </div>

              {c.assessment && c.questions.length > 0 && (
                <div style={{ padding: '20px 28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {c.questions.map((q, idx) => (
                    <div key={q.id} style={{
                      borderRadius: C.radiusSm,
                      border: `1px solid ${C.borderSoft}`, background: '#fafbfd',
                      padding: '16px 18px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textSoft }}>
                          Q{idx + 1} · {q.topic_name}
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                          padding: '3px 9px', borderRadius: 12,
                          background: q.difficulty === 'hard' ? '#fef2f2' : q.difficulty === 'easy' ? '#f0fdf4' : '#fffbeb',
                          color: q.difficulty === 'hard' ? '#dc2626' : q.difficulty === 'easy' ? '#15803d' : '#b45309',
                        }}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{q.question_text}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                        {OPTION_KEYS.map((key) => {
                          const value = q[`option_${key.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d']
                          const isCorrect = q.correct_option === key
                          return (
                            <div key={key} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              borderRadius: 8, padding: '8px 12px',
                              background: isCorrect ? '#f0fdf4' : '#ffffff',
                              border: `1px solid ${isCorrect ? '#bbf7d0' : C.borderSoft}`,
                            }}>
                              <span style={{
                                fontSize: 11, fontWeight: 800,
                                color: isCorrect ? '#15803d' : C.textSoft,
                              }}>{key}</span>
                              <span style={{ fontSize: 12, color: isCorrect ? '#15803d' : C.textMid, fontWeight: isCorrect ? 700 : 400 }}>
                                {value}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {q.explanation && (
                        <p style={{ fontSize: 11, color: C.textSoft, marginTop: 10, lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 700 }}>Why: </span>{q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {c.assessment && c.questions.length === 0 && (
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: C.textSoft, fontWeight: 500 }}>
                    Assessment created but no questions added yet.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

      </div>
    </AdminLayout>
  )
}
