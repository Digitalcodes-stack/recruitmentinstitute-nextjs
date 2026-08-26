import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Brain,
  CalendarDays,
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Session Assessments | Student Portal',
  robots: { index: false, follow: false },
}

export default async function SessionAssessmentsPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const studentId = session.userId

  // Fetch session assessments the student is eligible for
  const records = await prisma.sessionAssessmentStudent.findMany({
    where: { studentId },
    include: {
      sessionAssessment: {
        include: {
          session: {
            select: {
              id: true,
              title: true,
              sessionDate: true,
              startTime: true,
              moduleNameSnapshot: true,
              topicsJson: true,
              batch: {
                select: {
                  id: true,
                  name: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { releasedAt: 'desc' },
  })

  const items = records.map((r) => {
    const sa = r.sessionAssessment
    const topics = (sa.topicsJson as string[]) || []
    return {
      id: sa.id,
      fastapiAssessmentId: sa.fastapiAssessmentId,
      moduleName: sa.moduleName,
      topics,
      courseId: sa.courseId,
      courseTitle: sa.session.batch.course.title,
      batchName: sa.session.batch.name,
      sessionId: sa.session.id,
      sessionTitle: sa.session.title,
      sessionDate: sa.session.sessionDate,
      releasedAt: r.releasedAt,
    }
  })

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24 }}>
          <Link
            href="/profile"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 600, textDecoration: 'none' }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Student Portal
          </Link>
          <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1' }} />
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Session Assessments</span>
        </div>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 24,
          padding: '32px 36px',
          marginBottom: 32,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Session Assessments</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Topic-specific assessments based on your attendance
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{items.length}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>Available</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles style={{ width: 14, height: 14, opacity: 0.8 }} />
                <span style={{ fontSize: 12, opacity: 0.85 }}>Only given to students who attended the session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle style={{ width: 28, height: 28, color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Session Assessments Yet</h3>
            <p style={{ fontSize: 13, color: '#64748b', maxWidth: 380, margin: '0 auto' }}>
              Session assessments are released after your trainer marks attendance. They're only given to students who were present.
            </p>
            <Link
              href="/profile/assessments"
              style={{ display: 'inline-block', marginTop: 20, padding: '10px 24px', borderRadius: 10, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
            >
              View Full-Course Assessments
            </Link>
          </div>
        )}

        {/* Assessment Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => {
            const sessionDate = new Date(item.sessionDate)
            const releasedAt = new Date(item.releasedAt)
            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain style={{ width: 22, height: 22, color: '#fff' }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.moduleName}</h3>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#7c3aed',
                        background: '#f5f3ff', padding: '2px 8px', borderRadius: 6,
                        border: '1px solid #ddd6fe', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        Based on your attendance
                      </span>
                    </div>

                    {/* Course + Batch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BookOpen style={{ width: 12, height: 12 }} />
                        {item.courseTitle}
                      </span>
                      <span>·</span>
                      <span>{item.batchName}</span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarDays style={{ width: 12, height: 12 }} />
                        Session: {sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Topics */}
                    {item.topics.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {item.topics.slice(0, 5).map((topic, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: 11, fontWeight: 600, color: '#374151',
                              background: '#f1f5f9', padding: '3px 10px', borderRadius: 6,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                        {item.topics.length > 5 && (
                          <span style={{ fontSize: 11, color: '#94a3b8', padding: '3px 10px' }}>
                            +{item.topics.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
                      <Clock style={{ width: 11, height: 11 }} />
                      Released {releasedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/profile/assessments/take/${item.courseId}?sessionAssessmentId=${item.fastapiAssessmentId}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: '#fff', textDecoration: 'none', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                    }}
                  >
                    <Play style={{ width: 13, height: 13 }} />
                    Start Assessment
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Link to full-course assessments */}
        {items.length > 0 && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link
              href="/profile/assessments"
              style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
            >
              View Full-Course Assessments →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
