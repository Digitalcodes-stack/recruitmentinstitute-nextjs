'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Phone, PhoneCall, CheckCircle2, AlertCircle, X, Sparkles, Clock, ShieldCheck, MapPin, Building2, User } from 'lucide-react'

type WidgetState = 'idle' | 'submitting' | 'calling' | 'connected' | 'error'

const POPULAR_COURSES = [
  'End-to-End Recruitment & Talent Acquisition',
  'HR Generalist & Payroll Management',
  'Executive Search & Tech Recruiting',
  'Corporate HR & Sourcing Strategy',
  'Career Counseling & General Inquiry',
]

export default function RequestCallWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<WidgetState>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState(POPULAR_COURSES[0])
  const [errorMessage, setErrorMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (state === 'connected') {
      setCallDuration(0)
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanPhone = phone.replace(/[^\d+]/g, '').trim()
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.')
      return
    }

    setState('submitting')

    try {
      const res = await fetch('/api/request-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          preferred_course: course,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setState('error')
        setErrorMessage(data.message || 'Unable to place call. Please try again.')
        return
      }

      // Transition to calling state
      setState('calling')

      // After 8 seconds (approx phone pickup time), shift to connected
      setTimeout(() => {
        setState((current) => (current === 'calling' ? 'connected' : current))
      }, 8000)
    } catch (err: any) {
      setState('error')
      setErrorMessage('Network error while connecting. Please check your connection and retry.')
    }
  }

  const handleReset = () => {
    setState('idle')
    setErrorMessage('')
    setCallDuration(0)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-md border border-slate-700 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Get a call in 5 seconds!</span>
          </div>
        )}

        <button
          id="request-call-now-btn"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
          aria-label="Request Instant AI Call"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>

          <PhoneCall className="w-5 h-5 text-white animate-pulse" />
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">Call Me Now</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Free</span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false)
                if (state === 'connected' || state === 'calling') handleReset()
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-5 pb-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                My executive
              </span>
            </div>

            {/* Executive Card: Desk (Matches Screenshot) */}
            <div className="px-5 pb-5">
              <div className="relative bg-gradient-to-b from-white to-slate-50 text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-100 overflow-hidden text-center">
                {/* Subtle Decorative Arc */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-100/60 rounded-full blur-2xl -translate-x-6 -translate-y-6 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/60 rounded-full blur-2xl translate-x-6 -translate-y-6 pointer-events-none"></div>

                {/* Desk Label */}
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Desk
                </div>

                {/* Counselor Portrait */}
                <div className="relative w-36 h-36 mx-auto mb-3">
                  {state === 'calling' && (
                    <span className="animate-ping absolute inset-0 rounded-2xl bg-emerald-400 opacity-50"></span>
                  )}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-100">
                    <Image
                      src="/desk/avatars/priya_counselor.jpg"
                      alt="Priya - Senior Career Counselor"
                      fill
                      sizes="144px"
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>

                {/* Name */}
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Priya
                </h4>

                {/* Pill Role Badge */}
                <div className="mt-1.5 inline-block">
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#1a365d] text-white shadow-sm">
                    Senior Career Counsellor
                  </span>
                </div>

                {/* Institute & Location */}
                <div className="mt-2.5 text-xs text-slate-600 font-medium space-y-0.5">
                  <div className="font-semibold text-slate-800">Recruitment Institute</div>
                  <div className="text-[11px] text-slate-500 leading-snug px-2">
                    Pune, Maharashtra
                  </div>
                </div>

                {/* Bottom-right AI Badge */}
                <div className="absolute bottom-2.5 right-3 bg-[#1a365d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  AI
                </div>
              </div>

              {/* Training & Testing / Call Section */}
              <div className="mt-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800 mb-3">
                  <span>Training &amp; Testing</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Telephony
                  </span>
                </div>

                {/* State 1: Form (Idle) */}
                {state === 'idle' && (
                  <form onSubmit={handleSubmit} className="space-y-3 text-left">
                    {errorMessage && (
                      <div className="flex items-start gap-2 p-2.5 text-xs rounded-lg bg-rose-950/60 text-rose-300 border border-rose-900/80">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Mobile Number
                      </label>
                      <div className="flex rounded-lg border border-slate-700 bg-slate-800 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                        <span className="flex items-center px-2.5 text-xs font-semibold text-slate-400 border-r border-slate-700 bg-slate-800/80">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Course of Interest
                      </label>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      >
                        {POPULAR_COURSES.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Me Now</span>
                      </button>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 pt-1">
                      Incoming call will arrive from <strong className="text-slate-200">+91 22 6985 1989</strong>
                    </div>
                  </form>
                )}

                {/* State 2: Submitting */}
                {state === 'submitting' && (
                  <div className="py-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-xs font-semibold text-white">Dispatching call to Plivo...</div>
                    <div className="text-[11px] text-slate-400">Connecting to telephony gateway</div>
                  </div>
                )}

                {/* State 3: Calling / Ringing */}
                {state === 'calling' && (
                  <div className="py-5 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 animate-bounce">
                      <PhoneCall className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 mb-1">
                        Ringing Your Mobile Phone...
                      </span>
                      <h5 className="text-sm font-bold text-white">Please answer the phone!</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Caller ID: <strong className="text-indigo-400">+91 22 6985 1989</strong>
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                      Priya is ready to talk with you as soon as you pick up.
                    </div>
                  </div>
                )}

                {/* State 4: Connected */}
                {state === 'connected' && (
                  <div className="py-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Call Connected</h5>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>Live: {formatTimer(callDuration)}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      You are now speaking with Priya on your phone.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleReset()
                      }}
                      className="w-full py-2 px-3 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Close Modal
                    </button>
                  </div>
                )}

                {/* State 5: Error */}
                {state === 'error' && (
                  <div className="py-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-white">Unable to Place Call</h5>
                    <p className="text-[11px] text-rose-400 px-2">
                      {errorMessage || 'Call could not be completed. Please verify your phone number.'}
                    </p>
                    <button
                      onClick={handleReset}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
