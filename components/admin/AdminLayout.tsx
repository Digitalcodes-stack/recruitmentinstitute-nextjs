'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, MessageSquare, Lightbulb,
  Mail, LogOut, Menu, X, Info, Star, HelpCircle, Settings2, ExternalLink,
  Database, UserCheck, GraduationCap, CreditCard, Users2, IndianRupee,
  MessageCircleQuestion, BarChart3, Bell, Search, ChevronDown, Building2,
  Presentation, Layers3, ClipboardList, ListChecks, CalendarDays, Plus,
  ShieldCheck, ArrowUpRight, Sparkles, PhoneCall,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ style?: React.CSSProperties; className?: string }>
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Superadmin Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Training Hub',
    items: [
      { label: 'Batches',     href: '/admin/batches',     icon: Layers3 },
      { label: 'Live Sessions', href: '/admin/sessions',   icon: CalendarDays, badge: 'Live' },
      { label: 'Enrollments', href: '/admin/enrollments', icon: ClipboardList },
      { label: 'Assignments', href: '/admin/assignments', icon: ClipboardList },
      { label: 'Assessments', href: '/admin/assessments', icon: ListChecks },
    ],
  },
  {
    label: 'People & Faculty',
    items: [
      { label: 'Students',    href: '/admin/students',    icon: GraduationCap },
      { label: 'Trainers',    href: '/admin/trainers',    icon: Presentation },
      { label: 'Candidates',  href: '/admin/candidates',  icon: UserCheck },
      { label: 'Memberships', href: '/admin/memberships', icon: CreditCard },
      { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
      { label: 'Experts',     href: '/admin/experts',     icon: Users2 },
    ],
  },
  {
    label: 'Content & LMS',
    items: [
      { label: 'Courses',          href: '/admin/courses',   icon: BookOpen },
      { label: 'Course Brochures', href: '/admin/brochures', icon: Sparkles, badge: 'New' },
      { label: 'FAQs',             href: '/admin/faqs',      icon: HelpCircle },
      { label: 'Knowledge Base',   href: '/admin/knowledge', icon: Lightbulb },
      { label: 'Q & A',            href: '/admin/questions', icon: MessageCircleQuestion },
      { label: 'Blog Posts',       href: '/admin/blog',      icon: FileText },
    ],
  },
  {
    label: 'Finance & Revenue',
    items: [
      { label: 'Finance Dashboard', href: '/admin/finance', icon: CreditCard },
      { label: 'Fee Accounts',      href: '/admin/fees',    icon: IndianRupee },
      { label: 'Course Reviews',    href: '/admin/reviews', icon: BarChart3 },
    ],
  },
  {
    label: 'Inbox & Operations',
    items: [
      { label: 'Contact & Voice Leads', href: '/admin/contacts', icon: PhoneCall, badge: 'Priya' },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    ],
  },
  {
    label: 'Brand & System',
    items: [
      { label: 'About Us',     href: '/admin/about',        icon: Info },
      { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
      // { label: 'Services',     href: '/admin/services',     icon: Settings2 }, // COMMENTED OUT PER USER REQUEST
      { label: 'Client Logos', href: '/admin/clients',      icon: Building2 },
      { label: 'Site Settings',href: '/admin/settings',     icon: Settings2 },
      { label: 'Database Log', href: '/admin/database',     icon: Database },
    ],
  },
]

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const pathname = usePathname()
  const router = useRouter()
  const profileRef = useRef<HTMLDivElement>(null)
  const quickActionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/notifications/alerts-count')
      .then((res) => res.json())
      .then((data) => setAlertCount(data?.data?.count ?? 0))
      .catch(() => {})
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setQuickActionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const SIDEBAR_W = sidebarOpen ? 264 : 76
  const HEADER_H = 64

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>

      {/* ── Left Sidebar (Desktop) ─────────────────────────────────── */}
      <aside
        style={{
          width: SIDEBAR_W,
          minWidth: SIDEBAR_W,
          background: '#090d16',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 240ms cubic-bezier(.4,0,.2,1), min-width 240ms cubic-bezier(.4,0,.2,1)',
          zIndex: 40,
        }}
        className="admin-sidebar-desktop"
      >
        {/* Brand Header */}
        <div
          style={{
            height: HEADER_H,
            display: 'flex',
            alignItems: 'center',
            gap: sidebarOpen ? 12 : 0,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            padding: sidebarOpen ? '0 18px' : '0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            RI
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 13.5, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                Recruitment Institute
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                  }}
                >
                  Superadmin
                </span>
                <span style={{ fontSize: 10, color: '#64748b' }}>v2.6</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 10px',
            scrollbarWidth: 'thin',
          }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              {sidebarOpen && (
                <p
                  style={{
                    color: '#475569',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    padding: '0 10px',
                    marginBottom: 6,
                  }}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: sidebarOpen ? 10 : 0,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      padding: sidebarOpen ? '8px 12px' : '9px 0',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: active ? 700 : 500,
                      color: active ? '#ffffff' : '#94a3b8',
                      background: active
                        ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.08) 100%)'
                        : 'transparent',
                      textDecoration: 'none',
                      marginBottom: 2,
                      position: 'relative',
                      borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    className="admin-nav-item"
                  >
                    <Icon
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                        color: active ? '#60a5fa' : '#64748b',
                      }}
                    />
                    {sidebarOpen && (
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                    {sidebarOpen && item.badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 100,
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          border: '1px solid rgba(74, 222, 128, 0.3)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Quick Cross-Role Portal Links */}
        <div
          style={{
            padding: '12px 10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            background: 'rgba(0, 0, 0, 0.2)',
            flexShrink: 0,
          }}
        >
          {sidebarOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Role Views
                </span>
                <span style={{ fontSize: 10, color: '#38bdf8' }}>Instant Switch</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Link
                  href="/trainer/dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#93c5fd',
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    textDecoration: 'none',
                  }}
                  title="Open Trainer Portal"
                >
                  <Presentation style={{ width: 12, height: 12 }} />
                  Trainer
                </Link>
                <Link
                  href="/student-login"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#86efac',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    textDecoration: 'none',
                  }}
                  title="Open Student Portal"
                >
                  <GraduationCap style={{ width: 12, height: 12 }} />
                  Student
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/trainer/dashboard" title="Switch to Trainer Portal" style={{ color: '#93c5fd' }}>
                <Presentation style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Application Viewport ─────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top Header Bar */}
        <header
          style={{
            height: HEADER_H,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '0 28px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          {/* Left section: Toggle + Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Sidebar toggle button (desktop) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                flexShrink: 0,
              }}
              className="toggle-sidebar-btn"
              aria-label="Toggle sidebar"
            >
              <Menu style={{ width: 16, height: 16 }} />
            </button>

            {/* Mobile drawer toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0f172a',
                flexShrink: 0,
              }}
              className="toggle-mobile-menu-btn"
              aria-label="Open mobile menu"
            >
              <Menu style={{ width: 18, height: 18 }} />
            </button>

            {/* Page title & breadcrumb */}
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {title || 'Dashboard'}
              </p>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                Recruitment Institute <span style={{ color: '#cbd5e1' }}>/</span> Admin Hub
              </p>
            </div>
          </div>

          {/* Center search bar */}
          <div
            style={{
              flex: 1,
              maxWidth: 380,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '0 12px',
              height: 38,
            }}
            className="header-search-box"
          >
            <Search style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
            <input
              placeholder="Search students, batches, courses, trainers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12.5,
                color: '#1e293b',
              }}
            />
            <kbd
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#94a3b8',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                padding: '2px 5px',
              }}
            >
              ⌘K
            </kbd>
          </div>

          {/* Right section: Quick Action, Status, Notifications & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* Quick Action Launcher (+ Action) */}
            <div style={{ position: 'relative' }} ref={quickActionRef}>
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  cursor: 'pointer',
                }}
                className="header-quick-action-btn"
              >
                <Plus style={{ width: 14, height: 14 }} />
                <span>Create</span>
                <ChevronDown style={{ width: 12, height: 12 }} />
              </button>

              {/* Quick Action Dropdown Menu */}
              {quickActionOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    padding: '6px',
                    zIndex: 60,
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', padding: '6px 10px', letterSpacing: '0.1em' }}>
                    Quick Operations
                  </p>
                  <Link
                    href="/admin/batches/new"
                    onClick={() => setQuickActionOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <Layers3 style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <span>Create New Batch</span>
                  </Link>
                  <Link
                    href="/admin/courses/new"
                    onClick={() => setQuickActionOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <BookOpen style={{ width: 14, height: 14, color: '#0891b2' }} />
                    <span>Add New Course</span>
                  </Link>
                  <Link
                    href="/admin/trainers/new"
                    onClick={() => setQuickActionOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <Presentation style={{ width: 14, height: 14, color: '#7c3aed' }} />
                    <span>Onboard Trainer</span>
                  </Link>
                  <Link
                    href="/admin/notifications/new"
                    onClick={() => setQuickActionOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <Bell style={{ width: 14, height: 14, color: '#d97706' }} />
                    <span>Broadcast Message</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Operational status pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 100,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                fontSize: 11.5,
                fontWeight: 600,
              }}
              className="status-pill"
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.25)',
                }}
              />
              <span>System Live</span>
            </div>

            {/* Notification Bell */}
            <Link
              href="/admin/notifications"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                position: 'relative',
                textDecoration: 'none',
              }}
              title="Notifications"
            >
              <Bell style={{ width: 15, height: 15 }} />
              {alertCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: 9.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid #ffffff',
                  }}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Link>

            {/* Admin Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 4px',
                  borderRadius: 100,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  SA
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.15 }} className="profile-text">
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Administrator</p>
                  <p style={{ fontSize: 10, color: '#64748b' }}>Super Admin</p>
                </div>
                <ChevronDown style={{ width: 13, height: 13, color: '#94a3b8' }} />
              </button>

              {/* Profile Dropdown Drawer */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 230,
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                    padding: '6px',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Super Administrator</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>admin@institute.com</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <Settings2 style={{ width: 14, height: 14, color: '#64748b' }} />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: '#334155', textDecoration: 'none',
                    }}
                    className="quick-menu-item"
                  >
                    <ExternalLink style={{ width: 14, height: 14, color: '#64748b' }} />
                    <span>Public Website</span>
                  </Link>
                  <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    className="quick-menu-item logout"
                  >
                    <LogOut style={{ width: 14, height: 14, color: '#dc2626' }} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── Main Scroll Area ────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            padding: '32px 32px 64px',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
          }}
        >
          <div
            style={{
              width: 280,
              background: '#090d16',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Recruitment Institute</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {NAV_GROUPS.map((g) => (
                <div key={g.label} style={{ marginBottom: 16 }}>
                  <p style={{ color: '#475569', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                    {g.label}
                  </p>
                  {g.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        color: pathname === it.href ? '#fff' : '#94a3b8',
                        background: pathname === it.href ? 'rgba(37,99,235,0.25)' : 'transparent',
                        textDecoration: 'none',
                        marginBottom: 2,
                      }}
                    >
                      <it.icon style={{ width: 16, height: 16 }} />
                      <span>{it.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Global CSS Enhancements */}
      <style jsx global>{`
        .admin-nav-item:hover:not([style*="linear-gradient"]) {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .quick-menu-item:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }
        .quick-menu-item.logout:hover {
          background: #fef2f2 !important;
          color: #b91c1c !important;
        }
        @media (max-width: 991px) {
          .admin-sidebar-desktop {
            display: none !important;
          }
          .toggle-sidebar-btn {
            display: none !important;
          }
          .toggle-mobile-menu-btn {
            display: flex !important;
          }
          .header-search-box {
            display: none !important;
          }
          .profile-text {
            display: none;
          }
          .status-pill {
            display: none !important;
          }
        }
        @media (min-width: 992px) {
          .toggle-mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
