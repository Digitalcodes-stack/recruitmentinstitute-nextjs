import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ClipboardCheck, CalendarDays } from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { listMyAssessments } from '@/lib/fastapiClient'

export const metadata: Metadata = {
  title: 'My Assessments',
  robots: { index: false, follow: false },
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  completed: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  in_progress: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
}

export default async function AssessmentsIndexPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const attempts = await listMyAssessments()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Student Portal</p>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1 }}>My Assessments</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>View AI-analyzed results, personalized notes, and study plans for each assessment you've taken.</p>
      </div>

      {attempts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          <ClipboardCheck style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#64748b' }}>You haven&apos;t taken any assessments yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {attempts.map((attempt) => {
            const status = STATUS_STYLE[attempt.status] ?? STATUS_STYLE.in_progress
            return (
              <Link
                key={attempt.id}
                href={`/profile/assessments/${attempt.id}`}
                style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textDecoration: 'none', flexWrap: 'wrap' }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: status.bg, border: `1px solid ${status.border}`, marginBottom: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.color }} />
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: status.color }}>{attempt.status.replace('_', ' ')}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarDays style={{ width: 12, height: 12 }} />
                    {new Date(attempt.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {attempt.percentage !== null && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{attempt.percentage.toFixed(1)}%</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>Score</p>
                    </div>
                  )}
                  <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
