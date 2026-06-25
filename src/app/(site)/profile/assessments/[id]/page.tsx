import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Award, TrendingUp, TrendingDown, FileText, CalendarCheck2, Lightbulb } from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { getAssessmentResult, FastApiError } from '@/lib/fastapiClient'
import AssessmentPerformanceChart from '@/components/site/AssessmentPerformanceChart'
import PDFDownloadButton from '@/components/site/PDFDownloadButton'

export const metadata: Metadata = {
  title: 'Assessment Result',
  robots: { index: false, follow: false },
}

export default async function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let result
  try {
    result = await getAssessmentResult(studentAssessmentId)
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) notFound()
    throw error
  }

  const { student_assessment: attempt, analysis } = result
  const percentage = attempt.percentage ?? 0
  const scoreColor = percentage >= 75 ? '#16A34A' : percentage >= 50 ? '#D97706' : '#DC2626'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Link href="/profile" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textDecoration: 'none' }}>Profile</Link>
        <ChevronRight style={{ width: 12, height: 12, color: '#cbd5e1' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>Assessment Result</span>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1 }}>Your Assessment Result</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>AI-analyzed performance with personalized notes and a study plan based on your weak topics.</p>
      </div>

      {/* Score hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)', borderRadius: 24, padding: '32px 36px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: 14 }}>
              <Award style={{ width: 11, height: 11, color: '#FCD34D' }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Status: {attempt.status}</span>
            </div>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{percentage.toFixed(1)}%</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Score: {attempt.score?.toFixed(1)} marks</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href={`/profile/assessments/${studentAssessmentId}/notes`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <FileText style={{ width: 14, height: 14 }} /> AI Notes
            </Link>
            <PDFDownloadButton studentAssessmentId={studentAssessmentId} />
            <Link href={`/profile/assessments/${studentAssessmentId}/study-plan`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: '#fff', color: '#1E40AF', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <CalendarCheck2 style={{ width: 14, height: 14 }} /> Study Plan
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Strong / Weak topics */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp style={{ width: 16, height: 16, color: '#16A34A' }} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Strong Topics</h3>
          </div>
          {analysis.strong_topics.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No strong topics identified yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analysis.strong_topics.map((t) => (
                <span key={t} style={{ padding: '6px 12px', borderRadius: 999, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: 12, fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 16 }}>
            <TrendingDown style={{ width: 16, height: 16, color: '#DC2626' }} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Weak Topics</h3>
          </div>
          {analysis.weak_topics.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>No weak topics identified — great job!</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analysis.weak_topics.map((t) => (
                <span key={t} style={{ padding: '6px 12px', borderRadius: 999, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 12, fontWeight: 700 }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Topic-wise Performance</h3>
          <AssessmentPerformanceChart strongTopics={analysis.strong_topics} weakTopics={analysis.weak_topics} />
        </div>
      </div>

      {/* AI Summary */}
      {typeof analysis.analysis_json?.summary === 'string' && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: 24, display: 'flex', gap: 14 }}>
          <Lightbulb style={{ width: 20, height: 20, color: '#1E40AF', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>AI Summary</h4>
            <p style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.6 }}>{analysis.analysis_json.summary as string}</p>
          </div>
        </div>
      )}
    </div>
  )
}
