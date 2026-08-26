'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  LogOut,
  CalendarDays,
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardCheck,
  BarChart3,
  Menu,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react'

interface Props {
  title: string
  trainerName: string
  children: React.ReactNode
  badgeText?: string
}

const NAV_ITEMS = [
  { href: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trainer/batches', label: 'Batches', icon: Users },
  { href: '/trainer/sessions', label: 'Sessions', icon: CalendarDays },
  { href: '/trainer/attendance', label: 'Attendance', icon: UserCheck },
  { href: '/trainer/assignments', label: 'Assignments', icon: ClipboardCheck },
  { href: '/trainer/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function TrainerLayout({ trainerName, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/trainer-login')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = trainerName
    ? trainerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TR'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: Brand / Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link
              href="/trainer/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
                }}
              >
                <GraduationCap style={{ width: 20, height: 20, color: '#ffffff' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Recruitment Institute
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Trainer
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              className="desktop-nav"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/trainer/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? '#1e40af' : '#64748b',
                      background: isActive ? '#eff6ff' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon
                      style={{
                        width: 15,
                        height: 15,
                        color: isActive ? '#1e40af' : '#94a3b8',
                      }}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: Quick Action & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Quick Action: Schedule Class */}
            <Link
              href="/trainer/sessions"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: '#ffffff',
                background: '#1e40af',
                boxShadow: '0 1px 3px rgba(30, 64, 175, 0.2)',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
              className="schedule-btn-desktop"
            >
              <Plus style={{ width: 15, height: 15 }} />
              <span>Schedule Class</span>
            </Link>

            {/* Vertical Separator */}
            <div
              style={{
                width: 1,
                height: 24,
                background: '#e2e8f0',
                margin: '0 4px',
              }}
              className="header-separator"
            />

            {/* Profile Dropdown Trigger */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 8px 4px 4px',
                  borderRadius: 100,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 100,
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initials}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e293b',
                    maxWidth: 110,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  className="profile-name-text"
                >
                  {trainerName}
                </span>
                <ChevronDown style={{ width: 14, height: 14, color: '#64748b' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    padding: '8px 6px',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{trainerName}</p>
                    <p style={{ fontSize: 11, color: '#64748b' }}>Authorized Trainer</p>
                  </div>
                  <Link
                    href="/trainer/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#334155',
                      textDecoration: 'none',
                    }}
                    className="dropdown-item"
                  >
                    <LayoutDashboard style={{ width: 14, height: 14, color: '#64748b' }} />
                    <span>Trainer Dashboard</span>
                  </Link>
                  <Link
                    href="/trainer/sessions"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#334155',
                      textDecoration: 'none',
                    }}
                    className="dropdown-item"
                  >
                    <CalendarDays style={{ width: 14, height: 14, color: '#64748b' }} />
                    <span>My Sessions</span>
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
                    className="dropdown-item logout"
                  >
                    <LogOut style={{ width: 14, height: 14, color: '#dc2626' }} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X style={{ width: 18, height: 18, color: '#0f172a' }} />
              ) : (
                <Menu style={{ width: 18, height: 18, color: '#0f172a' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '12px 16px 16px',
              background: '#ffffff',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/trainer/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#1e40af' : '#334155',
                    background: isActive ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  <Icon
                    style={{
                      width: 16,
                      height: 16,
                      color: isActive ? '#1e40af' : '#64748b',
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />
            <Link
              href="/trainer/sessions"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                color: '#ffffff',
                background: '#1e40af',
                textDecoration: 'none',
              }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              <span>Schedule Class</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main
        style={{
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
          padding: '28px 24px 48px',
          flex: 1,
        }}
      >
        {children}
      </main>

      <style jsx global>{`
        .nav-link:hover:not(.active) {
          color: #0f172a !important;
          background: #f1f5f9 !important;
        }
        .schedule-btn-desktop:hover {
          background: #1d4ed8 !important;
        }
        .dropdown-item:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }
        .dropdown-item.logout:hover {
          background: #fef2f2 !important;
          color: #b91c1c !important;
        }
        @media (min-width: 992px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 991px) {
          .desktop-nav {
            display: none !important;
          }
          .schedule-btn-desktop {
            display: none !important;
          }
          .header-separator {
            display: none !important;
          }
          .profile-name-text {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
