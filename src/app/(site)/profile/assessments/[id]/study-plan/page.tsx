import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CalendarCheck2, BookOpen, Target, CheckCircle2,
  Clock, FlaskConical, Lightbulb, TrendingUp, TrendingDown,
  FileText, ChevronRight, Star, AlertTriangle,
} from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { getAssessmentStudyPlan, getAssessmentResult, FastApiError } from '@/lib/fastapiClient'

export const metadata: Metadata = {
  title: 'Study Plan',
  robots: { index: false, follow: false },
}

// ── helpers ────────────────────────────────────────────────────────────────
function dayLabel(key: string) {
  const m = key.match(/day[_-]?(\d+)/i)
  return m ? `Day ${m[1]}` : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function toTitleCase(s: string) {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function scoreColor(pct: number | null) {
  if (pct === null) return { bg: '#f1f5f9', border: '#e2e8f0', text: '#64748b' }
  if (pct >= 70)    return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' }
  if (pct >= 40)    return { bg: '#fffbeb', border: '#fde68a', text: '#92400e' }
  return               { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' }
}

const DAY_COLORS = [
  { accent: '#2563eb', light: '#eff6ff', border: '#bfdbfe', badge: '#dbeafe', badgeText: '#1e40af' },
  { accent: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe', badge: '#ede9fe', badgeText: '#5b21b6' },
  { accent: '#059669', light: '#ecfdf5', border: '#a7f3d0', badge: '#d1fae5', badgeText: '#065f46' },
  { accent: '#ea580c', light: '#fff7ed', border: '#fed7aa', badge: '#ffedd5', badgeText: '#9a3412' },
  { accent: '#db2777', light: '#fdf2f8', border: '#f9a8d4', badge: '#fce7f3', badgeText: '#831843' },
]

// Detect old-format plan (string values) vs new rich format (object values)
function isRichDay(v: unknown): v is {
  topic: string; score_pct: number | null; phase: string; icon: string;
  goal: string; steps: string[]; self_test: string; time_estimate: string; resources: string[]
} {
  return typeof v === 'object' && v !== null && 'steps' in v
}

// ── page ───────────────────────────────────────────────────────────────────
export default async function AssessmentStudyPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let plan, result
  try {
    ;[plan, result] = await Promise.all([
      getAssessmentStudyPlan(studentAssessmentId),
      getAssessmentResult(studentAssessmentId),
    ])
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) notFound()
    throw error
  }

  const { student_assessment: attempt, analysis } = result
  const percentage = attempt.percentage ?? 0
  const entries = Object.entries(plan.plan_json)
  const richEntries = entries.filter(([, v]) => isRichDay(v))
  const isRich = richEntries.length > 0

  return (
    <>
      <style>{`
        .sp-page { max-width: 1060px; margin: 0 auto; padding: 32px 24px 80px; }

        /* breadcrumb */
        .sp-bc { display: flex; align-items: center; gap: 6px; margin-bottom: 28px; }
        .sp-bc a { font-size: 12px; font-weight: 600; color: #94a3b8; text-decoration: none; }
        .sp-bc a:hover { color: #2563eb; }

        /* hero */
        .sp-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%);
          border-radius: 24px; padding: 32px 36px; margin-bottom: 32px;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 24px; flex-wrap: wrap; position: relative; overflow: hidden;
        }
        .sp-hero::after {
          content: ''; position: absolute; bottom: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }

        /* score ring */
        .sp-ring {
          width: 90px; height: 90px; border-radius: 50%; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 3px solid rgba(255,255,255,0.2);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        /* layout */
        .sp-layout { display: grid; grid-template-columns: 240px 1fr; gap: 28px; align-items: start; }
        @media (max-width: 760px) { .sp-layout { grid-template-columns: 1fr; } .sp-sidebar { display: none; } }

        /* sidebar */
        .sp-sidebar {
          position: sticky; top: 24px;
          background: #fff; border: 1px solid #e8ecf0; border-radius: 18px;
          padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sp-side-title { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; }
        .sp-day-link {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 10px; text-decoration: none;
          font-size: 12px; font-weight: 600; color: #475569;
          transition: all .15s; margin-bottom: 4px; border: 1px solid transparent;
        }
        .sp-day-link:hover { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .sp-day-num {
          width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900;
        }

        /* day card */
        .sp-card {
          border-radius: 22px; overflow: hidden; margin-bottom: 24px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06); border: 1px solid;
        }
        .sp-card-header { padding: 22px 28px; }
        .sp-card-body { padding: 28px 32px; background: #fff; }

        /* step list */
        .sp-steps { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .sp-step {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 12px 16px; border-radius: 12px;
          background: #f8fafc; border: 1px solid #e8ecf0;
          font-size: 13.5px; color: #334155; line-height: 1.65;
        }
        .sp-step-num {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; margin-top: 1px;
        }

        /* resource pills */
        .sp-resource { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        /* self-test box */
        .sp-selftest {
          display: flex; gap: 12px; padding: 16px 18px; border-radius: 14px;
          background: #fffbeb; border: 1px solid #fde68a; margin-top: 20px;
        }

        /* section label */
        .sp-section-label {
          font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #94a3b8; margin: 20px 0 10px; display: flex; align-items: center; gap: 6px;
        }
        .sp-section-label::after { content: ''; flex: 1; height: 1px; background: #e8ecf0; }
      `}</style>

      <div className="sp-page">

        {/* Breadcrumb */}
        <nav className="sp-bc">
          <Link href="/profile">Profile</Link>
          <ChevronRight style={{ width: 12, height: 12, color: '#cbd5e1' }} />
          <Link href={`/profile/assessments/${studentAssessmentId}`}>Result</Link>
          <ChevronRight style={{ width: 12, height: 12, color: '#cbd5e1' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Study Plan</span>
        </nav>

        {/* Hero */}
        <div className="sp-hero">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flex: 1 }}>
            <div className="sp-ring">
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {percentage.toFixed(0)}%
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginTop: 2 }}>Score</span>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: 10 }}>
                <CalendarCheck2 style={{ width: 12, height: 12, color: '#93c5fd' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#bfdbfe', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  {entries.length}-Day Personalised Plan
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.15, margin: 0 }}>
                Your Deep Study Plan
              </h1>
              <p style={{ fontSize: 13, color: '#93c5fd', marginTop: 8, maxWidth: 520, lineHeight: 1.7 }}>
                Built from your actual assessment result — each day targets a specific weak topic with structured activities, self-tests, and curated resources.
              </p>

              {/* Weak / Strong topic chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                {analysis.weak_topics.slice(0, 6).map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 11, fontWeight: 700, color: '#fca5a5' }}>
                    <TrendingDown style={{ width: 10, height: 10 }} />
                    {toTitleCase(t)}
                  </span>
                ))}
                {analysis.strong_topics.slice(0, 3).map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 11, fontWeight: 700, color: '#86efac' }}>
                    <TrendingUp style={{ width: 10, height: 10 }} />
                    {toTitleCase(t)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href={`/profile/assessments/${studentAssessmentId}/notes`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <FileText style={{ width: 14, height: 14 }} /> AI Notes
            </Link>
            <Link href={`/profile/assessments/${studentAssessmentId}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 11, background: '#fff', color: '#1e40af', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Result
            </Link>
          </div>
        </div>

        {/* AI summary if available */}
        {typeof analysis.analysis_json?.summary === 'string' && (
          <div style={{ display: 'flex', gap: 12, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: '16px 20px', marginBottom: 28 }}>
            <Lightbulb style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#1e3a8a', lineHeight: 1.7 }}>
              <strong>AI Summary:</strong> {analysis.analysis_json.summary as string}
            </p>
          </div>
        )}

        {entries.length === 0 ? (
          <div style={{ background: '#fff', border: '2px dashed #e2e8f0', borderRadius: 24, padding: 64, textAlign: 'center' }}>
            <CalendarCheck2 style={{ width: 36, height: 36, color: '#94a3b8', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Study Plan Generated</h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>No study plan was generated for this attempt. Try retaking the assessment to get a personalised plan.</p>
          </div>
        ) : (
          <div className="sp-layout">

            {/* Sidebar */}
            <aside className="sp-sidebar">
              <p className="sp-side-title">Plan Overview</p>
              {entries.map(([key, val], idx) => {
                const color = DAY_COLORS[idx % DAY_COLORS.length]
                const rich = isRichDay(val)
                const topic = rich ? val.topic : null
                const pct = rich ? val.score_pct : null
                return (
                  <a key={key} href={`#${key}`} className="sp-day-link">
                    <span className="sp-day-num" style={{ background: color.badge, color: color.badgeText }}>{idx + 1}</span>
                    <span style={{ flex: 1, lineHeight: 1.3 }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8' }}>{dayLabel(key)}</span>
                      {topic && <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{topic.length > 22 ? topic.slice(0, 22) + '…' : topic}</span>}
                    </span>
                    {pct !== null && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5, ...scoreColor(pct) }}>{pct}%</span>
                    )}
                  </a>
                )
              })}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#15803d', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Star style={{ width: 11, height: 11 }} /> Target
                  </p>
                  <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>Score above 70% on all weak topics in your next attempt.</p>
                </div>
              </div>
            </aside>

            {/* Day cards */}
            <div>
              {entries.map(([key, val], idx) => {
                const color = DAY_COLORS[idx % DAY_COLORS.length]
                const isLast = idx === entries.length - 1

                if (!isRichDay(val)) {
                  // Legacy string format — simple card
                  return (
                    <div key={key} id={key} className="sp-card" style={{ borderColor: color.border, background: color.light }}>
                      <div className="sp-card-header" style={{ background: `linear-gradient(135deg, ${color.accent}, ${color.accent}dd)`, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>{idx + 1}</div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{dayLabel(key)}</p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{String(val)}</p>
                        </div>
                      </div>
                    </div>
                  )
                }

                const sc = scoreColor(val.score_pct)
                return (
                  <div key={key} id={key} className="sp-card" style={{ borderColor: color.border }}>
                    {/* Card header */}
                    <div className="sp-card-header" style={{ background: `linear-gradient(135deg, ${color.accent}f0, ${color.accent})` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                            {val.icon}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{dayLabel(key)}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>{val.phase}</span>
                            </div>
                            <h2 style={{ fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: '-.01em', margin: 0 }}>{val.topic}</h2>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          {val.score_pct !== null && (
                            <div style={{ padding: '6px 14px', borderRadius: 10, background: sc.bg, border: `1px solid ${sc.border}` }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 1 }}>Your Score</p>
                              <p style={{ fontSize: 20, fontWeight: 900, color: sc.text, lineHeight: 1 }}>{val.score_pct}%</p>
                            </div>
                          )}
                          {isLast && (
                            <span style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                              🏆 Final Day
                            </span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                            <Clock style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.7)' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{val.time_estimate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Goal */}
                      <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: 10 }}>
                        <Target style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.8)', flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.65, margin: 0 }}>
                          <strong style={{ color: '#fff' }}>Goal:</strong> {val.goal}
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="sp-card-body">
                      {/* Steps */}
                      <p className="sp-section-label">
                        <CheckCircle2 style={{ width: 12, height: 12 }} />
                        Step-by-Step Activities
                      </p>
                      <ul className="sp-steps">
                        {val.steps.map((step: string, si: number) => (
                          <li key={si} className="sp-step">
                            <span className="sp-step-num" style={{ background: color.badge, color: color.badgeText }}>{si + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Self-test */}
                      <div className="sp-selftest">
                        <FlaskConical style={{ width: 18, height: 18, color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Self-Test Before Moving On</p>
                          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.65 }}>{val.self_test}</p>
                        </div>
                      </div>

                      {/* Resources */}
                      {val.resources?.length > 0 && (
                        <>
                          <p className="sp-section-label" style={{ marginTop: 20 }}>
                            <BookOpen style={{ width: 12, height: 12 }} />
                            Recommended Resources
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {val.resources.map((r: string, ri: number) => (
                              <span key={ri} className="sp-resource">
                                <BookOpen style={{ width: 11, height: 11 }} /> {r}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Warning for very low score */}
                      {val.score_pct !== null && val.score_pct < 30 && (
                        <div style={{ marginTop: 20, display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
                          <AlertTriangle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.6 }}>
                            <strong>Priority topic:</strong> You scored {val.score_pct}% here. Spend extra time and consider booking a 1-on-1 session with your trainer on this topic before your next attempt.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Bottom CTA */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Ready to retake the assessment?</h3>
                  <p style={{ fontSize: 13, color: '#93c5fd' }}>Work through the plan above, then test yourself again.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/profile/assessments/${studentAssessmentId}/notes`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    <FileText style={{ width: 14, height: 14 }} /> Review AI Notes
                  </Link>
                  <Link href={`/profile/assessments/${studentAssessmentId}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: '#fff', color: '#1e40af', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Result
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
