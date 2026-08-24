import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  ClipboardCheck,
  CalendarDays,
  Award,
  BookOpen,
  CalendarCheck2,
  FileText,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { listMyAssessments } from '@/lib/fastapiClient'

export const metadata: Metadata = {
  title: 'My Assessments & AI Diagnostics',
  robots: { index: false, follow: false },
}

export default async function AssessmentsIndexPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  let attempts = []
  try {
    attempts = await listMyAssessments()
  } catch {
    attempts = []
  }

  // Calculate statistics
  const completedAttempts = attempts.filter((a) => a.percentage !== null)
  const totalScoreSum = completedAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0)
  const avgPercentage = completedAttempts.length > 0 ? (totalScoreSum / completedAttempts.length).toFixed(1) : '0.0'

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24 }}>
          <Link
            href="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#64748b',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Student Portal
          </Link>
          <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
          <span style={{ color: '#1e40af', fontWeight: 700 }}>Assessment History</span>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E3A8A 100%)',
            borderRadius: 28,
            padding: '36px 40px',
            color: '#fff',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 28 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: 'rgba(255, 255, 255, 0.12)',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                <Sparkles style={{ width: 12, height: 12, color: '#60a5fa' }} /> AI Learning Hub
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
                My Assessments & Diagnostics
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.75)', maxWidth: 520, lineHeight: 1.6 }}>
                Track your skill mastery, AI diagnostic feedback, custom revision notes, and 5-day study plans for every completed evaluation.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 18,
                  padding: '14px 22px',
                  textAlign: 'center',
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>{attempts.length}</div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Total Attempts</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 18,
                  padding: '14px 22px',
                  textAlign: 'center',
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 900, color: '#34d399' }}>{avgPercentage}%</div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>Average Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '1px dashed #cbd5e1',
              borderRadius: 24,
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <ClipboardCheck style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              No Assessments Taken Yet
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
              When you complete a course, your final assessment will appear here with AI-generated notes, study plans, and diagnostic reports.
            </p>
            <Link
              href="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Go to My Courses <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {attempts.map((attempt) => {
              const pct = attempt.percentage ?? 0
              const isCompleted = attempt.status === 'completed'
              const scoreBg = pct >= 70 ? '#ecfdf5' : pct >= 40 ? '#fffbeb' : '#fff1f2'
              const scoreText = pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#e11d48'
              const scoreBorder = pct >= 70 ? '#a7f3d0' : pct >= 40 ? '#fde68a' : '#fecdd3'

              return (
                <div
                  key={attempt.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 22,
                    padding: '24px 28px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: scoreBg,
                          border: `1px solid ${scoreBorder}`,
                          color: scoreText,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 18,
                        }}
                      >
                        {pct.toFixed(0)}%
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                            Assessment #{attempt.id}
                          </h3>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: isCompleted ? '#ecfdf5' : '#fffbeb',
                              color: isCompleted ? '#059669' : '#d97706',
                              border: isCompleted ? '1px solid #a7f3d0' : '1px solid #fde68a',
                            }}
                          >
                            {attempt.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarDays style={{ width: 13, height: 13 }} />
                          Completed on{' '}
                          {new Date(attempt.started_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link
                        href={`/profile/assessments/${attempt.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 18px',
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                          color: '#ffffff',
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                        }}
                      >
                        View Full Diagnostic <ChevronRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>
                  </div>

                  {/* Quick Jump Action Pills */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                      paddingTop: 14,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginRight: 4 }}>
                      AI Modules:
                    </span>

                    <Link
                      href={`/profile/assessments/${attempt.id}/study-plan`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <CalendarCheck2 style={{ width: 13, height: 13, color: '#2563eb' }} /> 5-Day Study Plan
                    </Link>

                    <Link
                      href={`/profile/assessments/${attempt.id}/notes`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <BookOpen style={{ width: 13, height: 13, color: '#7c3aed' }} /> AI Revision Notes
                    </Link>

                    <Link
                      href={`/profile/assessments/${attempt.id}/test`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <FileText style={{ width: 13, height: 13, color: '#ea580c' }} /> Question Bank Review
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
