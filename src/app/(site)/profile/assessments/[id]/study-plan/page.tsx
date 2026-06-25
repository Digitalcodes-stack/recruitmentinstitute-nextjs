import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CalendarCheck2, FileDown } from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { getAssessmentStudyPlan, FastApiError } from '@/lib/fastapiClient'

export const metadata: Metadata = {
  title: 'Study Plan',
  robots: { index: false, follow: false },
}

function formatDayLabel(key: string): string {
  const match = key.match(/day[_-]?(\d+)/i)
  if (match) return `Day ${match[1]}`
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function AssessmentStudyPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let plan
  try {
    plan = await getAssessmentStudyPlan(studentAssessmentId)
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) notFound()
    throw error
  }

  const entries = Object.entries(plan.plan_json)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 70px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Link href="/profile" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textDecoration: 'none' }}>Profile</Link>
        <ChevronRight style={{ width: 12, height: 12, color: '#cbd5e1' }} />
        <Link href={`/profile/assessments/${studentAssessmentId}`} style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textDecoration: 'none' }}>Result</Link>
        <ChevronRight style={{ width: 12, height: 12, color: '#cbd5e1' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>Study Plan</span>
      </div>

      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1 }}>Your Personalized Study Plan</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>An AI-generated day-by-day plan focused on closing your weak topics.</p>
        </div>
        <Link
          href={`/profile/assessments/${studentAssessmentId}/notes`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          <FileDown style={{ width: 14, height: 14 }} /> View AI Notes
        </Link>
      </div>

      {entries.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <CalendarCheck2 style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#64748b' }}>No study plan was generated for this attempt.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map(([key, value], index) => (
            <div key={key} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff',
              }}>
                {index + 1}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{formatDayLabel(key)}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.6 }}>{String(value)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
