'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, ChevronDown, Phone, Mail,
  BookOpen, Award, Briefcase, GraduationCap, User, ArrowRight, Users, Building2, LogOut
} from 'lucide-react'

type SessionUser = { name: string; email: string; type: string }

const loginOptions = [
  { label: 'Student Login', href: '/student-login', icon: <GraduationCap className="w-4 h-4" /> },
  { label: 'Candidate Login', href: '/candidate-login', icon: <User className="w-4 h-4" /> },
  { label: 'Membership Login', href: '/membership-login', icon: <Users className="w-4 h-4" /> },
  { label: 'Trainer Login', href: '/trainer-login', icon: <Building2 className="w-4 h-4" /> },
]

const courses = [
  {
    label: 'End-to-End Recruitment Training',
    description: 'Master the full hiring lifecycle across all domains',
    href: '/end-to-end-recruitment-training',
    icon: <Briefcase className="w-5 h-5" />,
    iconStyle: { color: '#EF4444', background: '#FEF2F2' },
  },
  {
    label: 'HR Courses for Beginners',
    description: 'Foundation certification for freshers & switchers',
    href: '/hr-courses-for-beginners',
    icon: <GraduationCap className="w-5 h-5" />,
    iconStyle: { color: '#2563EB', background: '#EFF6FF' },
  },
  {
    label: 'HR Entrepreneurship Program',
    description: 'Launch and grow your own recruitment agency',
    href: '/hr-entrepreneurship-program',
    icon: <Award className="w-5 h-5" />,
    iconStyle: { color: '#059669', background: '#ECFDF5' },
  },
  {
    label: 'HR Corporate Training',
    description: 'Upskill your internal hiring team with custom modules',
    href: '/hr-corporate-training-course',
    icon: <BookOpen className="w-5 h-5" />,
    iconStyle: { color: '#7C3AED', background: '#F5F3FF' },
  },
]

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Courses', href: '/courses', children: courses },
  { label: 'Trainers', href: '/trainers' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
  { label: 'Community', href: '/community' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLLIElement>(null)
  const loginDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null))
      .catch(() => setUser(null))
  }, [pathname])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setLoginOpen(false)
    window.location.href = '/'
  }

  useEffect(() => { setMobileOpen(false); setCoursesOpen(false); setLoginOpen(false) }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCoursesOpen(false)
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) setLoginOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => pathname === href
  const isCourseActive = courses.some((c) => pathname === c.href) || pathname.startsWith('/courses')

  return (
    <header className={`header-root${scrolled ? ' header-root--scrolled' : ''}`}>

      {/* Top Bar */}
      <div className="header-topbar">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+917385204165" className="header-topbar-link">
              <Phone className="w-3 h-3 header-topbar-icon" />
              +91 7385204165
            </a>
            <a href="mailto:support@recruitmentinstitute.in" className="header-topbar-link hidden sm:flex">
              <Mail className="w-3 h-3 header-topbar-icon" />
              support@recruitmentinstitute.in
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student-membership" className="header-topbar-link hidden sm:block">
              Student Membership
            </Link>
            <span className="header-topbar-sep hidden sm:block">|</span>
            <div ref={loginDropdownRef} className="relative">
              <button
                onClick={() => setLoginOpen((v) => !v)}
                className="header-topbar-link header-topbar-login-btn"
                aria-expanded={loginOpen}
              >
                <User className="w-3 h-3" /> {user ? user.name.split(' ')[0] : 'Login'}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${loginOpen ? 'rotate-180' : ''}`} />
              </button>

              {loginOpen && (
                <div className="header-login-dropdown">
                  {user ? (
                    <>
                      <Link href="/profile" className="header-login-dropdown-item" onClick={() => setLoginOpen(false)}>
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <button onClick={handleSignOut} className="header-login-dropdown-item header-login-dropdown-item--btn">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    loginOptions.map((opt) => (
                      <Link
                        key={opt.href}
                        href={opt.href}
                        className="header-login-dropdown-item"
                        onClick={() => setLoginOpen(false)}
                      >
                        {opt.icon}
                        {opt.label}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`header-nav${scrolled ? ' header-nav--scrolled' : ''}`}>
        <div className="container h-full flex items-center justify-between">

          <Link href="/" aria-label="Recruitment Institute">
            <div className="header-logo-wrap">
              <Image
                src="/assets/images/recruitment_insti_final_02.png"
                alt="Recruitment Institute"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1 h-full list-none m-0 p-0">
            {navLinks.map((link) =>
              link.children ? (
                <li key={link.href} ref={dropdownRef} className="relative h-full flex items-center">
                  <button
                    onClick={() => setCoursesOpen(v => !v)}
                    className={`header-nav-btn${isCourseActive ? ' header-nav-btn--active' : ''}`}
                    aria-expanded={coursesOpen}
                  >
                    Courses
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {coursesOpen && (
                    <div className="header-dropdown-wrap">
                      <div className="header-dropdown">
                        <div className="header-dropdown-head">
                          <p className="header-dropdown-head-title">Our Training Programs</p>
                          <p className="header-dropdown-head-sub">India&apos;s #1 Recruitment Training Institute</p>
                        </div>
                        <div className="header-dropdown-body">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`header-dropdown-item${pathname === child.href ? ' header-dropdown-item--active' : ''}`}
                              onClick={() => setCoursesOpen(false)}
                            >
                              <div className="header-dropdown-icon" style={child.iconStyle}>
                                {child.icon}
                              </div>
                              <div className="min-w-0">
                                <p className="header-dropdown-label">{child.label}</p>
                                <p className="header-dropdown-desc">{child.description}</p>
                              </div>
                              <ArrowRight className="header-dropdown-arrow w-3.5 h-3.5" />
                            </Link>
                          ))}
                        </div>
                        <div className="header-dropdown-footer">
                          <span className="header-dropdown-footer-note">All programs include certification</span>
                          <Link href="/courses" className="header-dropdown-footer-link" onClick={() => setCoursesOpen(false)}>
                            View All <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.href} className="h-full flex items-center">
                  <Link
                    href={link.href}
                    className={`header-nav-link${isActive(link.href) ? ' header-nav-link--active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
            <li className="header-nav-cta-wrap header-nav-cta-wrap--group">
              <Link href="/student-membership" className="header-cta-btn header-cta-btn--outline">
                Enroll Now
              </Link>
              <Link href="/contact" className="header-cta-btn">
                Demo Video
              </Link>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="header-mobile-toggle lg:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`lg:hidden header-mobile-overlay${mobileOpen ? ' visible' : ' invisible'}`}>
        <div
          className={`header-mobile-backdrop${mobileOpen ? ' opacity-100' : ' opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        <div className={`header-mobile-drawer${mobileOpen ? ' translate-x-0' : ' translate-x-full'}`}>

          <div className="header-mobile-head">
            <div className="header-mobile-logo-wrap">
              <Image
                src="/assets/images/recruitment_insti_final_02.png"
                alt="Recruitment Institute"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <button onClick={() => setMobileOpen(false)} className="header-mobile-close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1 list-none m-0 p-0">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.href}>
                    <button
                      onClick={() => setMobileCoursesOpen(v => !v)}
                      className="header-mobile-nav-btn"
                    >
                      <span>Courses</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileCoursesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileCoursesOpen && (
                      <ul className="mt-1 ml-4 space-y-1 list-none m-0 p-0">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`header-mobile-sub-link${pathname === child.href ? ' header-mobile-sub-link--active' : ''}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              <span className="header-mobile-sub-icon" style={child.iconStyle}>
                                {child.icon}
                              </span>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`header-mobile-nav-link${isActive(link.href) ? ' header-mobile-nav-link--active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="header-mobile-footer">
            <a href="tel:+917385204165" className="header-mobile-phone">
              <Phone className="w-4 h-4 header-mobile-phone-icon" /> +91 7385204165
            </a>
            {user ? (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link href="/profile" className="header-mobile-login-btn" onClick={() => setMobileOpen(false)}>
                  My Profile
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false) }}
                  className="header-mobile-login-btn"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {loginOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    className="header-mobile-login-btn"
                    onClick={() => setMobileOpen(false)}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/student-membership"
                className="header-mobile-enroll-btn"
                onClick={() => setMobileOpen(false)}
              >
                Enroll Now
              </Link>
              <Link
                href="/contact"
                className="header-mobile-demo-btn"
                onClick={() => setMobileOpen(false)}
              >
                Demo Video
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
