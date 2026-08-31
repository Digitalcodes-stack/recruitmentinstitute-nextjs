'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, PhoneOff, Mic } from 'lucide-react'

// ── Female counsellor personas ─────────────────────────────────────────────
const COUNSELLORS = [
  {
    name: 'Priya',
    greeting: `Hello! This is Priya calling from Recruitment Institute. I am one of our senior career counsellors. How are you today? I noticed you were exploring our HR and recruitment courses. I would love to help you find the perfect program to launch your career. Can you tell me a little about your background and what you are hoping to achieve?`,
  },
  {
    name: 'Anjali',
    greeting: `Hi there! I am Anjali from Recruitment Institute's career guidance team. Thank you so much for your interest in our programs! We have helped over five thousand HR professionals build amazing careers. I would love to understand your goals. Whether you are a fresher or looking to switch into recruitment, we have something perfect for you. What brings you to us today?`,
  },
  {
    name: 'Sneha',
    greeting: `Hello! Sneha here from Recruitment Institute. I am calling to personally welcome you and answer any questions you might have about our courses. Our programs are designed by industry experts with real placement support. Are you looking for a full-time HR career, or perhaps building your own recruitment business? I am here to guide you step by step!`,
  },
  {
    name: 'Meera',
    greeting: `Good day! This is Meera from Recruitment Institute. I specialise in helping candidates choose the right HR and talent acquisition program for their career goals. We have live batches starting very soon with guaranteed placement support. I would love to walk you through everything. What is your current experience level in HR?`,
  },
  {
    name: 'Divya',
    greeting: `Hello! I am Divya, your dedicated career counsellor at Recruitment Institute. I am so glad you are here! Our institute has been training India's top HR professionals for years, and I am here to make sure you get the best guidance. We offer Boolean search, ATS tools, sourcing strategies, and real placement support. Shall I share more details about our upcoming batches?`,
  },
  {
    name: 'Riya',
    greeting: `Hi! Riya speaking from Recruitment Institute. Welcome! We are India's number one recruitment academy and I am personally reaching out to help you kickstart your HR career. Our students get placed within weeks of completing the course. I would love to understand what you are looking for. Are you interested in our online batch, offline, or our fast-track weekend program?`,
  },
]

let globalCallIndex = 0

function getNextCounsellor() {
  const c = COUNSELLORS[globalCallIndex % COUNSELLORS.length]
  globalCallIndex++
  return c
}

// ── Component ──────────────────────────────────────────────────────────────
type CallState = 'idle' | 'active' | 'ending'

export default function FloatingCallButton() {
  const [callState, setCallState] = useState<CallState>('idle')
  const [counsellor, setCounsellor] = useState<typeof COUNSELLORS[0] | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    setCallDuration(0)
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
  }, [])

  const endCall = useCallback((immediate = false) => {
    window.speechSynthesis?.cancel()
    stopTimer()
    if (immediate) {
      setCallState('idle')
      setCounsellor(null)
      setCallDuration(0)
    } else {
      setCallState('ending')
      setTimeout(() => {
        setCallState('idle')
        setCounsellor(null)
        setCallDuration(0)
      }, 1000)
    }
  }, [stopTimer])

  const handleCall = useCallback(() => {
    if (callState !== 'idle') return
    setVoiceError(null)

    const next = getNextCounsellor()
    setCounsellor(next)
    setCallState('active')
    startTimer()

    // Cancel anything leftover first
    window.speechSynthesis.cancel()

    const speak = () => {
      const voices = window.speechSynthesis.getVoices()

      // Pick best female/English voice
      const femaleTerms = ['female', 'woman', 'zira', 'hazel', 'heera', 'veena', 'samantha', 'karen', 'moira', 'tessa', 'fiona', 'victoria']
      let voice: SpeechSynthesisVoice | null =
        voices.find(v => femaleTerms.some(t => v.name.toLowerCase().includes(t)) && v.lang.startsWith('en')) ??
        voices.find(v => v.lang.startsWith('en-IN')) ??
        voices.find(v => v.lang.startsWith('en')) ??
        voices[0] ?? null

      const utter = new SpeechSynthesisUtterance(next.greeting)
      utter.rate = 0.9
      utter.pitch = 1.15
      utter.volume = 1
      if (voice) utter.voice = voice

      utter.onstart = () => {
        // already active
      }

      utter.onend = () => {
        stopTimer()
        setCallState('ending')
        setTimeout(() => {
          setCallState('idle')
          setCounsellor(null)
          setCallDuration(0)
        }, 1200)
      }

      utter.onerror = (e) => {
        stopTimer()
        setVoiceError('Audio error: ' + e.error)
        setCallState('idle')
        setCounsellor(null)
      }

      utterRef.current = utter
      window.speechSynthesis.speak(utter)

      // Chrome desktop bug: if suspended, resume
      setTimeout(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      }, 200)
    }

    // Voices may not be ready yet (Chrome async load)
    if (window.speechSynthesis.getVoices().length > 0) {
      speak()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', function once() {
        window.speechSynthesis.removeEventListener('voiceschanged', once)
        speak()
      })
      // Fallback if event never fires (some browsers)
      setTimeout(() => {
        speak()
      }, 1000)
    }
  }, [callState, startTimer, stopTimer])

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const isIdle = callState === 'idle'
  const isActive = callState === 'active'
  const isEnding = callState === 'ending'

  return (
    <>
      {/* ── In-call card ────────────────────────────────────── */}
      {(isActive || isEnding) && counsellor && (
        <div
          className="fixed bottom-28 right-4 sm:right-6 z-[9999] w-72 rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 55%,#0f3460 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {/* top accent bar */}
          <div className="h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500" />

          <div className="p-5">
            {/* Avatar + info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
                {counsellor.name[0]}
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping opacity-40 pointer-events-none" />
                    <span className="absolute -inset-1 rounded-full border border-pink-400/30 animate-pulse pointer-events-none" />
                  </>
                )}
              </div>
              <div>
                <p className="text-white font-black text-base">{counsellor.name}</p>
                <p className="text-violet-300 text-xs font-semibold">Career Counsellor</p>
                <p className="text-slate-400 text-xs">Recruitment Institute</p>
              </div>
            </div>

            {/* Status row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {isActive ? 'Speaking…' : 'Ending call…'}
                </span>
              </div>
              {isActive && (
                <span className="text-xs font-mono text-green-400 font-bold">{fmt(callDuration)}</span>
              )}
            </div>

            {/* Sound wave bars */}
            {isActive && (
              <div className="flex items-center justify-center gap-[3px] mb-4 h-8">
                {[0.3,0.6,1,0.7,0.4,0.9,0.5,1,0.6,0.3,0.8,0.5].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-pink-400"
                    style={{
                      height: `${h * 28}px`,
                      animation: `fcb-wave 0.7s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.07}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Hang up */}
            <button
              onClick={() => endCall(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-sm transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          </div>
        </div>
      )}

      {/* ── Floating button ──────────────────────────────────── */}
      <button
        id="floating-call-btn"
        onClick={isIdle ? handleCall : () => endCall(false)}
        aria-label={isIdle ? 'Talk to a counsellor' : 'End call'}
        className={`
          fixed bottom-[88px] right-4 sm:right-6 z-[9998]
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-xl transition-all duration-200 cursor-pointer
          ${isIdle
            ? 'bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 hover:scale-110'
            : isActive
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }
        `}
        style={{
          boxShadow: isActive
            ? '0 0 0 4px rgba(34,197,94,0.3), 0 8px 24px rgba(0,0,0,0.35)'
            : isIdle
              ? '0 8px 24px rgba(109,40,217,0.5)'
              : '0 8px 24px rgba(239,68,68,0.4)',
        }}
      >
        {isActive ? <Mic className="w-6 h-6 text-white" /> : isEnding ? <PhoneOff className="w-6 h-6 text-white" /> : <Phone className="w-6 h-6 text-white" />}

        {/* pulse ring when idle */}
        {isIdle && (
          <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping opacity-50 pointer-events-none" />
        )}
      </button>

      {/* Error toast */}
      {voiceError && (
        <div className="fixed bottom-48 right-4 sm:right-6 z-[9999] bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg max-w-xs">
          {voiceError}
        </div>
      )}

      <style>{`
        @keyframes fcb-wave {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}
