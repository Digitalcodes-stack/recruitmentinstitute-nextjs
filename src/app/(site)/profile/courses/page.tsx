import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CalendarDays, CheckCircle2, Clock3, ExternalLink, Layers3, Sparkles, UserCheck, Users } from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EnrollButton from '@/components/site/EnrollButton'

export const metadata: Metadata = {
  title: 'My Courses - Student Portal',
  robots: { index: false, follow: false },
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  PENDING: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending Approval' },
  APPROVED: { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0', label: 'Approved' },
  ACTIVE: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Active' },
  COMPLETED: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: 'Completed' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected' },
  ON_HOLD: { bg: '#f8fafc', color: '#475569', border: '#cbd5e1', label: 'On Hold' },
  ENROLLED: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Enrolled' },
}

const SLUG_TO_ROUTE: Record<string, string> = {
  degree_tag: '/end-to-end-recruitment-training',
  certification_tag: '/hr-courses-for-beginners',
  entrepreneur_tag: '/hr-entrepreneurship-program',
  corporate_traning_tag: '/hr-corporate-training-course',
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return 'TBA'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function StudentCoursesPage() {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const [courses, enrollments, fees] = await Promise.all([
    prisma.course.findMany({
      orderBy: { id: 'asc' },
      include: {
        category: true,
        modules: {
          select: { id: true, title: true },
        },
        batches: {
          orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
          include: {
            trainer: { select: { name: true, specialization: true } },
            enrollments: { where: { studentId: session.userId }, select: { id: true, status: true } },
          },
          take: 3,
        },
      },
    }),
    prisma.enrollment.findMany({
      where: { studentId: session.userId },
      include: { batch: { select: { courseId: true } } },
    }),
    prisma.courseFee.findMany({
      orderBy: { id: 'asc' },
    }),
  ])

  const enrollmentByCourse = new Map<number, (typeof enrollments)[number]>()
  for (const enrollment of enrollments) {
    enrollmentByCourse.set(enrollment.batch.courseId, enrollment)
  }

  const feeByCatId = new Map<number, (typeof fees)[number]>()
  for (const fee of fees) {
    feeByCatId.set(fee.categoryId, fee)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Student Portal</p>
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1 }}>My Courses</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
          Single source of truth catalog: View complete curriculum, enroll in upcoming cohorts, and access live LMS player.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Available Tracks', value: courses.length, icon: Layers3 },
          { label: 'Enrolled / Applied', value: enrollments.length, icon: UserCheck },
          { label: 'Active Cohorts', value: enrollments.filter((e) => ['APPROVED', 'ACTIVE', 'ENROLLED'].includes(e.status)).length, icon: CalendarDays },
          { label: 'Batches Scheduled', value: courses.filter((c) => c.batches.length > 0).length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              <Icon style={{ width: 11, height: 11 }} />
              {label}
            </div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, color: '#0f172a' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
        {courses.map((course) => {
          const current = enrollmentByCourse.get(course.id)
          const latestBatch = course.batches[0] ?? null
          const status = current ? STATUS_STYLE[current.status] ?? STATUS_STYLE.PENDING : null
          const feeRecord = feeByCatId.get(course.categoryId)
          const feeStr = feeRecord?.finalTotal ? `₹${Number(feeRecord.finalTotal).toLocaleString('en-IN')}` : '₹85,000'
          const publicRoute = SLUG_TO_ROUTE[course.category.slug] || `/${course.category.slug}`

          return (
            <article key={course.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '22px 22px 18px', background: 'linear-gradient(135deg,#0f172a,#1e40af)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa' }} />
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{course.category.name}</span>
                  </div>
                  <Link
                    href={publicRoute}
                    target="_blank"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#93c5fd', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}
                  >
                    View Syllabus <ExternalLink style={{ width: 11, height: 11 }} />
                  </Link>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 14, lineHeight: 1.2 }}>{course.title}</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 10, lineHeight: 1.7 }}>
                  {(() => {
                    const text = stripHtml(course.description)
                    return text.length > 170 ? `${text.slice(0, 170)}…` : text
                  })()}
                </p>
              </div>

              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Duration</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{course.duration || '3 Months'}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Trainer</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{latestBatch?.trainer.name ?? 'Industry Mentors'}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Tuition Fee</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {feeStr}
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Modules</div>
                    <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{course.modules.length > 0 ? `${course.modules.length} Modules` : '7 Modules'}</div>
                  </div>
                </div>

                {current ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderRadius: 14, background: status?.bg, border: `1px solid ${status?.border}` }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: status?.color, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Enrollment Status</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{status?.label ?? current.status}</div>
                    </div>
                    {current.reviewNote ? <p style={{ fontSize: 12, color: '#475569', maxWidth: 200, textAlign: 'right' }}>{current.reviewNote}</p> : null}
                  </div>
                ) : (
                  <div style={{ padding: '12px 14px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Enrollment Status</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>Not Enrolled</div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, flexWrap: 'wrap' }}>
                  <Clock3 style={{ width: 13, height: 13 }} />
                  {latestBatch ? `Upcoming Batch: ${latestBatch.name} (${fmtDate(latestBatch.startDate)})` : 'Upcoming Cohort: 13 Oct 2026'}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {latestBatch ? (
                    <div style={{ flex: 1 }}>
                      <EnrollButton
                        batchId={latestBatch.id}
                        disabled={Boolean(current)}
                        disabledLabel={current ? status?.label ?? current.status : 'Already requested'}
                      />
                    </div>
                  ) : (
                    <Link
                      href={publicRoute}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#0f172a', color: '#fff', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}
                    >
                      Apply Online
                    </Link>
                  )}

                  {current && ['APPROVED', 'ACTIVE', 'ENROLLED'].includes(current.status) && (
                    <Link
                      href={`/profile/courses/${course.id}`}
                      style={{ padding: '12px 18px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <BookOpen style={{ width: 14, height: 14 }} /> Open LMS
                    </Link>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
