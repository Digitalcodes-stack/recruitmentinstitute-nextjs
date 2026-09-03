import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { ShieldCheck, LockKeyhole, BellRing, Paintbrush, Users2, Laptop, Wifi, ArrowUpRight } from 'lucide-react'
import GoogleIntegrationPanel from '@/components/admin/GoogleIntegrationPanel'
import SiteStatsSettingsPanel from '@/components/admin/SiteStatsSettingsPanel'
import AdminProfileSettingsPanel from '@/components/admin/AdminProfileSettingsPanel'
import { getSiteStats } from '@/lib/site-stats'

const C = {
  white:      '#ffffff',
  border:     '#e6eaf0',
  borderSoft: '#f0f3f7',
  text:       '#0f172a',
  textMid:    '#475569',
  textSoft:   '#94a3b8',
  shadow:     '0 1px 4px rgba(15,23,42,0.07)',
  radius:     16,
}

export default async function AdminSettingsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sections = [
    { title: 'Profile Settings', desc: 'Update admin name, email, and profile information.', icon: Users2, bg: '#eff6ff', color: '#2563eb' },
    { title: 'Security Settings', desc: 'Manage passwords, sessions, and access protection.', icon: LockKeyhole, bg: '#fff1f2', color: '#e11d48' },
    { title: 'Role & Permissions', desc: 'Review permissions for different admin roles.', icon: ShieldCheck, bg: '#f0fdf4', color: '#16a34a' },
    { title: 'Notification Settings', desc: 'Control email and system notifications.', icon: BellRing, bg: '#fefce8', color: '#ca8a04' },
    { title: 'Branding Settings', desc: 'Adjust colors, logo, and portal branding.', icon: Paintbrush, bg: '#faf5ff', color: '#7c3aed' },
    { title: 'System Preferences', desc: 'Tweak platform defaults and admin behavior.', icon: Laptop, bg: '#f0f9ff', color: '#0284c7' },
  ]

  const [
    totalSessions, syncedSessions, pendingSessions, failedSessions,
    pendingJobs, processingJobs, failedJobs, completedJobs, recentFailedJobs,
    totalStudents, totalCourses, siteStats, currentAdmin
  ] =
    await Promise.all([
      prisma.session.count(),
      prisma.session.count({ where: { calendarSyncStatus: 'SYNCED' } }),
      prisma.session.count({ where: { calendarSyncStatus: 'PENDING' } }),
      prisma.session.count({ where: { calendarSyncStatus: 'FAILED' } }),
      prisma.jobQueue.count({ where: { status: 'pending' } }),
      prisma.jobQueue.count({ where: { status: 'processing' } }),
      prisma.jobQueue.count({ where: { status: 'failed' } }),
      prisma.jobQueue.count({ where: { status: 'completed' } }),
      prisma.jobQueue.findMany({
        where: { type: 'sync_calendar_event', status: 'failed' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, attempts: true, error: true, runAfter: true, updatedAt: true, payload: true },
      }),
      prisma.student.count(),
      prisma.course.count(),
      getSiteStats(),
      prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, contact: true, role: true },
      }),
    ])

  const autoSuggestions = {
    professionalsTrained: `${(5000 + totalStudents).toLocaleString('en-IN')}+`,
    programsAvailable: `${totalCourses || 6}`,
    industryExpertise: '10+ Yrs',
    placementSuccess: '95%',
  }

  const recentJobs = await prisma.jobQueue.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: { id: true, type: true, status: true, attempts: true, error: true, runAfter: true, updatedAt: true, payload: true },
  })

  const googleStatus = {
    config: {
      serviceAccountConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64),
      impersonateEmail: process.env.GOOGLE_IMPERSONATE_EMAIL ?? null,
      timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE ?? 'Asia/Kolkata',
      calendarScopes: ['https://www.googleapis.com/auth/calendar.events'],
    },
    stats: {
      totalSessions,
      syncedSessions,
      pendingSessions,
      failedSessions,
    },
    recentFailedJobs: recentFailedJobs.map((j) => ({ ...j, runAfter: j.runAfter.toISOString(), updatedAt: j.updatedAt.toISOString() })),
  }

  const jobStatus = {
    stats: {
      pending: pendingJobs,
      processing: processingJobs,
      failed: failedJobs,
      completed: completedJobs,
    },
    recent: recentJobs.map((j) => ({ ...j, runAfter: j.runAfter.toISOString(), updatedAt: j.updatedAt.toISOString() })),
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <AdminLayout title="Settings">
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Hero ─────────────────────────────────────────── */}
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
                System Control Center
              </span>
              <h1 style={{
                marginTop: 16,
                fontSize: 38, fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                Settings
              </h1>
              <p style={{
                marginTop: 12, maxWidth: 520,
                fontSize: 14, lineHeight: 1.8, color: '#94b8d8',
              }}>
                Manage access, branding, notifications, and live automation from a single workspace built for daily admin operations.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(34,197,94,0.13)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 24, padding: '8px 18px',
              }}>
                <Wifi size={13} color="#4ade80" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#86efac' }}>All services operational</span>
              </div>
              <p style={{ fontSize: 12, color: '#5a7a99' }}>{today}</p>
            </div>
          </div>
        </div>

        {/* ── Top-level stats ──────────────────────────────── */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: C.textSoft, marginBottom: 20,
          }}>
            At a glance
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
          }}>
            <StatTile label="Total Sessions" value={totalSessions} sub="All calendar sessions" icon={ShieldCheck} bg="#eff6ff" color="#2563eb" />
            <StatTile label="Synced" value={syncedSessions} sub="Calendar synced" icon={ShieldCheck} bg="#f0fdf4" color="#16a34a" />
            <StatTile label="Queued Jobs" value={pendingJobs + processingJobs} sub="Pending + processing" icon={ShieldCheck} bg="#fffbeb" color="#d97706" />
            <StatTile label="Failed Jobs" value={failedJobs} sub="Needs attention" icon={ShieldCheck} bg="#fff1f2" color="#e11d48" />
          </div>
        </div>

        {/* ── Settings groups ──────────────────────────────── */}
        <div>
          <p style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: C.textSoft, marginBottom: 20,
          }}>
            Workspace configuration
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 18,
          }}>
            {sections.map(({ title, desc, icon: Icon, bg, color }, index) => (
              <div
                key={title}
                style={{
                  borderRadius: C.radius,
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  boxShadow: C.shadow,
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={19} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSoft }}>0{index + 1}</span>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</h3>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: C.textMid }}>{desc}</p>
                  </div>
                  <ArrowUpRight size={15} color="#cbd5e1" style={{ flexShrink: 0 }} />
                </div>
                <div style={{
                  marginTop: 16, borderRadius: 10,
                  border: `1px dashed ${C.border}`, background: '#fafbfd',
                  padding: '10px 14px', fontSize: 12, color: C.textSoft,
                }}>
                  Coming soon — module not yet activated
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Administrator Profile & Account ─────────────── */}
        {currentAdmin && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: C.textSoft,
              }}>
                Administrator Account & Profile
              </p>
            </div>
            <AdminProfileSettingsPanel admin={currentAdmin} />
          </div>
        )}

        {/* ── Global Site Statistics ───────────────────────── */}
        <div>
          <SiteStatsSettingsPanel initialStats={siteStats} autoSuggestions={autoSuggestions} />
        </div>

        {/* ── Google Meet Automation ───────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: C.textSoft,
            }}>
              Automation — Google Meet Operations
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              borderRadius: 24, border: '1px solid #bae6fd', background: '#f0f9ff',
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0369a1',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
              Live sync
            </span>
          </div>
          <GoogleIntegrationPanel initialGoogleStatus={googleStatus} initialJobStatus={jobStatus} />
        </div>

      </div>
    </AdminLayout>
  )
}

function StatTile({
  label, value, sub, icon: Icon, bg, color,
}: { label: string; value: number; sub: string; icon: typeof ShieldCheck; bg: string; color: string }) {
  return (
    <div style={{
      borderRadius: C.radius,
      background: C.white, border: `1px solid ${C.border}`,
      boxShadow: C.shadow, padding: '26px 24px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textSoft }}>
          {label}
        </p>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: C.text }}>
          {value.toLocaleString('en-IN')}
        </p>
        <p style={{ fontSize: 12, color: C.textSoft, marginTop: 8 }}>{sub}</p>
      </div>
    </div>
  )
}
