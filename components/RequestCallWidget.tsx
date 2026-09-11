'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  Phone,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  User,
  Sparkles,
  Mail,
  Globe,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

type WidgetState = 'idle' | 'submitting' | 'calling' | 'connected' | 'disconnected' | 'error'

export interface Counselor {
  id: string
  name: string
  displayName: string
  role: string
  photo: string
  institute: string
  experience: string
  badge: string
  primaryLanguage: string
}

// Multi-Executive Portfolio: Each executive with a unique, high-resolution photo & regional language expertise
export const COUNSELORS: Counselor[] = [
  {
    id: 'pooja-kulkarni',
    name: 'Pooja Kulkarni',
    displayName: 'Pooja',
    role: 'Senior Career Counsellor',
    photo: '/assets/images/counselors/pooja_kulkarni.jpg',
    institute: 'Recruitment Institute',
    experience: '8+ Yrs Exp',
    badge: 'Senior Counsellor',
    primaryLanguage: 'Marathi',
  },
  {
    id: 'vikram-joshi',
    name: 'Vikram Joshi',
    displayName: 'Vikram',
    role: 'Director of Career Counselling',
    photo: '/assets/images/counselors/vikram_joshi.jpg',
    institute: 'Recruitment Institute',
    experience: '12+ Yrs Exp',
    badge: 'Counselling Head',
    primaryLanguage: 'Hindi',
  },
  {
    id: 'anjali-patil',
    name: 'Anjali Patil',
    displayName: 'Anjali',
    role: 'Lead Admissions Advisor',
    photo: '/assets/images/counselors/anjali_patil.jpg',
    institute: 'Recruitment Institute',
    experience: '7+ Yrs Exp',
    badge: 'Admissions Lead',
    primaryLanguage: 'Tamil',
  },
  {
    id: 'sneha-deshmukh',
    name: 'Sneha Deshmukh',
    displayName: 'Sneha',
    role: 'Senior Talent Acquisition Mentor',
    photo: '/assets/images/counselors/sneha_deshmukh.jpg',
    institute: 'Recruitment Institute',
    experience: '6+ Yrs Exp',
    badge: 'TA Mentor',
    primaryLanguage: 'Telugu',
  },
  {
    id: 'meera-rao',
    name: 'Meera Rao',
    displayName: 'Meera',
    role: 'Executive Career Strategist',
    photo: '/assets/images/counselors/meera_rao.jpg',
    institute: 'Recruitment Institute',
    experience: '10+ Yrs Exp',
    badge: 'Placement Director',
    primaryLanguage: 'Kannada',
  },
  {
    id: 'riya-joshi',
    name: 'Riya Joshi',
    displayName: 'Riya',
    role: 'Corporate Career Counsellor',
    photo: '/assets/images/counselors/riya_joshi.jpg',
    institute: 'Recruitment Institute',
    experience: '5+ Yrs Exp',
    badge: 'Career Counsellor',
    primaryLanguage: 'Bengali',
  },
]

export interface StateMapping {
  counselorId: string
  language: string
}

// 28 Indian States & 8 Union Territories with assigned Regional Counsellor & Language
export const INDIAN_STATES_MAPPING: Record<string, StateMapping> = {
  // Western Region
  'Maharashtra': { counselorId: 'pooja-kulkarni', language: 'Marathi' },
  'Goa': { counselorId: 'pooja-kulkarni', language: 'Konkani' },
  'Gujarat': { counselorId: 'pooja-kulkarni', language: 'Gujarati' },
  'Dadra and Nagar Haveli and Daman and Diu': { counselorId: 'pooja-kulkarni', language: 'Gujarati' },

  // Northern & Central Region
  'Delhi': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Uttar Pradesh': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Haryana': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Punjab': { counselorId: 'vikram-joshi', language: 'Punjabi' },
  'Chandigarh': { counselorId: 'vikram-joshi', language: 'Punjabi' },
  'Rajasthan': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Madhya Pradesh': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Bihar': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Jharkhand': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Chhattisgarh': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Uttarakhand': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Himachal Pradesh': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Jammu and Kashmir': { counselorId: 'vikram-joshi', language: 'Hindi' },
  'Ladakh': { counselorId: 'vikram-joshi', language: 'Hindi' },

  // Southern Region
  'Karnataka': { counselorId: 'meera-rao', language: 'Kannada' },
  'Tamil Nadu': { counselorId: 'anjali-patil', language: 'Tamil' },
  'Puducherry': { counselorId: 'anjali-patil', language: 'Tamil' },
  'Kerala': { counselorId: 'anjali-patil', language: 'Malayalam' },
  'Lakshadweep': { counselorId: 'anjali-patil', language: 'Malayalam' },
  'Telangana': { counselorId: 'sneha-deshmukh', language: 'Telugu' },
  'Andhra Pradesh': { counselorId: 'sneha-deshmukh', language: 'Telugu' },

  // Eastern & North-Eastern Region
  'Odisha': { counselorId: 'riya-joshi', language: 'Odia' },
  'Assam': { counselorId: 'riya-joshi', language: 'Assamese' },
  'West Bengal': { counselorId: 'riya-joshi', language: 'Bengali' },
  'Tripura': { counselorId: 'riya-joshi', language: 'Bengali' },
  'Meghalaya': { counselorId: 'riya-joshi', language: 'English' },
  'Manipur': { counselorId: 'riya-joshi', language: 'English' },
  'Mizoram': { counselorId: 'riya-joshi', language: 'English' },
  'Nagaland': { counselorId: 'riya-joshi', language: 'English' },
  'Arunachal Pradesh': { counselorId: 'riya-joshi', language: 'English' },
  'Sikkim': { counselorId: 'riya-joshi', language: 'English' },
  'Andaman and Nicobar Islands': { counselorId: 'riya-joshi', language: 'Hindi' },
}

export const INDIAN_STATES = Object.keys(INDIAN_STATES_MAPPING).sort()

/** Normalizes any raw phone input to clean 10-digit Indian mobile number */
export function normalizeIndian10Digit(raw: string): string {
  if (!raw) return ''
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('9191') && d.length === 14) d = d.slice(4)
  else if (d.startsWith('91') && d.length === 12) d = d.slice(2)
  else if (d.startsWith('0') && d.length === 11) d = d.slice(1)
  return d.slice(-10)
}

/** Formats number strictly as '+91 XXXXXXXXXX' with zero duplication */
export function formatDisplayIndianPhone(raw: string): string {
  const ten = normalizeIndian10Digit(raw)
  return ten ? `+91 ${ten}` : raw
}

export default function RequestCallWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<WidgetState>('idle')

  // State selection (defaults to Maharashtra where Recruitment Institute is headquartered)
  const [userState, setUserState] = useState<string>('Maharashtra')

  // Selected Counsellor State (Auto-derived from selected State)
  const [selectedCounselorIndex, setSelectedCounselorIndex] = useState(0)
  const currentCounselor = COUNSELORS[selectedCounselorIndex] || COUNSELORS[0]

  // Active language derived automatically from State + Counsellor
  const currentLanguage = INDIAN_STATES_MAPPING[userState]?.language || currentCounselor.primaryLanguage || 'English'

  // Form Fields (Exactly 4 fields: Full Name, Phone Number, Email Address, State Dropdown)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [activePhone, setActivePhone] = useState<string>('')
  const [submittedEmail, setSubmittedEmail] = useState<string>('')

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for global custom event to open widget from any CTA button
  useEffect(() => {
    const handleOpen = (e?: any) => {
      if (e?.detail?.counselor) {
        const foundIdx = COUNSELORS.findIndex(
          (c) => c.name.toLowerCase().includes(e.detail.counselor.toLowerCase()) ||
            c.displayName.toLowerCase().includes(e.detail.counselor.toLowerCase())
        )
        if (foundIdx !== -1) setSelectedCounselorIndex(foundIdx)
      }
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

  // Synchronize assigned counsellor and language when state is selected
  const handleStateChange = (newState: string) => {
    setUserState(newState)
    const mapping = INDIAN_STATES_MAPPING[newState]
    if (mapping) {
      const idx = COUNSELORS.findIndex((c) => c.id === mapping.counselorId)
      if (idx !== -1) {
        setSelectedCounselorIndex(idx)
      }
    }
  }

  // Poll backend for call status and transition to disconnected
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

          // Immediately trigger post-call delivery (Email only) automatically
          fetch('/api/request-call/post-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              call_id: activeCallId,
              name,
              phone: activePhone,
              email: submittedEmail || email,
              language: currentLanguage,
              state: userState,
              counselor_name: currentCounselor.name,
              duration: data.duration || 0,
            }),
          }).catch((err) => console.warn('Post-call trigger ping:', err))
        }
      } catch (err) {
        // Silently ignore temporary polling errors
      }
    }

    pollTimerRef.current = setInterval(checkStatus, 1500)
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [activeCallId, activePhone, state, name, email, submittedEmail, currentLanguage, userState, currentCounselor])

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
    const cleanPhone = normalizeIndian10Digit(phone)
    const cleanEmail = email.trim()

    // 1. Name validation
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).')
      return
    }

    // 2. Phone validation (10 digits, starts with 6-9)
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.')
      return
    }

    // 3. Email validation
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address to receive course details.')
      return
    }

    // Connecting...
    setState('submitting')
    setSubmittedEmail(cleanEmail)

    try {
      const res = await fetch('/api/request-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          state: userState,
          language: currentLanguage,
          counselor_name: currentCounselor.name,
          preferred_course: 'End-to-End Practical Recruitment & HR Operations Training',
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setState('error')
        setErrorMessage(data.message || 'You can request a call again after some time.')
        return
      }

      // Calling your phone... Please pick up
      setActiveCallId(data.call_id)
      setActivePhone(normalizeIndian10Digit(data.phone || cleanPhone))
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

  const handleCallExecutive = () => {
    if (typeof (window as any).aidtOpenTalk === 'function') {
      ; (window as any).aidtOpenTalk({
        name: currentCounselor.name,
        avatar_url: currentCounselor.photo,
      })
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      {/* ── UNIFIED FLOATING ACTION GROUP (Bottom Right) ── */}
      <div className="fixed bottom-6 right-5 sm:right-6 z-50 flex flex-col items-end gap-2.5 pointer-events-auto select-none">
        {/* Row 1 (Top): Micro badge + Call Counselor Small Icon */}
        <div className="flex items-center gap-2">
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-md border border-slate-700/80 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Get a call in 5 seconds!</span>
            </div>
          )}

          {/* Call Counselor Button */}
          <button
            id="call-executive-btn"
            onClick={handleCallExecutive}
            title={`Call ${currentCounselor.displayName}`}
            aria-label={`Call ${currentCounselor.displayName}`}
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white shadow-xl shadow-indigo-900/40 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/25 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #4f3cc9, #4230b3)' }}
          >
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            <Phone className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute right-14 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none border border-slate-700">
              Call {currentCounselor.displayName}
            </span>
          </button>
        </div>

        {/* Row 2 (Bottom): Call Me Now + WhatsApp */}
        <div className="flex items-center gap-2">
          {/* Call Me Now Button */}
          <button
            id="request-a-call-btn"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
            aria-label="Call Me Now"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <PhoneCall className="w-4 h-4 text-white animate-pulse" />
            <span className="font-semibold text-xs sm:text-sm tracking-wide">Call Me Now</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Free</span>
          </button>

          {/* WhatsApp Direct Chat Button */}
          <a
            id="whatsapp-floating-btn"
            href="https://wa.me/917385204165?text=Hello%2C%20I%20am%20interested%20in%20Recruitment%20Institute%20courses"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
            className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full text-white shadow-xl shadow-emerald-700/25 hover:shadow-emerald-700/40 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
            style={{ background: '#25D366' }}
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="absolute right-14 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none border border-slate-700">
              Chat on WhatsApp
            </span>
          </a>
        </div>
      </div>

      {/* ── HIGH-END REQUEST A CALL MODAL POPUP ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-xl md:max-w-3xl lg:max-w-4xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-auto max-h-[94vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Glow & Decorative Highlights */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header Bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2 border-b border-slate-800/70">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Request a Call</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  <span>Online & Ready</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: 2-Column Responsive Layout for Desktop & Mobile Header on Phones */}
            <div className="relative z-10 p-4 sm:p-6 overflow-y-auto">
              {/* ── STATE: IDLE (Form View with Prominent Hero Photo) ── */}
              {state === 'idle' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-stretch">

                  {/* MOBILE VIEW ONLY: Compact Executive Counsellor Banner (< md) */}
                  <div className="md:hidden flex flex-col gap-2.5 bg-slate-900/90 rounded-2xl p-3 border border-slate-800 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-indigo-400 ring-2 ring-indigo-500/30 shrink-0">
                        <Image
                          key={currentCounselor.id}
                          src={currentCounselor.photo}
                          alt={`${currentCounselor.name} - ${currentCounselor.role}`}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-white text-sm truncate">
                            <span>{currentCounselor.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <span className="text-[10px] font-semibold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">★ 4.9</span>
                        </div>
                        <div className="text-[11px] text-indigo-300 font-medium truncate">{currentCounselor.role}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-1 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-medium">Assigned: {userState}</span>
                          <span className="text-emerald-300 font-semibold">{currentLanguage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Advisor Switcher on Mobile */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 pt-1.5 border-t border-slate-800/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">Advisors:</span>
                      {COUNSELORS.map((c, idx) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCounselorIndex(idx)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 transition-all ${idx === selectedCounselorIndex
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                          <span className="relative w-4 h-4 rounded-full overflow-hidden inline-block">
                            <Image src={c.photo} alt={c.displayName} fill className="object-cover" />
                          </span>
                          <span>{c.displayName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DESKTOP & TABLET LEFT COLUMN: Significantly Larger & Prominent Counsellor Photo Showcase (>= md) */}
                  <div className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col items-center justify-between bg-gradient-to-b from-slate-900/95 via-slate-900 to-indigo-950/50 rounded-2xl p-4 sm:p-5 border border-slate-800/90 shadow-2xl relative">

                    {/* Top Photo Frame: Significantly Larger Portrait Showcase */}
                    <div className="w-full flex flex-col items-center">
                      <div className="relative w-full max-w-[260px] sm:max-w-[280px] md:max-w-full aspect-[4/5] sm:h-72 md:h-80 lg:h-[340px] rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-400/50 ring-4 ring-indigo-500/20 bg-slate-800 group transition-all duration-300">
                        <Image
                          key={currentCounselor.id}
                          src={currentCounselor.photo}
                          alt={`${currentCounselor.name} - ${currentCounselor.role}`}
                          fill
                          sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                        {/* Subtle bottom gradient on photo for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                        {/* Top-Left Live Status Badge */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Available Now</span>
                        </div>

                        {/* Top-Right Experience Badge */}
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-lg">
                          <span>★ 4.9</span>
                          <span className="text-slate-400 text-[10px]">• {currentCounselor.experience}</span>
                        </div>

                        {/* Bottom inside photo: Name overlay */}
                        <div className="absolute bottom-2.5 inset-x-2.5 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-center shadow-lg">
                          <div className="text-sm sm:text-base font-extrabold text-white flex items-center justify-center gap-1.5">
                            <span>{currentCounselor.name}</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          </div>
                          <div className="text-[11px] font-medium text-indigo-300">
                            {currentCounselor.role}
                          </div>
                        </div>
                      </div>

                      {/* Institute & Regional Assignment Marker below photo */}
                      <div className="w-full mt-2.5 px-3 py-2 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-center shadow-inner">
                        <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Assigned for {userState}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                          Fluent in <strong className="text-emerald-300 font-semibold">{currentLanguage}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Executive Selector: Dynamic Photo Switcher */}
                    <div className="w-full mt-3 pt-3 border-t border-slate-800/90">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-semibold">
                        <span>Available Counsellors:</span>
                        <span className="text-indigo-400 text-[10px]">{COUNSELORS.length} Advisors</span>
                      </div>

                      {/* Scrollbar-free Executive Thumbnails */}
                      <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {COUNSELORS.map((c, idx) => {
                          const isSelected = idx === selectedCounselorIndex
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedCounselorIndex(idx)
                              }}
                              title={`${c.name} (${c.primaryLanguage}) — ${c.role}`}
                              className={`group relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all duration-200 cursor-pointer ${isSelected
                                  ? 'bg-indigo-950/80 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                                  : 'opacity-65 hover:opacity-100 hover:bg-slate-800/60'
                                }`}
                            >
                              <div
                                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-all ${isSelected
                                    ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
                                    : 'border-slate-700 group-hover:border-slate-500'
                                  }`}
                              >
                                <Image
                                  src={c.photo}
                                  alt={c.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover object-top"
                                />
                              </div>
                              <span
                                className={`text-[10px] font-semibold tracking-tight transition-colors ${isSelected ? 'text-indigo-300' : 'text-slate-400 group-hover:text-slate-200'
                                  }`}
                              >
                                {c.displayName}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Exactly 4 Clean Form Fields & CTA */}
                  <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-between py-0.5">
                    <div>
                      {/* Form Header */}
                      <div className="mb-3.5">
                        <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight">
                          Connect with {currentCounselor.displayName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Fill your details below to receive an instant callback from your regional admissions counsellor ({currentCounselor.displayName}, speaks {currentLanguage}) regarding syllabus, batches and placement assistance.
                        </p>
                      </div>

                      {/* Error Banner */}
                      {errorMessage && (
                        <div className="mb-3 flex items-start gap-2.5 p-2.5 text-xs rounded-xl bg-rose-950/70 text-rose-200 border border-rose-800/80 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          <span className="leading-relaxed">{errorMessage}</span>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                        {/* Field 1: Full Name */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Full Name <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                              type="text"
                              required
                              placeholder="Enter your full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-base sm:text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Field 2: Phone Number (+91, 10-digit validation) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Phone Number <span className="text-rose-400">*</span>
                          </label>
                          <div className="flex min-h-[44px] rounded-xl border border-slate-700 bg-slate-900/90 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
                            <span className="flex items-center gap-1 px-3 text-xs font-bold text-slate-300 border-r border-slate-700 bg-slate-800/90 shrink-0">
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              placeholder="10-digit mobile number"
                              value={phone}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '')
                                let cleaned = raw
                                if (cleaned.length === 12 && cleaned.startsWith('91')) cleaned = cleaned.slice(2)
                                else if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = cleaned.slice(1)
                                setPhone(cleaned.slice(0, 10))
                              }}
                              className="w-full px-3.5 py-2.5 bg-transparent text-white text-base sm:text-sm placeholder:text-slate-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Field 3: Email Address */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Email Address <span className="text-rose-400">*</span>
                            <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                              (To receive syllabus & course details)
                            </span>
                          </label>
                          <div className="relative flex items-center">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <input
                              type="email"
                              required
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-base sm:text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Field 4: State Dropdown (Replaces Language Preference, Auto-Assigns Counsellor & Language) */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-300">
                              Your State <span className="text-rose-400">*</span>
                            </label>
                            <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                              Language: {currentLanguage}
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                            <select
                              required
                              value={userState}
                              onChange={(e) => handleStateChange(e.target.value)}
                              className="w-full min-h-[44px] pl-10 pr-8 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white text-base sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer transition-all shadow-inner"
                            >
                              {INDIAN_STATES.map((st) => {
                                const mapInfo = INDIAN_STATES_MAPPING[st]
                                return (
                                  <option key={st} value={st} className="bg-slate-900 text-white">
                                    {st} — ({mapInfo?.language})
                                  </option>
                                )
                              })}
                            </select>
                            <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {currentCounselor.displayName} speaks {currentLanguage} and handles candidates from {userState}.
                          </p>
                        </div>

                        {/* Primary CTA Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Request a Call with {currentCounselor.displayName}</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                          </button>
                        </div>

                        {/* Reassurance Footnote */}
                        <div className="text-center text-[11px] text-slate-400 pt-1 flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>
                            Incoming call arrives from <strong className="text-white font-semibold">+91 22 6985 1989</strong>
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STATE: SUBMITTING (Connecting...) ── */}
              {state === 'submitting' && (
                <div className="py-10 text-center space-y-4">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-3xl overflow-hidden border-2 border-indigo-400 shadow-2xl ring-4 ring-indigo-500/25">
                    <Image
                      src={currentCounselor.photo}
                      alt={currentCounselor.name}
                      fill
                      sizes="144px"
                      className="object-cover object-top opacity-85"
                    />
                    <div className="absolute inset-0 bg-slate-950/55 flex items-center justify-center">
                      <div className="w-10 h-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">Connecting with {currentCounselor.name}...</h4>
                    <p className="text-xs text-indigo-300 font-medium mt-1">{currentCounselor.role}</p>
                    <p className="text-xs text-slate-400 mt-1">Initiating your priority telephonic consultation</p>
                  </div>
                </div>
              )}

              {/* ── STATE: CALLING (Ringing Phone) ── */}
              {state === 'calling' && (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-2xl ring-8 ring-emerald-500/20">
                    <Image
                      src={currentCounselor.photo}
                      alt={currentCounselor.name}
                      fill
                      sizes="160px"
                      className="object-cover object-top"
                    />
                    <span className="animate-ping absolute inset-0 rounded-3xl bg-emerald-400 opacity-40"></span>
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-white">Calling your phone... Please pick up!</h4>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">{currentCounselor.name} • {currentCounselor.role}</p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Incoming Caller ID: <strong className="text-emerald-400 font-bold">+91 22 6985 1989</strong>
                    </p>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 leading-relaxed max-w-sm mx-auto shadow-inner">
                    Please answer the call on <strong className="text-white font-bold">{formatDisplayIndianPhone(activePhone || phone)}</strong> to speak directly with {currentCounselor.name}.
                  </div>
                </div>
              )}

              {/* ── STATE: CONNECTED (In Call) ── */}
              {state === 'connected' && (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-2xl ring-8 ring-emerald-500/20">
                    <Image
                      src={currentCounselor.photo}
                      alt={currentCounselor.name}
                      fill
                      sizes="160px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-white">Call Connected with {currentCounselor.name}</h4>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">{currentCounselor.role}</p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold mt-2 bg-emerald-950/80 border border-emerald-800/60 py-1 px-3 rounded-full w-fit mx-auto">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Live Duration: {formatTimer(callDuration)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    You are currently speaking with {currentCounselor.name} on your mobile phone ({formatDisplayIndianPhone(activePhone || phone)}).
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Course syllabus and next steps will be automatically sent to your registered Email when the call ends.
                  </p>
                </div>
              )}

              {/* ── STATE: DISCONNECTED / COMPLETED (POST-CALL SUCCESS EXPERIENCE) ── */}
              {state === 'disconnected' && (
                <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 border-2 border-emerald-600/80 mx-auto flex items-center justify-center shadow-xl shadow-emerald-900/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-white">Call Completed!</h4>
                    <p className="text-xs text-emerald-300 font-medium mt-1">
                      Course details, syllabus and next steps have been sent to your Email.
                    </p>
                  </div>

                  {/* Delivery Confirmation Card with Assigned Counsellor's Photo */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto shadow-xl">
                    <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-400 shrink-0 shadow-lg">
                        <Image
                          src={currentCounselor.photo}
                          alt={currentCounselor.name}
                          fill
                          sizes="64px"
                          className="object-cover object-top"
                        />
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                          <span>{currentCounselor.name}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        <div className="text-xs font-semibold text-indigo-300">{currentCounselor.role}</div>
                        <div className="text-[11px] text-slate-400">
                          {userState} • {currentLanguage} Admissions
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 font-medium">Candidate Email:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[200px]">{submittedEmail || email}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <span className="text-slate-400 font-medium">Assigned Region:</span>
                        <span className="text-white font-semibold">{userState} ({currentLanguage})</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      Curriculum syllabus, demo class link and batch schedules have been dispatched to your email address.
                    </p>
                  </div>

                  {/* Actions: Done + View Courses */}
                  <div className="space-y-2 pt-1 max-w-md mx-auto">
                    <button
                      onClick={handleCloseModal}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      Done
                    </button>

                    <a
                      href="/courses"
                      onClick={handleCloseModal}
                      className="w-full block py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors border border-slate-700 cursor-pointer text-center"
                    >
                      Explore Courses & Curriculum
                    </a>
                  </div>
                </div>
              )}

              {/* ── STATE: ERROR ── */}
              {state === 'error' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-950/90 text-rose-400 border border-rose-800/80 mx-auto flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Unable to Connect</h4>
                    <p className="text-xs text-rose-300 mt-1 max-w-sm mx-auto leading-relaxed">
                      {errorMessage || 'You can request a call again after some time.'}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full max-w-xs mx-auto py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer block"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
