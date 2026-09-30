'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const courseLinks = [
  { label: 'AI for Recruitment (Flagship)', href: '/ai-for-recruitment' },
  { label: 'End-to-End Recruitment Training', href: '/end-to-end-recruitment-training' },
  { label: 'HR Courses for Beginners', href: '/hr-courses-for-beginners' },
  { label: 'Recruitment Career Starter', href: '/recruitment-career-starter' },
  { label: 'Professional Recruitment Specialist', href: '/professional-recruitment-specialist' },
  { label: 'Advanced TA Masterclass', href: '/advanced-recruitment-ta-masterclass' },
  { label: 'View All Courses', href: '/courses' },
]

const ecosystemLinks = [
  { label: 'Recruitment Business Accelerator', href: '/recruitment-business-accelerator' },
  { label: '1-on-1 Growth Consulting', href: '/recruitment-business-growth-consulting' },
  { label: 'HR Entrepreneurship Program', href: '/hr-entrepreneurship-program' },
  { label: 'Corporate Recruitment Training', href: '/corporate-recruitment-training' },
  { label: 'HR Corporate Training Course', href: '/hr-corporate-training-course' },
  { label: 'Mentors & Faculty', href: '/trainers' },
  { label: 'Knowledge Base & SOPs', href: '/knowledge' },
]

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog & Articles', href: '/blogs' },
  { label: 'Community Forum', href: '/community' },
  { label: 'Success Stories', href: '/testimonials' },
  { label: 'Student Membership', href: '/student-membership' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Student Login', href: '/student-login' },
  { label: 'Membership Login', href: '/membership-login' },
  { label: 'Trainer Login', href: '/trainer-login' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Subscribed successfully!')
        setEmail('')
      } else {
        toast.error(data.message || 'Subscription failed')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="footer-root">
      <div className="footer-top-bar" />
      <div className="footer-glow-bottom" />
      <div className="footer-glow-top" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 footer-grid">

          {/* Brand column */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <div className="footer-logo-wrap">
                <Image
                  src="/assets/images/recruitment_insti_final_02.png"
                  alt="Recruitment Institute"
                  fill
                  className="object-contain footer-logo-img"
                />
              </div>
            </Link>

            <p className="footer-desc">
              India&apos;s Recruitment &amp; HR Growth Ecosystem. Empowering professionals to TRAIN, agency founders to BUILD &amp; SCALE, and enterprises to TRANSFORM talent capability.
            </p>

            <div className="flex flex-col gap-3">
              <a href="tel:+917385204165" className="footer-contact-link">
                <span className="footer-icon-box">
                  <Phone className="w-3.5 h-3.5 footer-icon-blue" />
                </span>
                +91 7385204165
              </a>
              <a href="mailto:support@recruitmentinstitute.in" className="footer-contact-link flex">
                <span className="footer-icon-box">
                  <Mail className="w-3.5 h-3.5 footer-icon-blue" />
                </span>
                <span className="break-all">support@recruitmentinstitute.in</span>
              </a>
              <div className="footer-address">
                <span className="footer-icon-box mt-0.5">
                  <MapPin className="w-3.5 h-3.5 footer-icon-blue" />
                </span>
                Pune, Maharashtra, India | Online Worldwide
              </div>
            </div>
          </div>

          {/* Courses column */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="footer-col-heading">Train &amp; Certify</h3>
              <div className="footer-col-divider" />
            </div>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {courseLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link text-xs">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 footer-nav-arrow" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Accelerator & Growth column */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="footer-col-heading">Build, Scale &amp; Enterprise</h3>
              <div className="footer-col-divider" />
            </div>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {ecosystemLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-nav-link text-xs">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 footer-nav-arrow" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="footer-col-heading">Stay Updated</h3>
              <div className="footer-col-divider" />
            </div>

            <p className="footer-newsletter-desc">
              Subscribe to get the latest HR tips, course updates and career resources straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="footer-email-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Subscribe"
                  className="footer-subscribe-btn absolute flex items-center justify-center"
                >
                  {loading
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="footer-no-spam">No spam, unsubscribe anytime.</p>
            </form>

            <div className="footer-hours-box">
              <h4 className="footer-hours-title">Working Hours</h4>
              <div className="flex flex-col gap-2">
                {[
                  ['Monday - Sunday', '9:00 AM - 7:00 PM', false],
                ].map(([day, hrs, isClosed]) => (
                  <div key={day as string} className="footer-hours-row">
                    <span className="footer-hours-day">{day}</span>
                    <span className={isClosed ? 'footer-hours-time-closed' : 'footer-hours-time-blue'}>{hrs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links & Portals strip */}
        <div className="border-t border-slate-800/80 pt-6 mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-slate-200 font-semibold">Portals &amp; Community:</span>
            {quickLinks.map((ql) => (
              <Link key={ql.href} href={ql.href} className="hover:text-blue-400 transition-colors">
                {ql.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="footer-copy text-xs sm:text-sm" suppressHydrationWarning>© {new Date().getFullYear()} Recruitment Institute. All rights reserved. Pune, Maharashtra, India.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">
            {[
              ['Privacy Policy', '/privacy'],
              ['Terms of Service', '/terms'],
              ['Sitemap', '/sitemap.xml'],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="footer-legal-link text-xs sm:text-sm">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
