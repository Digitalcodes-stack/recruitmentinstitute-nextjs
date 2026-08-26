'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, ChevronRight, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', message: '' })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string; mobile: string } | null>(null)

  const validate = () => {
    const errs: { [key: string]: string } = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Please enter your full name (minimum 2 characters)'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com)'
    }
    const cleanPhone = form.mobile.replace(/[^0-9]/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.mobile = 'Please enter a valid 10-digit mobile number'
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      errs.message = 'Please provide details about your inquiry (minimum 10 characters)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please complete all required fields correctly')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Inquiry submitted successfully!')
        setSubmittedData({ name: form.name, email: form.email, mobile: form.mobile })
        setForm({ name: '', email: '', mobile: '', message: '' })
        setErrors({})
      } else {
        toast.error(data.message || 'Failed to submit inquiry')
      }
    } catch {
      toast.error('Connection error. Please try again or reach out on WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Hero / Breadcrumb ── */}
      <div
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)', paddingTop: '72px', paddingBottom: '80px' }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(30,64,175,0.15)', filter: 'blur(80px)' }} />

        <div className="container relative z-10">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 mb-6" style={{ fontSize: '12px', color: '#94A3B8' }}>
            <Link href="/">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: '#CBD5E1' }}>Contact Us</span>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '50px',
            background: 'rgba(30,64,175,0.25)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#93C5FD',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            Get In Touch
          </div>

          <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Contact Recruitment Institute
          </h1>
          <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.75, maxWidth: '520px' }}>
            Have a question about our courses, batch timings, or admissions? Our admissions team responds within 30 minutes during working hours.
          </p>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 bg-white" style={{ height: '48px', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Main Content ── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
        <div className="container">
          <div className="grid lg:grid-cols-12 gap-10 items-start">

            {/* ── Contact Form / Professional Thank You Card ── */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9' }}>

                {submittedData ? (
                  /* ── Executive Thank You Message Screen ── */
                  <div className="p-8 sm:p-12 text-center">
                    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
                      style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '2px solid #10B981', boxShadow: '0 10px 25px rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
                      <ShieldCheck className="w-3.5 h-3.5" /> Inquiry Received & Confirmed
                    </div>

                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                      Thank You, {submittedData.name}!
                    </h2>

                    <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px' }}>
                      We have received your message. An admissions counselor is reviewing your inquiry and will contact you within <strong className="text-slate-800">30 minutes</strong>.
                    </p>

                    {/* Summary confirmation card */}
                    <div className="rounded-2xl p-5 mb-8 text-left"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Submission Details</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Candidate Name:</span>
                          <span className="font-semibold text-slate-800">{submittedData.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">Email Address:</span>
                          <span className="font-semibold text-blue-600">{submittedData.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-500">Mobile Number:</span>
                          <span className="font-semibold text-slate-800">{submittedData.mobile}</span>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
                        ✓ A formal confirmation copy has been sent to your email.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                      <a
                        href="https://wa.me/917385204165?text=Hi%2C%20I%20just%20submitted%20a%20contact%20inquiry%20on%20your%20website"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-md"
                        style={{ background: '#059669' }}
                      >
                        💬 Connect on WhatsApp Now
                      </a>
                      <Link
                        href="/courses"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-sm transition-all"
                      >
                        Explore Our Courses <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <button
                      onClick={() => setSubmittedData(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium mt-2 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Submit another message
                    </button>
                  </div>
                ) : (
                  /* ── Form View ── */
                  <>
                    {/* form header bar */}
                    <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '28px 36px' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Send Us a Message</h2>
                      <p style={{ fontSize: '13px', color: '#94A3B8' }}>Fill the form below and we'll get back to you shortly</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: '36px' }} noValidate>
                      <div className="grid sm:grid-cols-2 gap-5" style={{ marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                            Your Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                              setForm({ ...form, name: e.target.value })
                              if (errors.name) setErrors({ ...errors, name: '' })
                            }}
                            className={`form-input-premium ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            placeholder="Your full name"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                            Email Address <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => {
                              setForm({ ...form, email: e.target.value })
                              if (errors.email) setErrors({ ...errors, email: '' })
                            }}
                            className={`form-input-premium ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                          Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={(e) => {
                            setForm({ ...form, mobile: e.target.value })
                            if (errors.mobile) setErrors({ ...errors, mobile: '' })
                          }}
                          className={`form-input-premium ${errors.mobile ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          placeholder="+91 9XXXXXXXXX"
                        />
                        {errors.mobile && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.mobile}</p>
                        )}
                      </div>

                      <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                          Message <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          value={form.message}
                          onChange={(e) => {
                            setForm({ ...form, message: e.target.value })
                            if (errors.message) setErrors({ ...errors, message: '' })
                          }}
                          rows={5}
                          className={`form-input-premium ${errors.message ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          style={{ resize: 'none' }}
                          placeholder="Which course are you interested in? Any specific questions about batch timings, fees, or curriculum?"
                        />
                        {errors.message && (
                          <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                          padding: '16px',
                          fontSize: '15px',
                          boxShadow: '0 8px 24px rgba(30,64,175,0.30)',
                          opacity: loading ? 0.75 : 1,
                          border: 'none',
                        }}
                      >
                        <Send className="w-4 h-4" />
                        {loading ? 'Submitting & Delivering...' : 'Send Message'}
                      </button>

                      <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '16px' }}>
                        We typically respond within 30 minutes during working hours (Mon–Sat 9AM–7PM)
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Contact Info Card */}
              <div className="bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '24px 28px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Contact Details</h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Reach us through any of these channels</p>
                </div>

                <div style={{ padding: '8px 0' }}>
                  {[
                    { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: '+91 7385204165', href: 'tel:+917385204165', iconBg: '#EFF6FF', iconColor: '#1E40AF' },
                    { icon: <Mail className="w-4 h-4" />, label: 'General Enquiry', value: 'support@recruitmentinstitute.in', href: 'mailto:support@recruitmentinstitute.in', iconBg: '#EFF6FF', iconColor: '#3B82F6' },
                    { icon: <Mail className="w-4 h-4" />, label: 'Admissions Desk', value: 'admissions@recruitmentinstitute.in', href: 'mailto:admissions@recruitmentinstitute.in', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
                    { icon: <Clock className="w-4 h-4" />, label: 'Working Hours', value: 'Mon–Sat: 9:00 AM – 7:00 PM', href: undefined, iconBg: '#F0FDF4', iconColor: '#16A34A' },
                  ].map((item, idx) => (
                    <div key={idx}
                      className="flex items-center gap-4"
                      style={{ padding: '16px 24px', borderBottom: idx < 3 ? '1px solid #F8FAFC' : undefined }}
                    >
                      <div className="rounded-xl flex items-center justify-center shrink-0"
                        style={{ width: 40, height: 40, background: item.iconBg, color: item.iconColor }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                          {item.label}
                        </p>
                        {item.href ? (
                          <a href={item.href}
                            style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', textDecoration: 'none' }}


                          >{item.value}</a>
                        ) : (
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Locations */}
              <div className="bg-white rounded-3xl"
                style={{ padding: '24px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                  <div className="rounded-xl flex items-center justify-center"
                    style={{ width: 36, height: 36, background: '#FEF2F2', color: '#EF4444', flexShrink: 0 }}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Office Locations</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { city: 'Pune Office', address: 'Recruitment Institute, Pune, Maharashtra – 411001' },
                    { city: 'Online Training Institute', address: 'Live Interactive Batches & Global Remote Access Worldwide' },
                  ].map((loc) => (
                    <div key={loc.city} className="rounded-2xl" style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{loc.city}</p>
                      <p style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>{loc.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="rounded-3xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', boxShadow: '0 12px 32px rgba(5,150,105,0.25)' }}>
                <div className="absolute top-0 right-0 rounded-full pointer-events-none"
                  style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
                <div className="relative" style={{ padding: '28px' }}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl flex items-center justify-center shrink-0"
                      style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>Admissions Helpline</p>
                      <p style={{ fontSize: '13px', color: 'rgba(209,250,229,0.9)', lineHeight: 1.6, marginBottom: '16px' }}>
                        Message our team directly for batch enrollment, fees, and course queries.
                      </p>
                      <a
                        href="https://wa.me/917385204165"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-bold rounded-xl transition-all"
                        style={{ background: 'white', color: '#059669', padding: '10px 20px', fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}


                      >
                        Chat on WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
