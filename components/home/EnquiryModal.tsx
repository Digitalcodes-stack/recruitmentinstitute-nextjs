'use client'

import { useState, useEffect } from 'react'
import { X, Send, Phone, CheckCircle2, Award, Users, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
}

const trustPoints = [
  { icon: Users,        text: '5,000+ professionals trained' },
  { icon: Award,        text: 'Industry-recognised certificate' },
  { icon: CheckCircle2, text: '95% placement success rate' },
  { icon: Clock,        text: 'Flexible weekend & weekday batches' },
]

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', message: '' })
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Enquiry sent! Our counsellor will contact you shortly.')
        setForm({ name: '', email: '', mobile: '', message: '' })
        onClose()
      } else {
        toast.error(data.message || 'Failed to send enquiry')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (name: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: focused === name ? '2px solid #1E40AF' : '1.5px solid #E2E8F0',
    background: focused === name ? '#FAFBFF' : '#F8FAFC',
    color: '#0F172A',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.15s',
    boxShadow: focused === name ? '0 0 0 4px rgba(30,64,175,0.07)' : 'none',
    boxSizing: 'border-box',
  })

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '7px',
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ padding: '16px' }}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full flex overflow-hidden"
        style={{
          maxWidth: '820px',
          borderRadius: '24px',
          boxShadow: '0 32px 96px rgba(0,0,0,0.45)',
          maxHeight: '92vh',
        }}
      >

        {/* ── Left panel ── */}
        <div
          className="relative hidden md:flex flex-col justify-between overflow-hidden shrink-0"
          style={{
            width: '300px',
            background: 'linear-gradient(150deg, #0F172A 0%, #1E293B 45%, #1E3A8A 100%)',
            padding: '40px 32px',
          }}
        >
          {/* dot grid */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          {/* glow */}
          <div className="absolute bottom-0 right-0 pointer-events-none rounded-full"
            style={{ width: 200, height: 200, background: 'rgba(37,99,235,0.2)', filter: 'blur(60px)', transform: 'translate(40%,30%)' }} />
          <div className="absolute top-0 left-0 pointer-events-none rounded-full"
            style={{ width: 150, height: 150, background: 'rgba(59,130,246,0.12)', filter: 'blur(50px)', transform: 'translate(-30%,-30%)' }} />

          {/* top content */}
          <div className="relative z-10">
            {/* pill badge */}
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '50px',
              background: 'rgba(30,64,175,0.3)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#93C5FD', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '20px',
            }}>
              Free Counselling
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Start Your HR Career Today
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.75, marginBottom: '28px' }}>
              Talk to our expert counsellor for personalised guidance on course selection, batch timings, and fee structure.
            </p>

            {/* trust points */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trustPoints.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div style={{
                    width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA',
                  }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.4 }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* bottom phone */}
          <div className="relative z-10" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '28px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
              Call us directly
            </p>
            <a href="tel:+919975048884"
              className="flex items-center gap-2.5 font-bold transition-all"
              style={{ color: 'white', textDecoration: 'none', fontSize: '15px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#60A5FA' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
            >
              <Phone className="w-4 h-4" style={{ color: '#60A5FA' }} />
              +91 9975048884
            </a>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto" style={{ minWidth: 0 }}>

          {/* header */}
          <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Book a Free Callback
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                We respond within 30 minutes during working hours
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-xl cursor-pointer transition-all shrink-0"
              style={{ width: 36, height: 36, background: '#F1F5F9', color: '#64748B', border: 'none' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#EF4444'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#64748B'
              }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px 32px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* name + mobile row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={label}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Your full name"
                  style={field('name')}
                />
              </div>
              <div>
                <label style={label}>Mobile No. <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="tel" required
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  onFocus={() => setFocused('mobile')}
                  onBlur={() => setFocused(null)}
                  placeholder="+91 9XXXXXXXX"
                  style={field('mobile')}
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label style={label}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="your@email.com"
                style={field('email')}
              />
            </div>

            {/* message */}
            <div>
              <label style={label}>
                Message <span style={{ color: '#CBD5E1', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                rows={3}
                placeholder="Which course are you interested in? Any questions about batch timing, fees, or curriculum?"
                style={{ ...field('message'), resize: 'none' }}
              />
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                padding: '15px',
                fontSize: '14px',
                border: 'none',
                boxShadow: '0 8px 24px rgba(30,64,175,0.32)',
                opacity: loading ? 0.75 : 1,
                marginTop: '4px',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Sending Enquiry...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Enquiry — It&apos;s Free
                </>
              )}
            </button>

            {/* trust note */}
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: '#10B981', flexShrink: 0 }} />
              <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Your details are safe with us — no spam, ever.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
