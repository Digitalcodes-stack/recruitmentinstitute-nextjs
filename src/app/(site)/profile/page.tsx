import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { User, Mail, Shield, BookOpen, Users, LogOut, ChevronRight, Award, Briefcase, GraduationCap, ClipboardList, CalendarDays, Sparkles, Brain, Phone, MapPin } from 'lucide-react'
import StudentTrainingPanel from '@/components/site/StudentTrainingPanel'
import AssignmentsPanel from '@/components/site/AssignmentsPanel'
import BatchCountdown from '@/components/shared/BatchCountdown'
import UserProfileClient from '@/components/site/UserProfileClient'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const session = await getUserSession()
  if (!session) redirect('/candidate-login')

  const enrollments = session.type === 'student'
    ? await prisma.enrollment.findMany({
        where: { studentId: session.userId },
        include: {
          batch: {
            include: {
              course: { select: { id: true, title: true } },
              trainer: { select: { name: true } },
              sessions: { orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }] },
            },
          },
          attendance: { select: { sessionId: true, present: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      })
    : []

  const assignments = session.type === 'student'
    ? await prisma.assignment.findMany({
        where: { batch: { enrollments: { some: { studentId: session.userId } } } },
        include: {
          batch: { select: { name: true, course: { select: { title: true } } } },
          submissions: { where: { studentId: session.userId } },
        },
        orderBy: { dueAt: 'asc' },
      })
    : []

  const upcomingSessions = session.type === 'student'
    ? enrollments
        .flatMap((enrollment) =>
          enrollment.batch.sessions
            .filter((s) => s.status !== 'CANCELLED' && new Date(s.startTime) >= new Date())
            .map((s) => ({
              id: s.id,
              title: s.title,
              sessionDate: s.sessionDate,
              startTime: s.startTime,
              meetLink: s.meetLink,
              status: s.status,
              batchName: enrollment.batch.name,
              courseTitle: enrollment.batch.course.title,
              trainerName: enrollment.batch.trainer.name,
            }))
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    : []

  const nextUpcomingBatch = enrollments
    .map((e) => e.batch)
    .filter((b) => b.status === 'UPCOMING' && new Date(b.startDate) > new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0]

  let userDetails: { phone?: string | null; city?: string | null; gender?: string | null; address?: string | null } = {}
  if (session.type === 'student') {
    const [s, c] = await Promise.all([
      prisma.student.findUnique({
        where: { id: session.userId },
        select: { contact: true },
      }),
      prisma.candidate.findFirst({
        where: { email: session.email },
        select: { mobile: true, phone: true, city: true, gender: true, address: true, streetAddress: true },
      }),
    ])
    userDetails = {
      phone: s?.contact || c?.phone || c?.mobile || null,
      city: c?.city || null,
      gender: c?.gender || null,
      address: c?.address || c?.streetAddress || null,
    }
  } else if (session.type === 'candidate') {
    const c = await prisma.candidate.findUnique({
      where: { id: session.userId },
      select: { mobile: true, phone: true, city: true, gender: true, address: true, streetAddress: true },
    })
    userDetails = {
      phone: c?.phone || c?.mobile || null,
      city: c?.city || null,
      gender: c?.gender || null,
      address: c?.address || c?.streetAddress || null,
    }
  } else if (session.type === 'membership') {
    const m = await prisma.membership.findUnique({
      where: { id: session.userId },
      select: { contact: true },
    })
    userDetails = { phone: m?.contact || null }
  }

  const initials = session.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const accountLabel =
    session.type === 'candidate' ? 'Candidate'
    : session.type === 'student' ? 'Student'
    : 'Member'

  return (
    <>
      <style>{`
        .profile-resource-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e8ecf0;
          padding: 28px 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
          text-decoration: none;
          display: block;
        }
        .profile-resource-card:hover {
          box-shadow: 0 12px 40px rgba(30,64,175,0.13);
          border-color: #BFDBFE;
          transform: translateY(-3px);
        }
        .profile-resource-card.green:hover  { box-shadow: 0 12px 40px rgba(22,163,74,0.12);  border-color: #BBF7D0; }
        .profile-resource-card.purple:hover { box-shadow: 0 12px 40px rgba(124,58,237,0.12); border-color: #DDD6FE; }
        .profile-resource-card.amber:hover  { box-shadow: 0 12px 40px rgba(217,119,6,0.12);  border-color: #FDE68A; }

        @media (max-width: 768px) {
          .profile-layout  { grid-template-columns: 1fr !important; }
          .profile-grid-2  { grid-template-columns: 1fr !important; }
          .profile-hero    { padding: 48px 0 80px !important; }
          .profile-content { margin-top: -50px !important; }
        }
      `}</style>

      {/* ── Hero banner ── */}
      <div className="profile-hero" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)', padding: '64px 0 100px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>My Account</span>
            <ChevronRight style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>Profile</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>My Profile</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Manage your account and access your resources</p>
        </div>
      </div>

      {/* ── Main content — pulled up over banner ── */}
      <div className="profile-content" style={{ maxWidth: 1100, margin: '-60px auto 80px', padding: '0 24px', position: 'relative' }}>
        <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Left: Identity card ── */}
          <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px -10px rgba(15,23,42,0.14)', border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            {/* gradient strip */}
            <div style={{ height: 80, background: 'linear-gradient(135deg, #1E40AF, #2563EB)' }} />

            <div style={{ padding: '0 28px 28px' }}>
              {/* avatar straddling the strip */}
              <div style={{ marginTop: -40, marginBottom: 16 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 24px rgba(30,64,175,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, color: '#fff',
                }}>
                  {initials}
                </div>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', marginBottom: 4 }}>{session.name}</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{session.email}</p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, background: '#EFF6FF', border: '1px solid #BFDBFE', marginBottom: 24 }}>
                <Shield style={{ width: 12, height: 12, color: '#1E40AF' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1E40AF' }}>{accountLabel}</span>
              </div>

              {/* info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: User,     label: 'Full Name',    value: session.name  },
                  { icon: Mail,     label: 'Email',        value: session.email, small: true },
                  ...(userDetails.phone ? [{ icon: Phone, label: 'Phone', value: userDetails.phone }] : []),
                  ...(userDetails.city ? [{ icon: MapPin, label: 'City', value: userDetails.city }] : []),
                  { icon: Briefcase,label: 'Account Type', value: accountLabel  },
                ].map(({ icon: Icon, label, value, small }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <Icon style={{ width: 15, height: 15, color: '#64748B', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
                      <p style={{ fontSize: small ? 12 : 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Profile Trigger Modal */}
              <UserProfileClient
                initialProfile={{
                  id: session.userId,
                  name: session.name,
                  email: session.email,
                  type: session.type,
                  phone: userDetails.phone,
                  city: userDetails.city,
                  gender: userDetails.gender,
                  address: userDetails.address,
                }}
              />

              {/* Sign out */}
              <Link
                href="/api/auth/candidate/logout"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, padding: '11px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                Sign Out
              </Link>
            </div>
          </div>

          {/* ── Right: welcome + resource cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Welcome banner */}
            <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 60%, #2563EB 100%)', borderRadius: 24, padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -50, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: 12 }}>
                  <Award style={{ width: 11, height: 11, color: '#FCD34D' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>Welcome back</span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Hello, {session.name.split(' ')[0]}!
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  Access your courses, join the community, and explore our knowledge base below.
                </p>
              </div>
            </div>

            {nextUpcomingBatch && (
              <BatchCountdown startDate={nextUpcomingBatch.startDate.toISOString()} batchName={nextUpcomingBatch.name} />
            )}

            {upcomingSessions.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CalendarDays style={{ width: 16, height: 16, color: '#1E40AF' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Upcoming Sessions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcomingSessions.slice(0, 6).map((s) => (
                    <div key={s.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 18, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 10 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }} />
                          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2563eb' }}>{s.status}</span>
                        </div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{s.title}</h4>
                        <p style={{ fontSize: 12, color: '#64748B' }}>
                          {s.courseTitle} · {s.batchName} · {s.trainerName}
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                          {new Date(s.sessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(s.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {s.meetLink && !s.meetLink.includes('sample-link') ? (
                        <a href={s.meetLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                          Join Meeting
                        </a>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                          Meeting link pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Training — enrolled batches, sessions, attendance */}
            {enrollments.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <GraduationCap style={{ width: 16, height: 16, color: '#1E40AF' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>My Training</h3>
                </div>
                <StudentTrainingPanel enrollments={enrollments} />
              </div>
            )}

            {/* My Assignments — coursework due, submission status, grades */}
            {assignments.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ClipboardList style={{ width: 16, height: 16, color: '#1E40AF' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>My Assignments</h3>
                </div>
                <AssignmentsPanel
                  assignments={assignments.map((a) => ({
                    ...a,
                    submissions: a.submissions.map((s) => ({ ...s, score: s.score?.toString() ?? null })),
                  }))}
                />
              </div>
            )}

            {/* 2×2 resource cards */}
            <div className="profile-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <Link href="/community" className="profile-resource-card">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Users style={{ width: 22, height: 22, color: '#1E40AF' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Community</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>Ask questions, share insights, and connect with fellow HR professionals.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#1E40AF' }}>
                  Join Discussion <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

              <Link href="/knowledge" className="profile-resource-card green">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <BookOpen style={{ width: 22, height: 22, color: '#16A34A' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Knowledge Base</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>Explore articles, guides, and resources curated for recruitment professionals.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
                  Explore Now <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

              <Link href="/profile/courses" className="profile-resource-card purple">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Award style={{ width: 22, height: 22, color: '#7C3AED' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>My Courses</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>View enrollment status, trainer assignment, and your live batch access.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>
                  Open Dashboard <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

              {session.type === 'student' && (
                <Link href="/profile/assessments" className="profile-resource-card">
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Sparkles style={{ width: 22, height: 22, color: '#1E40AF' }} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>AI Assessments</h4>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>View AI-analyzed results, personalized notes, and your study plan.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#1E40AF' }}>
                    View Results <ChevronRight style={{ width: 13, height: 13 }} />
                  </div>
                </Link>
              )}

              {session.type === 'student' && (
                <Link href="/profile/session-assessments" className="profile-resource-card">
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Brain style={{ width: 22, height: 22, color: '#7C3AED' }} />
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Session Assessments</h4>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>Topic-specific assessments released based on your attendance in each live session.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>
                    View Assessments <ChevronRight style={{ width: 13, height: 13 }} />
                  </div>
                </Link>
              )}

              <Link href="/profile/demo-completion" className="profile-resource-card green">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Sparkles style={{ width: 22, height: 22, color: '#16A34A' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Session Milestones</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>Preview the celebratory completion modal designed for completed sessions.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
                  Preview Milestone <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

              <Link href="/profile/certificate" className="profile-resource-card green">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Award style={{ width: 22, height: 22, color: '#B45309' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Course Certificate</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>View, download, and print your official verified course completion certificate.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#B45309' }}>
                  View Certificate <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

              <Link href="/contact" className="profile-resource-card amber">
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Briefcase style={{ width: 22, height: 22, color: '#D97706' }} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.01em' }}>Get Support</h4>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>Have a question? Reach out to our team and we&apos;ll help you get started.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#D97706' }}>
                  Contact Us <ChevronRight style={{ width: 13, height: 13 }} />
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}
