'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, MessageSquare, Lightbulb,
  Mail, LogOut, Menu, Info, Star, HelpCircle, Settings2, ExternalLink,
  Database, UserCheck, GraduationCap, CreditCard, Users2, IndianRupee,
  MessageCircleQuestion, BarChart3, Bell, Search, ChevronDown, Building2,
  Presentation, Layers3, ClipboardList,
} from 'lucide-react'
import toast from 'react-hot-toast'

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blog Posts',     href: '/admin/blog',      icon: FileText },
      { label: 'Courses',        href: '/admin/courses',   icon: BookOpen },
      { label: 'FAQs',           href: '/admin/faqs',      icon: HelpCircle },
      { label: 'Knowledge Base', href: '/admin/knowledge', icon: Lightbulb },
      { label: 'Q & A',          href: '/admin/questions', icon: MessageCircleQuestion },
    ],
  },
  {
    label: 'Training',
    items: [
      { label: 'Batches', href: '/admin/batches', icon: Layers3 },
      { label: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Candidates',  href: '/admin/candidates',  icon: UserCheck },
      { label: 'Students',    href: '/admin/students',    icon: GraduationCap },
      { label: 'Trainers',    href: '/admin/trainers',    icon: Presentation },
      { label: 'Memberships', href: '/admin/memberships', icon: CreditCard },
      { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
      { label: 'Experts',     href: '/admin/experts',     icon: Users2 },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Finance Dashboard', href: '/admin/finance', icon: CreditCard },
      { label: 'Fees',    href: '/admin/fees',    icon: IndianRupee },
      { label: 'Reviews', href: '/admin/reviews', icon: BarChart3 },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { label: 'Contact Submissions', href: '/admin/contacts', icon: MessageSquare },
    ],
  },
  {
    label: 'Brand',
    items: [
      { label: 'About Us',     href: '/admin/about',        icon: Info },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
      { label: 'Services',     href: '/admin/services',     icon: Settings2 },
      { label: 'Client Logos', href: '/admin/clients',      icon: Building2 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings2 },
      { label: 'Database', href: '/admin/database', icon: Database },
    ],
  },
]

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [open, setOpen] = useState(true)
  const pathname = usePathname()
  const router   = useRouter()

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const SIDEBAR_W  = open ? 260 : 68
  const HEADER_H   = 68

  return (
    <div className="flex min-h-screen" style={{ background: '#f2f4f7' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: SIDEBAR_W,
          minWidth: SIDEBAR_W,
          background: '#0b1829',
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 280ms cubic-bezier(.4,0,.2,1), min-width 280ms cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: HEADER_H,
            display: 'flex',
            alignItems: 'center',
            gap: open ? 12 : 0,
            justifyContent: open ? 'flex-start' : 'center',
            padding: open ? '0 20px' : '0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 13, color: '#fff',
          }}>
            RI
          </div>
          {open && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
                Recruitment Institute
              </p>
              <p style={{ color: '#3d5a76', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
                Admin Portal
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 10px', scrollbarWidth: 'none' }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 24 }}>
              {open && (
                <p style={{
                  color: '#2d4a63', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  padding: '0 10px', marginBottom: 6,
                }}>
                  {group.label}
                </p>
              )}
              {group.items.map(item => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!open ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: open ? 10 : 0,
                      justifyContent: open ? 'flex-start' : 'center',
                      padding: open ? '9px 12px' : '10px 0',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      color: active ? '#fff' : '#5a7b96',
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      textDecoration: 'none',
                      marginBottom: 2,
                      position: 'relative',
                      transition: 'color 120ms, background 120ms',
                    }}
                    className="group"


                  >
                    {active && (
                      <span style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 3, height: 20, background: '#60a5fa', borderRadius: '0 4px 4px 0',
                      }} />
                    )}
                    <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.75 }} />
                    {open && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: open ? 10 : 0, justifyContent: open ? 'flex-start' : 'center',
              padding: open ? '9px 12px' : '10px 0',
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: '#5a7b96', background: 'transparent',
              border: 'none', cursor: 'pointer', transition: 'color 120ms, background 120ms',
            }}


            title={!open ? 'Logout' : undefined}
          >
            <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <header style={{
          height: HEADER_H, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 32px',
          background: '#ffffff',
          borderBottom: '1px solid #e4e8ee',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>

          {/* Toggle */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              width: 36, height: 36, borderRadius: 8, border: '1px solid #e4e8ee',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', flexShrink: 0, transition: 'background 120ms',
            }}


            aria-label="Toggle sidebar"
          >
            <Menu style={{ width: 16, height: 16 }} />
          </button>

          {/* Page title */}
          <div style={{ marginRight: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{title || 'Dashboard'}</p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>Recruitment Institute</p>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', gap: 10,
            background: '#f8fafc', border: '1px solid #e4e8ee', borderRadius: 24,
            padding: '0 16px', height: 38 }}>
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              placeholder="Search candidates, courses, posts…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: '#334155' }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Bell */}
          <button style={{
            width: 38, height: 38, borderRadius: '50%', border: '1px solid #e4e8ee',
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <Bell style={{ width: 15, height: 15, color: '#64748b' }} />
          </button>

          {/* Admin chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #e4e8ee', borderRadius: 24,
            padding: '5px 14px 5px 6px', flexShrink: 0,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 12,
            }}>A</div>
            <div style={{ lineHeight: 1.3 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Admin</p>
              <p style={{ fontSize: 10, color: '#94a3b8' }}>Recruitment Institute</p>
            </div>
            <ChevronDown style={{ width: 13, height: 13, color: '#94a3b8' }} />
          </div>

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 24, padding: '6px 14px', flexShrink: 0,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d', whiteSpace: 'nowrap' }}>
              All services operational
            </span>
          </div>

          {/* Date */}
          <div style={{
            background: '#f8fafc', border: '1px solid #e4e8ee',
            borderRadius: 24, padding: '6px 14px',
            fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {today}
          </div>

          {/* View site */}
          <Link
            href="/"
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, color: '#64748b',
              textDecoration: 'none', flexShrink: 0 }}


          >
            <ExternalLink style={{ width: 13, height: 13 }} />
            View Website
          </Link>
        </header>

        {/* Page scroll area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px 40px 60px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
