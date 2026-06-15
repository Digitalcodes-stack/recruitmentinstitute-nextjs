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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ padding: '16px' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="enquiry-backdrop" onClick={onClose} />

      <div className="enquiry-modal">

        {/* ── Left panel ── */}
        <div className="enquiry-left hidden md:flex">
          <div className="enquiry-left-dots" />
          <div className="enquiry-left-glow-br" />
          <div className="enquiry-left-glow-tl" />

          <div className="relative z-10">
            <div className="enquiry-pill">Free Counselling</div>

            <h2 className="enquiry-left-heading">Start Your HR Career Today</h2>
            <p className="enquiry-left-desc">
              Talk to our expert counsellor for personalised guidance on course selection, batch timings, and fee structure.
            </p>

            <ul className="enquiry-trust-list">
              {trustPoints.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="enquiry-trust-icon">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="enquiry-trust-text">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="enquiry-left-footer relative z-10">
            <p className="enquiry-call-label">Call us directly</p>
            <a href="tel:+917385204165" className="enquiry-call-link">
              <Phone className="enquiry-call-icon" />
              +91 7385204165
            </a>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="enquiry-right">

          <div className="enquiry-right-head">
            <div>
              <h3 className="enquiry-right-title">Book a Free Callback</h3>
              <p className="enquiry-right-sub">We respond within 30 minutes during working hours</p>
            </div>
            <button onClick={onClose} className="enquiry-close-btn" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="enquiry-form">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="enquiry-label">
                  Full Name <span className="enquiry-required">*</span>
                </label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="enquiry-field"
                />
              </div>
              <div>
                <label className="enquiry-label">
                  Mobile No. <span className="enquiry-required">*</span>
                </label>
                <input
                  type="tel" required
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  placeholder="+91 9XXXXXXXX"
                  className="enquiry-field"
                />
              </div>
            </div>

            <div>
              <label className="enquiry-label">
                Email Address <span className="enquiry-required">*</span>
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="enquiry-field"
              />
            </div>

            <div>
              <label className="enquiry-label">
                Message{' '}
                <span className="enquiry-optional">(optional)</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder="Which course are you interested in? Any questions about batch timing, fees, or curriculum?"
                className="enquiry-field"
                style={{ resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="enquiry-submit-btn"
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

            <div className="flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 enquiry-shield-icon" />
              <p className="enquiry-trust-note">Your details are safe with us — no spam, ever.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
