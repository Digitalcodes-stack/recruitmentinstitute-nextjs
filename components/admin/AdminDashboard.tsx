'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminLayout from './AdminLayout'
import {
  BookOpen, FileText, GraduationCap, Lightbulb, Mail, MessageCircle,
  Users2, CreditCard, UserCheck, HelpCircle, ArrowUpRight,
  CheckCircle2, Clock, Users, TrendingUp, Wifi,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */

interface RecentCandidate {
  id: number; name: string; email: string
  courseSelect: string | null; createdAt: string; acceptSignin: number
}
interface RecentContact {
  id: number; name: string; email: string; message: string; createdAt: string
}
interface RecentCourseLead {
  id: number; firstName: string; lastName: string | null
  email: string; contact: string | null; createdAt: string
}
interface RecentBlog {
  id: number; title: string; author: string | null
  isPublished: boolean; createdAt: string
}
interface Stats {
  blogs: { total: number; published: number }
  courses: { total: number; categories: number }
  contacts: number; subscribers: number
  candidates: { total: number; pending: number }
  community: { questions: number }
  knowledge: number; leads: { course: number }
  students: number; memberships: number; experts: number; faqs: number
  recent: {
    candidates: RecentCandidate[]
    contacts: RecentContact[]
    courseLeads: RecentCourseLead[]
    blogs: RecentBlog[]
  }
}

/* ── Helpers ────────────────────────────────────────────────── */

function fmt(n: number) { return n.toLocaleString('en-IN') }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

/* ── Design tokens ──────────────────────────────────────────── */

const C = {
  bg:         '#f2f4f7',
  white:      '#ffffff',
  border:     '#e6eaf0',
  borderSoft: '#f0f3f7',
  text:       '#0f172a',
  textMid:    '#475569',
  textSoft:   '#94a3b8',
  shadow:     '0 1px 4px rgba(15,23,42,0.07)',
  shadowMd:   '0 4px 16px rgba(15,23,42,0.09)',
  shadowLg:   '0 8px 32px rgba(15,23,42,0.12)',
  radius:     16,
  radiusSm:   10,
}

/* ── Primitive components ───────────────────────────────────── */

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white, borderRadius: C.radius,
      border: `1px solid ${C.border}`, boxShadow: C.shadow,
      ...style,
    }}>
      {children}
    </div>
  )
}

function PanelHeader({
  title, sub, action,
}: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      padding: '22px 28px 20px',
      borderBottom: `1px solid ${C.borderSoft}`,
    }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: C.textSoft, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function ViewAllBtn({ href }: { href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, color: '#2563eb',
        textDecoration: 'none', padding: '6px 12px',
        borderRadius: 8, background: 'transparent',
        transition: 'background 120ms',
        whiteSpace: 'nowrap',
      }}


    >
      View all <ArrowUpRight size={12} />
    </Link>
  )
}

function Skeleton({ h = 56, count = 4 }: { h?: number; count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '24px 28px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height: h, borderRadius: C.radiusSm,
          background: 'linear-gradient(90deg,#f1f5f9 25%,#e8ecf2 50%,#f1f5f9 75%)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, marginBottom: 12,
      }}>📭</div>
      <p style={{ fontSize: 13, color: C.textSoft, fontWeight: 500 }}>{msg}</p>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const today = useMemo(() =>
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }), [])

  const statCards = [
    { label: 'Candidates',       value: stats?.candidates.total   ?? 0, sub: `${stats?.candidates.pending ?? 0} pending`,    icon: UserCheck,    bg: '#eff6ff', color: '#2563eb', href: '/admin/candidates'  },
    { label: 'Students',         value: stats?.students           ?? 0, sub: 'Registered',                                   icon: GraduationCap,bg: '#f0fdf4', color: '#16a34a', href: '/admin/students'    },
    { label: 'Memberships',      value: stats?.memberships        ?? 0, sub: 'Active members',                               icon: CreditCard,   bg: '#faf5ff', color: '#7c3aed', href: '/admin/memberships' },
    { label: 'Subscribers',      value: stats?.subscribers        ?? 0, sub: 'Newsletter',                                   icon: Mail,         bg: '#fefce8', color: '#ca8a04', href: '/admin/subscribers' },
    { label: 'Courses',          value: stats?.courses.total      ?? 0, sub: `${stats?.courses.categories ?? 0} categories`, icon: BookOpen,     bg: '#fff1f2', color: '#e11d48', href: '/admin/courses'     },
    { label: 'Blog Posts',       value: stats?.blogs.total        ?? 0, sub: `${stats?.blogs.published ?? 0} published`,     icon: FileText,     bg: '#f0f9ff', color: '#0284c7', href: '/admin/blog'        },
    { label: 'Course Leads',     value: stats?.leads.course       ?? 0, sub: 'Enquiries',                                    icon: TrendingUp,   bg: '#fdf4ff', color: '#a21caf', href: '/admin/contacts'    },
    { label: 'Contact Messages', value: stats?.contacts           ?? 0, sub: 'Received',                                     icon: MessageCircle,bg: '#f8fafc', color: '#475569', href: '/admin/contacts'    },
    { label: 'Q&A Questions',    value: stats?.community.questions?? 0, sub: 'Community',                                    icon: HelpCircle,   bg: '#f7fee7', color: '#65a30d', href: '/admin/questions'   },
    { label: 'Knowledge Items',  value: stats?.knowledge          ?? 0, sub: 'Articles',                                     icon: Lightbulb,    bg: '#fff7ed', color: '#ea580c', href: '/admin/knowledge'   },
    { label: 'Experts',          value: stats?.experts            ?? 0, sub: 'Faculty',                                      icon: Users2,       bg: '#ecfeff', color: '#0891b2', href: '/admin/experts'     },
    { label: 'FAQs',             value: stats?.faqs               ?? 0, sub: 'Questions',                                    icon: Users,        bg: '#f0fdf4', color: '#15803d', href: '/admin/faqs'        },
  ]

  const quickLinks = [
    { label: 'Candidates',    href: '/admin/candidates',  icon: UserCheck,     bg: '#eff6ff', color: '#2563eb' },
    { label: 'Students',      href: '/admin/students',    icon: GraduationCap, bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Courses',       href: '/admin/courses',     icon: BookOpen,      bg: '#fff1f2', color: '#e11d48' },
    { label: 'Blog Posts',    href: '/admin/blog',        icon: FileText,      bg: '#f0f9ff', color: '#0284c7' },
    { label: 'Knowledge Base',href: '/admin/knowledge',   icon: Lightbulb,     bg: '#fff7ed', color: '#ea580c' },
    { label: 'FAQs',          href: '/admin/faqs',        icon: HelpCircle,    bg: '#f0fdf4', color: '#15803d' },
    { label: 'Memberships',   href: '/admin/memberships', icon: CreditCard,    bg: '#faf5ff', color: '#7c3aed' },
    { label: 'Subscribers',   href: '/admin/subscribers', icon: Mail,          bg: '#fefce8', color: '#ca8a04' },
  ]

  const TH_STYLE: React.CSSProperties = {
    padding: '14px 24px',
    fontSize: 10, fontWeight: 700,
    letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    color: C.textSoft,
    background: '#f8fafc',
    borderBottom: `1px solid ${C.borderSoft}`,
    textAlign: 'left' as const,
  }
  const TD_STYLE: React.CSSProperties = {
    padding: '18px 24px',
    fontSize: 13, color: C.textMid,
    borderBottom: `1px solid ${C.borderSoft}`,
    verticalAlign: 'middle',
  }

  return (
    <AdminLayout title="Dashboard">

      {/* ── Global keyframe for skeleton ── */}
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1 }
          50% { opacity:.45 }
        }
      `}</style>

      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── 1. Hero ──────────────────────────────────────── */}
        <div style={{
          borderRadius: 20,
          background: 'linear-gradient(130deg,#0c1a2e 0%,#13305c 50%,#1a4fac 100%)',
          boxShadow: '0 20px 56px rgba(15,23,42,0.22)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* decorative glow */}
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
            {/* left */}
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
                Admin Overview
              </span>
              <h1 style={{
                marginTop: 16,
                fontSize: 38, fontWeight: 900,
                lineHeight: 1.1, letterSpacing: '-0.02em',
                color: '#ffffff',
              }}>
                Recruitment Institute
              </h1>
              <p style={{
                marginTop: 12, maxWidth: 520,
                fontSize: 14, lineHeight: 1.8, color: '#94b8d8',
              }}>
                Your admin command center — manage candidates, courses, content and community from one place.
              </p>
            </div>
            {/* right */}
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

        {/* ── 2. Stats grid ────────────────────────────────── */}
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
            {loading
              ? statCards.map((_, i) => (
                  <div key={i} style={{
                    height: 148, borderRadius: C.radius,
                    background: '#fff', border: `1px solid ${C.border}`,
                    animation: 'pulse 1.6s ease-in-out infinite',
                  }} />
                ))
              : statCards.map(s => (
                  <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        height: '100%', borderRadius: C.radius,
                        background: C.white, border: `1px solid ${C.border}`,
                        boxShadow: C.shadow, padding: '26px 24px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'box-shadow 180ms, transform 180ms',
                      }}


                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textSoft }}>
                          {s.label}
                        </p>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <s.icon size={18} color={s.color} />
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: C.text }}>
                          {fmt(s.value)}
                        </p>
                        <p style={{ fontSize: 12, color: C.textSoft, marginTop: 8 }}>{s.sub}</p>
                      </div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>

        {/* ── 3. Recent Candidates + Course Enquiries ──────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Recent Candidates */}
          <Card>
            <PanelHeader
              title="Recent Candidates"
              sub="Latest registrations"
              action={<ViewAllBtn href="/admin/candidates" />}
            />
            {loading ? <Skeleton /> : !stats?.recent.candidates.length ? <Empty msg="No candidates yet." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Candidate', 'Course', 'Status', 'When'].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.candidates.map(c => (
                    <tr key={c.id}
                      style={{ transition: 'background 120ms' }}


                    >
                      <td style={TD_STYLE}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: C.textSoft, marginTop: 3 }}>{c.email}</p>
                      </td>
                      <td style={TD_STYLE}>{c.courseSelect ?? <span style={{ color: '#d1d5db' }}>—</span>}</td>
                      <td style={TD_STYLE}>
                        {c.acceptSignin === 1 ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: '#f0fdf4', color: '#15803d',
                            borderRadius: 20, padding: '5px 12px',
                            fontSize: 11, fontWeight: 700,
                          }}>
                            <CheckCircle2 size={11} /> Approved
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: '#fffbeb', color: '#b45309',
                            borderRadius: 20, padding: '5px 12px',
                            fontSize: 11, fontWeight: 700,
                          }}>
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>
                      <td style={{ ...TD_STYLE, color: C.textSoft, fontSize: 12 }}>{timeAgo(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Recent Course Enquiries */}
          <Card>
            <PanelHeader
              title="Recent Course Enquiries"
              sub="Latest lead submissions"
              action={<ViewAllBtn href="/admin/contacts" />}
            />
            {loading ? <Skeleton /> : !stats?.recent.courseLeads.length ? <Empty msg="No enquiries yet." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Phone', 'When'].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.courseLeads.map(l => (
                    <tr key={l.id}
                      style={{ transition: 'background 120ms' }}


                    >
                      <td style={{ ...TD_STYLE, fontWeight: 600, color: C.text }}>
                        {l.firstName}{l.lastName ? ` ${l.lastName}` : ''}
                      </td>
                      <td style={TD_STYLE}>{l.email}</td>
                      <td style={TD_STYLE}>{l.contact ?? <span style={{ color: '#d1d5db' }}>—</span>}</td>
                      <td style={{ ...TD_STYLE, color: C.textSoft, fontSize: 12 }}>{timeAgo(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* ── 4. Contact Messages + Blog Posts ─────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Contact Messages */}
          <Card>
            <PanelHeader
              title="Recent Contact Messages"
              sub="Latest inbox messages"
              action={<ViewAllBtn href="/admin/contacts" />}
            />
            {loading ? <Skeleton count={4} h={72} /> :
             !stats?.recent.contacts.length ? <Empty msg="No messages yet." /> : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.recent.contacts.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '16px 18px', borderRadius: C.radiusSm,
                    border: `1px solid ${C.borderSoft}`, background: '#fafbfd',
                    transition: 'border-color 120ms, box-shadow 120ms',
                  }}


                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MessageCircle size={17} color="#2563eb" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.name}</p>
                          <p style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>{c.email}</p>
                        </div>
                        <span style={{ fontSize: 11, color: C.textSoft, flexShrink: 0 }}>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p style={{
                        fontSize: 12, color: C.textMid, marginTop: 8,
                        lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {c.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Blog Posts */}
          <Card>
            <PanelHeader
              title="Recent Blog Posts"
              sub="Latest content activity"
              action={<ViewAllBtn href="/admin/blog" />}
            />
            {loading ? <Skeleton count={4} h={72} /> :
             !stats?.recent.blogs.length ? <Empty msg="No blog posts yet." /> : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.recent.blogs.map(b => (
                  <div key={b.id} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '16px 18px', borderRadius: C.radiusSm,
                    border: `1px solid ${C.borderSoft}`, background: '#fafbfd',
                    transition: 'border-color 120ms, box-shadow 120ms',
                  }}


                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={17} color="#4f46e5" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600, color: C.text, flex: 1,
                          display: '-webkit-box', WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {b.title}
                        </p>
                        <span style={{ fontSize: 11, color: C.textSoft, flexShrink: 0 }}>{timeAgo(b.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                        {b.author && <span style={{ fontSize: 11, color: C.textSoft }}>{b.author}</span>}
                        {b.isPublished
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#15803d' }}>
                              <CheckCircle2 size={11} /> Published
                            </span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#b45309' }}>
                              <Clock size={11} /> Draft
                            </span>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── 5. Quick navigation ───────────────────────────── */}
        <Card>
          <PanelHeader title="Quick Navigation" sub="Jump directly to any section" />
          <div style={{
            padding: '20px 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {quickLinks.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: C.radiusSm,
                  border: `1px solid ${C.borderSoft}`, background: '#fafbfd',
                  textDecoration: 'none',
                  transition: 'border-color 150ms, box-shadow 150ms, background 150ms',
                }}


              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: item.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.textMid }}>
                  {item.label}
                </span>
                <ArrowUpRight size={13} color="#cbd5e1" />
              </Link>
            ))}
          </div>
        </Card>

      </div>
    </AdminLayout>
  )
}
