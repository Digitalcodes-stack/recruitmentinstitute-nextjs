'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Phone, PhoneCall, CheckCircle2, AlertCircle, X, Clock, User } from 'lucide-react'

type WidgetState = 'idle' | 'submitting' | 'calling' | 'connected' | 'disconnected' | 'error'

export default function RequestCallWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<WidgetState>('idle')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [activePhone, setActivePhone] = useState<string>('')

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for global custom event to open widget from any CTA button
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
    }
    window.addEventListener('open-request-call', handleOpen)
    return () => window.removeEventListener('open-request-call', handleOpen)
  }, [])

  // Call duration counter when connected
  useEffect(() => {
    if (state === 'connected') {
      setCallDuration(0)
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
  }, [state])

  // Poll backend for call status and auto-close when disconnected
  useEffect(() => {
    if (!activeCallId || (state !== 'calling' && state !== 'connected')) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      return
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/request-call/status?call_id=${encodeURIComponent(activeCallId)}&phone=${encodeURIComponent(activePhone)}`,
          { cache: 'no-store' }
        )
        if (!res.ok) return
        const data = await res.json()

        // Transition from ringing to in-call if user answers
        if (data.status === 'in_call' && state === 'calling') {
          setState('connected')
        }

        // Call ended or disconnected from either side
        if (data.disconnected) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current)
          setState('disconnected')

          // Auto-close modal smoothly after 1.5 seconds
          setTimeout(() => {
            setIsOpen(false)
            handleReset()
          }, 1500)
        }
      } catch (err) {
        // Silently ignore polling hiccups
      }
    }

    pollTimerRef.current = setInterval(checkStatus, 1500)
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [activeCallId, activePhone, state])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleReset = useCallback(() => {
    setState('idle')
    setErrorMessage('')
    setCallDuration(0)
    setActiveCallId(null)
    setActivePhone('')
    if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanName = name.trim()
    const cleanPhone = phone.replace(/[^\d+]/g, '').trim()

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name.')
      return
    }

    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.')
      return
    }

    // Step 1: Connecting...
    setState('submitting')

    try {
      const res = await fetch('/api/request-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setState('error')
        setErrorMessage(data.message || 'You can request a call again after some time.')
        return
      }

      // Step 2: Calling your phone... Please pick up
      setActiveCallId(data.call_id)
      setActivePhone(data.phone || cleanPhone)
      setState('calling')
    } catch (err: any) {
      setState('error')
      setErrorMessage('Unable to connect. Please check your internet connection and try again.')
    }
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    handleReset()
  }

  return (
    <>
      {/* ── UNIFIED FLOATING ACTION GROUP (Bottom Right) ── */}
      <div className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end gap-2.5 pointer-events-auto select-none">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-md border border-slate-700/80 animate-bounce">
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>Instant Free Callback</span>
          </div>
        )}

        {/* 1. Call Me Now / Request a Call Button */}
        <button
          id="request-a-call-btn"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
          aria-label="Request a Call"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <PhoneCall className="w-4 h-4 text-white animate-pulse" />
          <span className="font-semibold text-xs sm:text-sm tracking-wide">Call Me Now</span>
          <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Free</span>
        </button>

        {/* 2. WhatsApp Direct Chat Button */}
        <a
          id="whatsapp-floating-btn"
          href="https://wa.me/917385204165?text=Hello%2C%20I%20am%20interested%20in%20Recruitment%20Institute%20courses"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2.5 sm:px-4.5 sm:py-3 rounded-full text-white shadow-xl shadow-emerald-700/25 hover:shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
          style={{ background: '#25D366' }}
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-semibold text-xs sm:text-sm tracking-wide">WhatsApp</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Chat</span>
        </a>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-5 pb-2">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Request a Call
              </span>
            </div>

            {/* Counselor Card (Priya) - No AI and No Location */}
            <div className="px-5 pb-5">
              <div className="relative bg-gradient-to-b from-white to-slate-50 text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-100 overflow-hidden text-center">
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-100/60 rounded-full blur-2xl -translate-x-6 -translate-y-6 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/60 rounded-full blur-2xl translate-x-6 -translate-y-6 pointer-events-none"></div>

                {/* Counselor Portrait */}
                <div className="relative w-32 h-32 mx-auto mb-3">
                  {state === 'calling' && (
                    <span className="animate-ping absolute inset-0 rounded-2xl bg-emerald-400 opacity-50"></span>
                  )}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md border-2 border-white bg-slate-100">
                    <Image
                      src="/desk/avatars/priya_counselor.jpg"
                      alt="Priya - Senior Career Counsellor"
                      fill
                      sizes="128px"
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>

                {/* Name */}
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Priya
                </h4>

                {/* Role Badge */}
                <div className="mt-1.5 inline-block">
                  <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#1a365d] text-white shadow-sm">
                    Senior Career Counsellor
                  </span>
                </div>

                {/* Institute (No location) */}
                <div className="mt-2 text-xs font-semibold text-slate-800">
                  Recruitment Institute
                </div>
              </div>

              {/* Action Box */}
              <div className="mt-4 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-slate-200">
                {/* State 1: Form (Idle) */}
                {state === 'idle' && (
                  <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                    {errorMessage && (
                      <div className="flex items-start gap-2 p-2.5 text-xs rounded-lg bg-rose-950/60 text-rose-300 border border-rose-900/80">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Phone Number
                      </label>
                      <div className="flex rounded-xl border border-slate-700 bg-slate-800 overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500">
                        <span className="flex items-center px-3 text-xs font-semibold text-slate-400 border-r border-slate-700 bg-slate-800/80">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2.5 bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.99] transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Request a Call</span>
                      </button>
                    </div>

                    <div className="text-center text-[11px] text-slate-400 pt-0.5">
                      Incoming call will arrive from <strong className="text-slate-200">+91 22 6985 1989</strong>
                    </div>
                  </form>
                )}

                {/* State 2: Connecting... */}
                {state === 'submitting' && (
                  <div className="py-6 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-sm font-semibold text-white">Connecting...</div>
                    <div className="text-xs text-slate-400">Initiating your call request</div>
                  </div>
                )}

                {/* State 3: Calling your phone... Please pick up */}
                {state === 'calling' && (
                  <div className="py-5 text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 animate-bounce">
                      <PhoneCall className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Calling your phone... Please pick up</h5>
                      <p className="text-xs text-slate-400 mt-1">
                        Caller ID: <strong className="text-emerald-400">+91 22 6985 1989</strong>
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                      Please answer your phone to speak with Priya.
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
                      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 mt-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live: {formatTimer(callDuration)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      You are now speaking with Priya on your mobile phone.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      This window will close automatically when the call ends.
                    </p>
                  </div>
                )}

                {/* State 5: Disconnected (Auto-closing) */}
                {state === 'disconnected' && (
                  <div className="py-5 text-center space-y-2 animate-in fade-in">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 border border-slate-700 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h5 className="text-sm font-semibold text-white">Call Ended</h5>
                    <p className="text-xs text-slate-400">Thank you for connecting with us!</p>
                  </div>
                )}

                {/* State 6: Error */}
                {state === 'error' && (
                  <div className="py-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-white">Unable to Connect</h5>
                    <p className="text-xs text-rose-300 px-2 leading-relaxed">
                      {errorMessage || 'You can request a call again after some time.'}
                    </p>
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md"
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
