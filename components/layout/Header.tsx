'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, ChevronDown, Phone, Mail,
  BookOpen, Award, Briefcase, GraduationCap, User, ArrowRight
} from 'lucide-react'

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
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setCoursesOpen(false) }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCoursesOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => pathname === href
  const isCourseActive = courses.some((c) => pathname === c.href) || pathname.startsWith('/courses')

  return (
    <header className="sticky top-0 z-50 w-full"
      style={{ transition: 'box-shadow 0.3s', boxShadow: scrolled ? '0 4px 24px rgba(15,23,42,0.10)' : 'none' }}>

      {/* ── Top Bar ─────────────────────────────────── */}
      <div style={{ background: '#0F172A', height: '40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+919975048884" className="flex items-center gap-1.5 transition-colors"
              style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
              <Phone className="w-3 h-3" style={{ color: '#3B82F6' }} />
              +91 9975048884
            </a>
            <a href="mailto:support@recruitmentinstitute.in"
              className="hidden sm:flex items-center gap-1.5 transition-colors"
              style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
              <Mail className="w-3 h-3" style={{ color: '#3B82F6' }} />
              support@recruitmentinstitute.in
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student-membership" className="hidden sm:block transition-colors"
              style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
              Student Membership
            </Link>
            <span className="hidden sm:block" style={{ color: '#374151' }}>|</span>
            <Link href="/candidate-login" className="flex items-center gap-1.5 transition-colors"
              style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
              <User className="w-3 h-3" /> Login
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Nav ────────────────────────────────── */}
      <nav style={{
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: '1px solid #F1F5F9',
        height: '80px',
        transition: 'all 0.3s',
      }}>
        <div className="container h-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" aria-label="Recruitment Institute">
            <div className="relative" style={{ width: 185, height: 50 }}>
              <Image src="/assets/images/recruitment_insti_final_02.png" alt="Recruitment Institute" fill className="object-contain" priority />
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1 h-full list-none m-0 p-0">
            {navLinks.map((link) =>
              link.children ? (
                <li key={link.href} ref={dropdownRef} className="relative h-full flex items-center">
                  <button
                    onClick={() => setCoursesOpen(v => !v)}
                    className="flex items-center gap-1 cursor-pointer border-0 rounded-xl transition-all duration-150"
                    style={{
                      padding: '8px 14px', fontSize: '14px', fontWeight: 600,
                      background: isCourseActive ? '#EFF6FF' : 'transparent',
                      color: isCourseActive ? '#1D4ED8' : '#334155',
                    }}
                    onMouseEnter={e => { setCoursesOpen(true); if (!isCourseActive) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1D4ED8' } }}
                    onMouseLeave={e => { if (!isCourseActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' } }}
                    aria-expanded={coursesOpen}>
                    Courses
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {coursesOpen && (
                    <div onMouseLeave={() => setCoursesOpen(false)}
                      className="absolute z-50" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '8px', width: 480 }}>
                      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(15,23,42,0.15)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', padding: '18px 24px' }}>
                          <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>Our Training Programs</p>
                          <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>India&apos;s #1 Recruitment Training Institute</p>
                        </div>
                        <div style={{ padding: '12px' }}>
                          {link.children.map((child) => (
                            <Link key={child.href} href={child.href}
                              className="flex items-center gap-3 rounded-xl transition-colors group/item"
                              style={{ padding: '12px', background: pathname === child.href ? '#EFF6FF' : 'transparent', textDecoration: 'none' }}
                              onMouseEnter={e => { if (pathname !== child.href) e.currentTarget.style.background = '#F8FAFC' }}
                              onMouseLeave={e => { if (pathname !== child.href) e.currentTarget.style.background = 'transparent' }}
                              onClick={() => setCoursesOpen(false)}>
                              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 40, height: 40, ...child.iconStyle }}>
                                {child.icon}
                              </div>
                              <div className="min-w-0">
                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{child.label}</p>
                                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0', lineHeight: 1.3 }}>{child.description}</p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: '#CBD5E1' }} />
                            </Link>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid #F1F5F9', padding: '10px 24px', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>All programs include certification</span>
                          <Link href="/courses" className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', textDecoration: 'none' }} onClick={() => setCoursesOpen(false)}>
                            View All <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.href} className="h-full flex items-center">
                  <Link href={link.href} className="rounded-xl transition-all duration-150"
                    style={{ padding: '8px 14px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'block',
                      background: isActive(link.href) ? '#EFF6FF' : 'transparent',
                      color: isActive(link.href) ? '#1D4ED8' : '#334155' }}
                    onMouseEnter={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLElement).style.color = '#1D4ED8' } }}
                    onMouseLeave={e => { if (!isActive(link.href)) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#334155' } }}>
                    {link.label}
                  </Link>
                </li>
              )
            )}
            <li style={{ marginLeft: '8px' }}>
              <Link href="/contact"
                className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', padding: '11px 22px', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(30,64,175,0.30)' }}>
                Book Free Demo
              </Link>
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="lg:hidden rounded-xl transition-colors"
            style={{ padding: '10px', color: '#0F172A' }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ────────────────────────────── */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)} />

        <div className={`absolute top-0 right-0 h-full bg-white flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: 320, boxShadow: '0 0 60px rgba(0,0,0,0.25)' }}>

          <div className="flex items-center justify-between px-5 py-4" style={{ background: '#0F172A' }}>
            <div className="relative" style={{ width: 150, height: 40 }}>
              <Image src="/assets/images/recruitment_insti_final_02.png" alt="Recruitment Institute" fill className="object-contain brightness-0 invert" />
            </div>
            <button onClick={() => setMobileOpen(false)} className="rounded-xl transition-colors"
              style={{ padding: '8px', color: 'rgba(255,255,255,0.7)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1 list-none m-0 p-0">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.href}>
                    <button onClick={() => setMobileCoursesOpen(v => !v)}
                      className="w-full flex items-center justify-between rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                      style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      <span>Courses</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileCoursesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileCoursesOpen && (
                      <ul className="mt-1 ml-4 space-y-1 list-none m-0 p-0">
                        {link.children.map((child) => (
                          <li key={child.href}>
                            <Link href={child.href} className="flex items-center gap-3 rounded-xl transition-all"
                              style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                                color: pathname === child.href ? '#1D4ED8' : '#334155',
                                background: pathname === child.href ? '#EFF6FF' : 'transparent' }}
                              onClick={() => setMobileOpen(false)}>
                              <span className="rounded-lg flex items-center justify-center" style={{ width: 28, height: 28, ...child.iconStyle }}>
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
                    <Link href={link.href} className="flex items-center rounded-xl transition-all"
                      style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                        color: isActive(link.href) ? '#1D4ED8' : '#0F172A',
                        background: isActive(link.href) ? '#EFF6FF' : 'transparent' }}
                      onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="p-4 space-y-3" style={{ borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <a href="tel:+919975048884" className="flex items-center gap-2 font-bold" style={{ fontSize: '14px', color: '#0F172A', textDecoration: 'none' }}>
              <Phone className="w-4 h-4" style={{ color: '#1D4ED8' }} /> +91 9975048884
            </a>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/candidate-login" className="text-center font-bold rounded-xl transition-all hover:-translate-y-0.5"
                style={{ padding: '11px 0', fontSize: '13px', background: '#0F172A', color: 'white', textDecoration: 'none', display: 'block' }}
                onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/contact" className="text-center font-bold text-white rounded-xl transition-all hover:-translate-y-0.5"
                style={{ padding: '11px 0', fontSize: '13px', background: 'linear-gradient(135deg,#1E40AF,#2563EB)', textDecoration: 'none', display: 'block' }}
                onClick={() => setMobileOpen(false)}>Book Free Demo</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
