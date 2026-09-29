'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, ChevronDown, Phone, Mail,
  BookOpen, Award, Briefcase, GraduationCap, User, ArrowRight, Users, Building2, LogOut, Sparkles,
  TrendingUp, FileText, CheckCircle2
} from 'lucide-react'

type SessionUser = { name: string; email: string; type: string }

const loginOptions = [
  { label: 'Student Login', href: '/student-login', icon: <GraduationCap className="w-4 h-4" /> },
  { label: 'Membership Login', href: '/membership-login', icon: <Users className="w-4 h-4" /> },
  { label: 'Trainer Login', href: '/trainer-login', icon: <Building2 className="w-4 h-4" /> },
]

interface SubNavItem {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  iconStyle: { color: string; background: string }
  badge?: string
}

interface NavItem {
  id: string
  label: string
  href?: string
  children?: SubNavItem[]
  headTitle?: string
  headSub?: string
  footerNote?: string
  footerLink?: { label: string; href: string }
  dropdownAlign?: 'left' | 'center' | 'right'
  dropdownWidth?: number
}

const navItems: NavItem[] = [
  {
    id: 'training',
    label: 'Training',
    headTitle: 'TRAIN & CERTIFY',
    headSub: "India's #1 Recruitment & HR Training Certification Programs",
    dropdownAlign: 'left',
    dropdownWidth: 520,
    footerNote: 'All programs include practical assignments & certifications',
    footerLink: { label: 'Explore All Courses', href: '/courses' },
    children: [
      {
        label: 'AI for Recruitment',
        description: 'Flagship: Master AI sourcing, prompts & tools from JD to joining',
        href: '/ai-for-recruitment',
        icon: <Sparkles className="w-4 h-4" />,
        iconStyle: { color: '#4F46E5', background: '#EEF2FF' },
        badge: 'Flagship',
      },
      {
        label: 'End-to-End Recruitment Training',
        description: 'Master full lifecycle hiring across IT & non-IT domains',
        href: '/end-to-end-recruitment-training',
        icon: <Briefcase className="w-4 h-4" />,
        iconStyle: { color: '#E11D48', background: '#FFF1F2' },
      },
      {
        label: 'HR Courses for Beginners',
        description: 'Comprehensive foundation for freshers, switchers & junior HRs',
        href: '/hr-courses-for-beginners',
        icon: <GraduationCap className="w-4 h-4" />,
        iconStyle: { color: '#0284C7', background: '#F0F9FF' },
      },
      {
        label: 'Recruitment Career Starter',
        description: '4-week practical launchpad to crack high-paying recruitment roles',
        href: '/recruitment-career-starter',
        icon: <BookOpen className="w-4 h-4" />,
        iconStyle: { color: '#059669', background: '#ECFDF5' },
      },
      {
        label: 'Professional Recruitment Specialist',
        description: 'Advanced boolean search, talent mapping & client delivery mastery',
        href: '/professional-recruitment-specialist',
        icon: <Award className="w-4 h-4" />,
        iconStyle: { color: '#D97706', background: '#FFFBEB' },
      },
      {
        label: 'Advanced TA Masterclass',
        description: 'Strategic talent acquisition, hiring analytics & team leadership',
        href: '/advanced-recruitment-ta-masterclass',
        icon: <Users className="w-4 h-4" />,
        iconStyle: { color: '#7C3AED', background: '#F5F3FF' },
      },
    ],
  },
  {
    id: 'accelerator',
    label: 'Agency Accelerator',
    headTitle: 'BUILD & SCALE',
    headSub: 'Launch, Scale & Systemize Your Recruitment & Staffing Firm',
    dropdownAlign: 'center',
    dropdownWidth: 480,
    footerNote: 'Zero-to-scale agency infrastructure & founder advisory',
    footerLink: { label: 'Explore Accelerator Program', href: '/recruitment-business-accelerator' },
    children: [
      {
        label: 'Recruitment Business Accelerator',
        description: 'Flagship: Launch, scale & systemize a 6-7 figure recruitment firm',
        href: '/recruitment-business-accelerator',
        icon: <Award className="w-4 h-4" />,
        iconStyle: { color: '#059669', background: '#ECFDF5' },
        badge: 'High Impact',
      },
      {
        label: '1-on-1 Growth Consulting',
        description: 'Founder advisory, client acquisition pipelines & enterprise MSAs',
        href: '/recruitment-business-growth-consulting',
        icon: <TrendingUp className="w-4 h-4" />,
        iconStyle: { color: '#2563EB', background: '#EFF6FF' },
      },
      {
        label: 'HR Entrepreneurship Program',
        description: 'Turn your HR expertise into an independent profitable business',
        href: '/hr-entrepreneurship-program',
        icon: <Building2 className="w-4 h-4" />,
        iconStyle: { color: '#7C3AED', background: '#F5F3FF' },
      },
    ],
  },
  {
    id: 'corporate',
    label: 'Enterprise',
    headTitle: 'TRANSFORM',
    headSub: 'Custom Capability Building for Corporate HR & Talent Teams',
    dropdownAlign: 'center',
    dropdownWidth: 450,
    footerNote: 'Customized modules tailored to your corporate hiring goals',
    footerLink: { label: 'Schedule Corporate Consultation', href: '/contact' },
    children: [
      {
        label: 'Corporate Recruitment Training',
        description: 'Custom capability programs for internal TA teams & hiring managers',
        href: '/corporate-recruitment-training',
        icon: <Building2 className="w-4 h-4" />,
        iconStyle: { color: '#7C3AED', background: '#F5F3FF' },
      },
      {
        label: 'HR Corporate Training Course',
        description: 'Upskill your corporate recruiter cohort with enterprise workflows',
        href: '/hr-corporate-training-course',
        icon: <BookOpen className="w-4 h-4" />,
        iconStyle: { color: '#0284C7', background: '#F0F9FF' },
      },
    ],
  },
  {
    id: 'trainers',
    label: 'Faculty',
    href: '/trainers',
  },
  {
    id: 'resources',
    label: 'Resources',
    headTitle: 'ECOSYSTEM KNOWLEDGE',
    headSub: 'Playbooks, Community, Industry Research & Alumni Journeys',
    dropdownAlign: 'right',
    dropdownWidth: 460,
    footerNote: 'Join 10,000+ HR professionals, recruiters & agency founders',
    footerLink: { label: 'Visit Knowledge Hub', href: '/knowledge' },
    children: [
      {
        label: 'Knowledge Base & SOPs',
        description: 'Recruitment frameworks, sourcing cheatsheets & ready SOPs',
        href: '/knowledge',
        icon: <FileText className="w-4 h-4" />,
        iconStyle: { color: '#D97706', background: '#FFFBEB' },
      },
      {
        label: 'Industry Insights & Blog',
        description: 'Market trends, AI recruitment guides & deep talent analysis',
        href: '/blogs',
        icon: <BookOpen className="w-4 h-4" />,
        iconStyle: { color: '#2563EB', background: '#EFF6FF' },
      },
      {
        label: 'HR Community & Events',
        description: 'Peer networking, live masterclasses & recruitment meetups',
        href: '/community',
        icon: <Users className="w-4 h-4" />,
        iconStyle: { color: '#4F46E5', background: '#EEF2FF' },
      },
      {
        label: 'Alumni Success Stories',
        description: 'Real career transformations & agency launch testimonials',
        href: '/testimonials',
        icon: <CheckCircle2 className="w-4 h-4" />,
        iconStyle: { color: '#059669', background: '#ECFDF5' },
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
  },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    training: true,
    accelerator: false,
    corporate: false,
    resources: false,
  })
  const [loginOpen, setLoginOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const pathname = usePathname()
  const navContainerRef = useRef<HTMLDivElement>(null)
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

  // Close menus on page change
  useEffect(() => {
    setMobileOpen(false)
    setOpenDropdown(null)
    setLoginOpen(false)
  }, [pathname])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setLoginOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isNavActive = (item: NavItem) => {
    if (item.href) return pathname === item.href
    if (item.children) {
      if (item.id === 'training' && pathname.startsWith('/courses')) return true
      return item.children.some((child) => pathname === child.href)
    }
    return false
  }

  const toggleMobileGroup = (id: string) => {
    setMobileExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <header className={`header-root${scrolled ? ' header-root--scrolled' : ''}`}>

      {/* Top Bar */}
      <div className="header-topbar">
        <div className="container h-full flex items-center justify-between px-3 sm:px-4 md:px-6">
          {/* Left: Phone (Always visible) + Email (Desktop only) */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <a
              href="tel:+917385204165"
              className="header-topbar-link group"
              aria-label="Call Recruitment Institute at +91 7385204165"
            >
              <Phone className="w-3 h-3 text-sky-400 group-hover:text-white transition-colors shrink-0" />
              <span className="font-semibold text-slate-200 tracking-tight text-[11px] sm:text-xs">+91 7385204165</span>
            </a>
            <a
              href="mailto:support@recruitmentinstitute.in"
              className="header-topbar-link header-topbar-email group"
              aria-label="Email support@recruitmentinstitute.in"
            >
              <Mail className="w-3 h-3 text-sky-400 group-hover:text-white transition-colors shrink-0" />
              <span className="text-[11px] sm:text-xs">support@recruitmentinstitute.in</span>
            </a>
          </div>

          {/* Right: Student Membership + Separator + Login Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <Link
              href="/student-membership"
              className="header-topbar-link group"
              aria-label="Student Membership"
            >
              <GraduationCap className="w-3 h-3 text-indigo-400 group-hover:text-white transition-colors shrink-0 hidden xs:inline-block" />
              <span className="text-[11px] sm:text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                <span className="hidden sm:inline">Student </span>Membership
              </span>
            </Link>

            <span className="header-topbar-sep" aria-hidden="true">|</span>

            <div ref={loginDropdownRef} className="relative">
              <button
                onClick={() => setLoginOpen((v) => !v)}
                className="header-topbar-link header-topbar-login-btn group"
                aria-expanded={loginOpen}
                aria-label="Account Login Menu"
              >
                <User className="w-3 h-3 text-emerald-400 group-hover:text-white transition-colors shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                  {user ? user.name.split(' ')[0] : 'Login'}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${loginOpen ? 'rotate-180' : ''}`} />
              </button>

              {loginOpen && (
                <div className="header-login-dropdown animate-in fade-in slide-in-from-top-2 duration-150">
                  {user ? (
                    <>
                      <Link href="/profile" className="header-login-dropdown-item" onClick={() => setLoginOpen(false)}>
                        <User className="w-4 h-4 text-blue-600" /> My Profile
                      </Link>
                      <button onClick={handleSignOut} className="header-login-dropdown-item header-login-dropdown-item--btn text-red-600">
                        <LogOut className="w-4 h-4 text-red-600" /> Sign Out
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
                        <span>{opt.label}</span>
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
        <div className="container h-full flex items-center justify-between" ref={navContainerRef}>

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
          <ul className="hidden lg:flex items-center gap-0.5 xl:gap-1 h-full list-none m-0 p-0">
            {navItems.map((item) =>
              item.children ? (
                <li
                  key={item.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setOpenDropdown(item.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => setOpenDropdown((cur) => (cur === item.id ? null : item.id))}
                    className={`header-nav-btn${isNavActive(item) ? ' header-nav-btn--active' : ''}`}
                    aria-expanded={openDropdown === item.id}
                  >
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>

                  {openDropdown === item.id && (
                    <div
                      className="header-dropdown-wrap animate-in fade-in slide-in-from-top-2 duration-150"
                      style={{
                        left: item.dropdownAlign === 'left' ? '0' : item.dropdownAlign === 'right' ? 'auto' : '50%',
                        right: item.dropdownAlign === 'right' ? '0' : 'auto',
                        transform: item.dropdownAlign === 'center' ? 'translateX(-50%)' : 'none',
                        width: `${item.dropdownWidth || 480}px`,
                      }}
                    >
                      <div className="header-dropdown">
                        <div className="header-dropdown-head">
                          <p className="header-dropdown-head-title">{item.headTitle}</p>
                          <p className="header-dropdown-head-sub">{item.headSub}</p>
                        </div>
                        <div className="header-dropdown-body max-h-[460px] overflow-y-auto">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`header-dropdown-item group${pathname === child.href ? ' header-dropdown-item--active' : ''}`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="header-dropdown-icon" style={child.iconStyle}>
                                {child.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="header-dropdown-label group-hover:text-blue-600 transition-colors">
                                    {child.label}
                                  </p>
                                  {child.badge && (
                                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                                      {child.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="header-dropdown-desc">{child.description}</p>
                              </div>
                              <ArrowRight className="header-dropdown-arrow w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                            </Link>
                          ))}
                        </div>
                        {item.footerLink && (
                          <div className="header-dropdown-footer">
                            <span className="header-dropdown-footer-note">{item.footerNote}</span>
                            <Link
                              href={item.footerLink.href}
                              className="header-dropdown-footer-link"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {item.footerLink.label} <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={item.id} className="h-full flex items-center">
                  <Link
                    href={item.href || '#'}
                    className={`header-nav-link${isNavActive(item) ? ' header-nav-link--active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}

            <li className="header-nav-cta-wrap header-nav-cta-wrap--group ml-2 xl:ml-3">
              <Link href="/student-membership" className="header-cta-btn header-cta-btn--outline whitespace-nowrap">
                Enroll Now
              </Link>
              <Link href="/contact" className="header-cta-btn whitespace-nowrap">
                Demo Video
              </Link>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="header-mobile-toggle lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
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
            <button onClick={() => setMobileOpen(false)} className="header-mobile-close" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1 list-none m-0 p-0">
              {navItems.map((item) =>
                item.children ? (
                  <li key={item.id} className="border-b border-slate-100 last:border-b-0 pb-1 mb-1">
                    <button
                      onClick={() => toggleMobileGroup(item.id)}
                      className="header-mobile-nav-btn w-full flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800 text-sm">{item.label}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileExpanded[item.id] ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded[item.id] && (
                      <ul className="mt-1 ml-2 space-y-1 list-none m-0 p-0 border-l-2 border-blue-100 pl-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`header-mobile-sub-link flex items-center py-2 px-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors${pathname === child.href ? ' header-mobile-sub-link--active text-blue-700 font-bold bg-blue-50' : ''}`}
                              onClick={() => setMobileOpen(false)}
                            >
                              <span className="header-mobile-sub-icon mr-2.5 shrink-0" style={child.iconStyle}>
                                {child.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span>{child.label}</span>
                                  {child.badge && (
                                    <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                      {child.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                        {item.footerLink && (
                          <li className="pt-1">
                            <Link
                              href={item.footerLink.href}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1"
                              onClick={() => setMobileOpen(false)}
                            >
                              {item.footerLink.label} <ArrowRight className="w-3 h-3" />
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={item.id}>
                    <Link
                      href={item.href || '#'}
                      className={`header-mobile-nav-link text-sm font-semibold py-2 px-3 block rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition-colors${pathname === item.href ? ' header-mobile-nav-link--active text-blue-700 font-bold bg-blue-50' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
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
              <div className="flex flex-col gap-1.5 mb-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={loginOptions[0].href}
                    className="header-mobile-login-btn"
                    onClick={() => setMobileOpen(false)}
                  >
                    {loginOptions[0].icon}
                    <span>{loginOptions[0].label}</span>
                  </Link>
                  <Link
                    href={loginOptions[1].href}
                    className="header-mobile-login-btn"
                    onClick={() => setMobileOpen(false)}
                  >
                    {loginOptions[1].icon}
                    <span>{loginOptions[1].label}</span>
                  </Link>
                </div>
                <Link
                  href={loginOptions[2].href}
                  className="header-mobile-login-btn w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  {loginOptions[2].icon}
                  <span>{loginOptions[2].label}</span>
                </Link>
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
