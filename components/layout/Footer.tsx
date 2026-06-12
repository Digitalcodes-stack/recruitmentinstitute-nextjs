'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const courseLinks = [
  { label: 'End-to-End Recruitment Training', href: '/end-to-end-recruitment-training' },
  { label: 'HR Courses for Beginners', href: '/hr-courses-for-beginners' },
  { label: 'HR Entrepreneurship Program', href: '/hr-entrepreneurship-program' },
  { label: 'HR Corporate Training Course', href: '/hr-corporate-training-course' },
  { label: 'View All Courses', href: '/courses' },
]

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog & Articles', href: '/blogs' },
  { label: 'Knowledge Base', href: '/knowledge' },
  { label: 'Community Forum', href: '/community' },
  { label: 'Student Membership', href: '/student-membership' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Candidate Login', href: '/candidate-login' },
]

const socialLinks = [
  {
    label: 'Facebook', href: 'https://www.facebook.com/recruitmentinstitute',
    icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  {
    label: 'LinkedIn', href: 'https://www.linkedin.com/company/recruitment-institute',
    icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    label: 'Instagram', href: 'https://www.instagram.com/recruitmentinstitute',
    icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  },
  {
    label: 'YouTube', href: 'https://www.youtube.com/@recruitmentinstitute',
    icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" /></svg>,
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (data.success) { toast.success('Subscribed successfully!'); setEmail('') }
      else toast.error(data.message || 'Subscription failed')
    } catch { toast.error('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const linkStyle = { color: '#94A3B8', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }

  return (
    <footer style={{ background: '#0B1120', position: 'relative', overflow: 'hidden' }}>
      {/* Top accent */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg,#1E40AF,#3B82F6,#1E40AF)' }} />

      {/* Blobs */}
      <div className="absolute pointer-events-none" style={{ bottom: -192, left: -192, width: 500, height: 500, borderRadius: '50%', background: 'rgba(30,64,175,0.05)', filter: 'blur(60px)' }} />
      <div className="absolute pointer-events-none" style={{ top: -192, right: -192, width: 500, height: 500, borderRadius: '50%', background: 'rgba(59,130,246,0.05)', filter: 'blur(60px)' }} />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12" style={{ padding: '64px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Col 1 "" Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <div style={{ position: 'relative', width: 180, height: 48 }}>
                <Image src="/assets/images/recruitment_insti_final_02.png" alt="Recruitment Institute" fill className="object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
            </Link>

            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.75 }}>
              India&apos;s #1 Recruitment Training Institute. Empowering HR professionals, recruiters, and beginners with industry-leading practical training programs.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { href: 'tel:+917385204165', Icon: Phone, text: '+91 7385204165' },
                { href: 'mailto:support@recruitmentinstitute.in', Icon: Mail, text: 'support@recruitmentinstitute.in' },
              ].map(({ href, Icon, text }) => (
                <a key={text} href={href}
                  style={{ ...linkStyle }}

>
                  <span className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                  </span>
                  {text}
                </a>
              ))}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                <span className="flex items-center justify-center shrink-0 mt-0.5" style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                </span>
                Pune &amp; Bhor, Maharashtra, India
              </div>
            </div>

            <div className="flex gap-2">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}

>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 "" Courses */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', margin: 0 }}>Our Courses</h3>
              <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg,#1E40AF,#3B82F6)', borderRadius: 2, marginTop: 8 }} />
            </div>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {courseLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    style={{ ...linkStyle }}

>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" style={{ color: '#1E40AF' }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 "" Quick Links */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', margin: 0 }}>Quick Links</h3>
              <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg,#1E40AF,#3B82F6)', borderRadius: 2, marginTop: 8 }} />
            </div>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    style={{ ...linkStyle }}

>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: '#1E40AF' }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 "" Newsletter */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em', margin: 0 }}>Stay Updated</h3>
              <div style={{ width: 32, height: 3, background: 'linear-gradient(90deg,#1E40AF,#3B82F6)', borderRadius: 2, marginTop: 8 }} />
            </div>

            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.75 }}>
              Subscribe to get the latest HR tips, course updates, and career resources straight to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '12px 48px 12px 16px', color: 'white', fontSize: '14px', outline: 'none' }} />
                <button type="submit" disabled={loading} aria-label="Subscribe"
                  className="absolute flex items-center justify-center cursor-pointer disabled:opacity-50 transition-colors"
                  style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#1E40AF,#2563EB)', border: 'none', color: 'white' }}>
                  {loading
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p style={{ color: '#475569', fontSize: '12px' }}>No spam, unsubscribe anytime.</p>
            </form>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ color: 'white', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Working Hours</h4>
              <div className="flex flex-col gap-2">
                {[['Monday – Friday','9:00 AM – 7:00 PM'],['Saturday','10:00 AM – 5:00 PM'],['Sunday','Closed']].map(([day, hrs]) => (
                  <div key={day} className="flex justify-between" style={{ fontSize: '12px' }}>
                    <span style={{ color: '#64748B' }}>{day}</span>
                    <span style={{ color: day === 'Sunday' ? '#475569' : '#3B82F6', fontWeight: 600 }}>{hrs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3" style={{ padding: '20px 0', fontSize: '12px', color: '#475569' }}>
          <p style={{ margin: 0 }}>Â© {new Date().getFullYear()} Recruitment Institute. All rights reserved. Pune, Maharashtra, India.</p>
          <div className="flex items-center gap-5">
            {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Sitemap','/sitemap.xml']].map(([label,href]) => (
              <Link key={label} href={href}
                style={{ color: '#475569', textDecoration: 'none', fontSize: '12px', transition: 'color 0.2s' }}

>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}
