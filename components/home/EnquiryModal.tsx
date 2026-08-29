'use client'

import { useState, useEffect } from 'react'
import { X, Send, Phone, CheckCircle2, Award, Users, Clock, Shield, Monitor, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  defaultCourse?: string
  defaultMode?: 'online' | 'offline'
}

const trustPoints = [
  { icon: Users,        text: '5,000+ professionals trained' },
  { icon: Award,        text: 'Industry-recognised certificate' },
  { icon: CheckCircle2, text: '95% placement success rate' },
  { icon: Clock,        text: 'Flexible weekend & weekday batches' },
]

export default function EnquiryModal({ isOpen, onClose, defaultCourse, defaultMode = 'online' }: EnquiryModalProps) {
  const [loading, setLoading] = useState(false)
  const [learningMode, setLearningMode] = useState<'online' | 'offline'>(defaultMode)
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    course: defaultCourse || '',
    learningMode: defaultMode,
    message: '',
  })

  useEffect(() => {
    if (defaultMode) setLearningMode(defaultMode)
    if (defaultCourse) setForm(prev => ({ ...prev, course: defaultCourse }))
  }, [defaultMode, defaultCourse, isOpen])

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
      const fullMessage = `[Mode: ${learningMode === 'online' ? 'Online Live (50% OFF)' : 'Offline Classroom (10% OFF)'}]${form.course ? ` [Course: ${form.course}]` : ''} ${form.message}`.trim()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          message: fullMessage,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Enquiry sent! Our counsellor will contact you shortly.')
        setForm({ name: '', email: '', mobile: '', course: '', learningMode: 'online', message: '' })
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

      <div className="enquiry-modal" style={{ maxWidth: '820px' }}>

        {/* ── Left panel ── */}
        <div className="enquiry-left hidden md:flex">
          <div className="enquiry-left-dots" />
          <div className="enquiry-left-glow-br" />
          <div className="enquiry-left-glow-tl" />

          <div className="relative z-10">
            <div className="enquiry-pill">Free Counselling</div>

            <h2 className="enquiry-left-heading">Start Your HR Career Today</h2>
            <p className="enquiry-left-desc">
              Talk to our expert counsellor for personalised guidance on course selection, batch timings, and online/offline fee discounts.
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

            {/* Mode selection toggle */}
            <div>
              <label className="enquiry-label" style={{ marginBottom: 6 }}>
                Select Preferred Learning Mode
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setLearningMode('online')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    learningMode === 'online'
                      ? 'bg-sky-50 border-sky-400 text-sky-950 ring-2 ring-sky-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Monitor className="w-3.5 h-3.5 text-sky-600" />
                    <span>Online Live</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full mt-1">
                    50% Discount Applied
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLearningMode('offline')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    learningMode === 'offline'
                      ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Classroom</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full mt-1">
                    10% Discount • Pune
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                rows={2}
                placeholder="Questions about batch timing, discounts, or placement?"
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
