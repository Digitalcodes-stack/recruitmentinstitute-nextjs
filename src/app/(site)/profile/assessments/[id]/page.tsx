import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  CalendarCheck2,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Target,
  Clock,
  BookOpen,
  ArrowLeft,
  Check,
  Zap,
} from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { getAssessmentResult, getAssessmentTest, FastApiError } from '@/lib/fastapiClient'
import AssessmentPerformanceChart, { TopicScoreData } from '@/components/site/AssessmentPerformanceChart'
import PDFDownloadButton from '@/components/site/PDFDownloadButton'

export const metadata: Metadata = {
  title: 'Assessment Performance Report',
  robots: { index: false, follow: false },
}

export default async function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let result
  let testReview = []
  try {
    const [resData, testData] = await Promise.all([
      getAssessmentResult(studentAssessmentId),
      getAssessmentTest(studentAssessmentId).catch(() => []),
    ])
    result = resData
    testReview = testData
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) {
      notFound()
    }
    throw error
  }

  const { student_assessment: attempt, analysis } = result
  const percentage = attempt.percentage ?? 0
  const score = attempt.score ?? 0

  // Calculate detailed topic statistics from questions or difficulty_breakdown
  const breakdown = (analysis.analysis_json?.difficulty_breakdown as Record<string, number>) || {}

  // Aggregate questions by topic
  const topicMap: Record<string, { correct: number; total: number }> = {}
  let totalQuestionsCount = testReview.length
  let totalCorrectCount = 0

  if (Array.isArray(testReview) && testReview.length > 0) {
    for (const q of testReview) {
      const t = q.topic_name || 'General'
      if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 }
      topicMap[t].total++
      if (q.student_answer && q.student_answer === q.correct_option) {
        topicMap[t].correct++
        totalCorrectCount++
      }
    }
  } else {
    totalQuestionsCount = Math.round(score / Math.max(0.01, percentage / 100)) || 25
    totalCorrectCount = Math.round(score)
  }

  const allTopicNames = Array.from(
    new Set([
      ...Object.keys(topicMap),
      ...Object.keys(breakdown),
      ...analysis.strong_topics,
      ...analysis.weak_topics,
    ])
  )

  const topicScores: TopicScoreData[] = allTopicNames.map((topic) => {
    let correct = topicMap[topic]?.correct
    let total = topicMap[topic]?.total
    let pct = breakdown[topic]

    if (total !== undefined && total > 0) {
      pct = Math.round((correct / total) * 100)
    } else if (pct !== undefined) {
      total = 1
      correct = pct >= 70 ? 1 : 0
    } else {
      const isStrong = analysis.strong_topics.includes(topic)
      pct = isStrong ? 100 : 0
      total = 1
      correct = isStrong ? 1 : 0
    }

    const status: 'Strong' | 'Moderate' | 'Weak' =
      pct >= 70 ? 'Strong' : pct >= 40 ? 'Moderate' : 'Weak'

    return {
      topic,
      correct: correct || 0,
      total: total || 1,
      percentage: pct,
      status,
    }
  })

  // Sort: Strong topics first, then highest percentage
  topicScores.sort((a, b) => b.percentage - a.percentage)

  const strongList = topicScores.filter((t) => t.status === 'Strong')
  const weakList = topicScores.filter((t) => t.status !== 'Strong')

  // Performance tier metadata
  const getTierInfo = (pct: number) => {
    if (pct >= 85) {
      return {
        label: 'Exemplary Mastery',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeBorder: '#10b981',
        badgeText: '#34d399',
        desc: 'Outstanding performance across recruitment competencies.',
        gradient: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
      }
    }
    if (pct >= 65) {
      return {
        label: 'Proficient & Competent',
        badgeBg: 'rgba(59, 130, 246, 0.15)',
        badgeBorder: '#3b82f6',
        badgeText: '#60a5fa',
        desc: 'Solid foundation with key areas identified for targeted mastery.',
        gradient: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
      }
    }
    if (pct >= 40) {
      return {
        label: 'Developing Foundation',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: '#f59e0b',
        badgeText: '#fbbf24',
        desc: 'Core concepts understood; focused revision recommended.',
        gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
      }
    }
    return {
      label: 'Targeted Revision Needed',
      badgeBg: 'rgba(244, 63, 94, 0.15)',
      badgeBorder: '#f43f5e',
      badgeText: '#fda4af',
      desc: 'Significant opportunity for improvement via AI-generated revision modules.',
      gradient: 'linear-gradient(135deg, #881337 0%, #be123c 100%)',
    }
  }

  const tier = getTierInfo(percentage)

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        {/* Navigation Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Link
              href="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#64748b',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} /> Student Portal
            </Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
            <Link
              href="/profile/assessments"
              style={{ color: '#64748b', fontWeight: 600, textDecoration: 'none' }}
            >
              Assessments
            </Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
            <span style={{ color: '#1e40af', fontWeight: 700 }}>
              Performance Diagnostic #{studentAssessmentId}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
              }}
            >
              <Clock style={{ width: 13, height: 13, color: '#64748b' }} />
              {new Date(attempt.started_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* ── HERO PERFORMANCE SHOWCASE CARD ──────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E3A8A 100%)',
            borderRadius: 28,
            padding: '36px 40px',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Ambient Lighting Orbs */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 340,
              height: 340,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -60,
              left: '30%',
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 36,
              alignItems: 'center',
            }}
          >
            {/* Left Score Display */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: tier.badgeBg,
                  border: `1px solid ${tier.badgeBorder}`,
                  marginBottom: 16,
                }}
              >
                <Award style={{ width: 14, height: 14, color: tier.badgeText }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: tier.badgeText,
                  }}
                >
                  {tier.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
                <h1
                  style={{
                    fontSize: 54,
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {percentage.toFixed(1)}%
                </h1>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.75)',
                  }}
                >
                  ({score.toFixed(1)} / {totalQuestionsCount} Marks)
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.75)',
                  lineHeight: 1.6,
                  maxWidth: 480,
                  marginBottom: 24,
                }}
              >
                {tier.desc}
              </p>

              {/* Stat Chips Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 14,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 style={{ width: 16, height: 16, color: '#34d399' }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>Correct</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      {totalCorrectCount} Questions
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 14,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <TrendingUp style={{ width: 16, height: 16, color: '#60a5fa' }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>Strong Topics</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      {strongList.length} Areas
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 14,
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Target style={{ width: 16, height: 16, color: '#fbbf24' }} />
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>Focus Areas</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                      {weakList.length} Topics
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Hub */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(16px)',
                borderRadius: 22,
                padding: '24px 26px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.6)' }}>
                AI Learning Modules
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link
                  href={`/profile/assessments/${studentAssessmentId}/study-plan`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                      }}
                    >
                      <CalendarCheck2 style={{ width: 16, height: 16 }} />
                    </div>
                    <span>Study Plan</span>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
                </Link>

                <Link
                  href={`/profile/assessments/${studentAssessmentId}/notes`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bfdbfe',
                      }}
                    >
                      <BookOpen style={{ width: 16, height: 16 }} />
                    </div>
                    <span>AI Notes</span>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link
                  href={`/profile/assessments/${studentAssessmentId}/test`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fed7aa',
                      }}
                    >
                      <FileText style={{ width: 16, height: 16 }} />
                    </div>
                    <span>Test Review</span>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
                </Link>

                <PDFDownloadButton
                  studentAssessmentId={studentAssessmentId}
                  variant="glass"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px 16px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── AI EXECUTIVE DIAGNOSTIC SUMMARY ─────────────────────────── */}
        {typeof analysis.analysis_json?.summary === 'string' && (
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
              border: '1px solid #BAE6FD',
              borderRadius: 24,
              padding: '28px 32px',
              marginBottom: 32,
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.08)',
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Sparkles style={{ width: 24, height: 24 }} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#0369a1',
                    letterSpacing: '-0.01em',
                  }}
                >
                  AI Intelligence & Performance Diagnostic
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '3px 10px',
                    borderRadius: 100,
                  }}
                >
                  Generated Insights
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: '#0c4a6e',
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                {analysis.analysis_json.summary as string}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  paddingTop: 14,
                  borderTop: '1px solid #e0f2fe',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
                  <Zap style={{ width: 14, height: 14, color: '#0284c7' }} />
                  Recommendation:
                </div>
                <span style={{ fontSize: 13, color: '#334155' }}>
                  Follow your tailored <strong>5-Day Study Plan</strong> to review the {weakList.length} identified focus topics.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── TWO-COLUMN ANALYSIS & MATRIX SECTION ────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 28, marginBottom: 36, alignItems: 'start' }}>
          
          {/* Left Column: Topic Mastery Cards */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '28px 28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>Topic Competency Matrix</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Breakdown of syllabus domains</p>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#2563eb',
                  background: '#eff6ff',
                  padding: '4px 12px',
                  borderRadius: 100,
                }}
              >
                {topicScores.length} Topics Assessed
              </span>
            </div>

            {/* Strong topics section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <TrendingUp style={{ width: 16, height: 16, color: '#10b981' }} />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Strong Topics ({strongList.length})
                </h4>
              </div>

              {strongList.length === 0 ? (
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 14, border: '1px dashed #cbd5e1', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                  No mastered topics identified yet. Review your notes below to build strong proficiency.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {strongList.map((t) => (
                    <div
                      key={t.topic}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 16,
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                            {t.topic}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '2px 8px',
                              borderRadius: 999,
                            }}
                          >
                            Mastered
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 160,
                              height: 6,
                              borderRadius: 99,
                              background: '#dcfce7',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${t.percentage}%`,
                                height: '100%',
                                background: '#10b981',
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>
                            {t.percentage}%
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                          {t.correct} / {t.total}
                        </span>
                        <div style={{ fontSize: 10, color: '#86efac' }}>Correct</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak / Areas for improvement */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <TrendingDown style={{ width: 16, height: 16, color: '#f43f5e' }} />
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Areas For Improvement ({weakList.length})
                </h4>
              </div>

              {weakList.length === 0 ? (
                <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', fontSize: 13, color: '#166534', textAlign: 'center', fontWeight: 700 }}>
                  Excellent! No weak topics identified in this assessment.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                  {weakList.map((t) => (
                    <div
                      key={t.topic}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 16,
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#9f1239' }}>
                            {t.topic}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background: '#ffe4e6',
                              color: '#be123c',
                              padding: '2px 8px',
                              borderRadius: 999,
                            }}
                          >
                            {t.percentage === 0 ? '0% Accuracy' : `${t.percentage}%`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 160,
                              height: 6,
                              borderRadius: 99,
                              background: '#ffe4e6',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(t.percentage, 5)}%`,
                                height: '100%',
                                background: '#f43f5e',
                                borderRadius: 99,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: '#9f1239', fontWeight: 600 }}>
                            {t.correct}/{t.total} correct
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/profile/assessments/${studentAssessmentId}/notes#${t.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#be123c',
                          background: '#ffffff',
                          border: '1px solid #fecdd3',
                          padding: '6px 12px',
                          borderRadius: 10,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Study <ArrowRight style={{ width: 12, height: 12 }} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Topic-wise Performance Chart */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '28px 28px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>Interactive Performance Chart</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Visual competency distribution</p>
              </div>
            </div>

            <AssessmentPerformanceChart
              strongTopics={analysis.strong_topics}
              weakTopics={analysis.weak_topics}
              topicScores={topicScores}
            />
          </div>
        </div>

        {/* ── ACTION BANNER: NEXT STEPS ───────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
            borderRadius: 24,
            padding: '32px 36px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            boxShadow: '0 12px 30px -8px rgba(37, 99, 235, 0.35)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.18)',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Target style={{ width: 12, height: 12 }} /> Personalised Next Steps
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginBottom: 6 }}>
              Ready to master your weak topics?
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 600, lineHeight: 1.6 }}>
              Our AI has crafted tailored study notes and a structured 5-day daily sprint based on your test results.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href={`/profile/assessments/${studentAssessmentId}/study-plan`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 14,
                background: '#ffffff',
                color: '#1e40af',
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              <CalendarCheck2 style={{ width: 16, height: 16 }} /> Start 5-Day Study Plan
            </Link>

            <Link
              href={`/profile/assessments/${studentAssessmentId}/notes`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <BookOpen style={{ width: 16, height: 16 }} /> Read AI Notes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
