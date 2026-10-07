'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, GraduationCap } from 'lucide-react'
import EnrollmentGuideModal from './EnrollmentGuideModal'

interface EnrollmentTriggersProps {
  showFloatingButton?: boolean
}

export default function EnrollmentTriggers({ showFloatingButton = true }: EnrollmentTriggersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<'free-starter' | 'pro-certification'>('free-starter')

  // Comprehensive global click listener for "Enroll Now" & "Join Now" triggers
  useEffect(() => {
    const handleTriggerClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return

      // 1. Direct explicit trigger attribute
      const explicitTrigger = el.closest('[data-open-enrollment-modal]') as HTMLElement | null
      if (explicitTrigger) {
        e.preventDefault()
        e.stopPropagation()
        const track = (explicitTrigger.getAttribute('data-track') as 'free-starter' | 'pro-certification') || 'free-starter'
        setSelectedTrack(track)
        setIsOpen(true)
        return
      }

      // 2. Check if clicked button or link has "Enroll Now" or "Join Now" text or matching ID
      const interactiveEl = el.closest('button, a') as HTMLElement | null
      if (interactiveEl) {
        const text = (interactiveEl.textContent || '').trim().toLowerCase()
        const id = (interactiveEl.id || '').toLowerCase()
        const isEnrollTrigger =
          id.includes('enroll-now') ||
          text.includes('enroll now') ||
          text.includes('join now - it\'s free') ||
          text.includes('join now - free') ||
          text.includes('join free now') ||
          text === 'claim your free student membership'

        // If it's a smooth scroll anchor to #how-to-enroll, allow native scroll
        const href = interactiveEl.getAttribute('href') || ''
        if (href === '#how-to-enroll') {
          return
        }

        if (isEnrollTrigger) {
          e.preventDefault()
          e.stopPropagation()
          setSelectedTrack('free-starter')
          setIsOpen(true)
        }
      }
    }

    document.addEventListener('click', handleTriggerClick, true)
    return () => document.removeEventListener('click', handleTriggerClick, true)
  }, [])

  return (
    <>
      {/* Floating Sticky Enroll Now Pill Button matching #0c1938 dark blue theme */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSelectedTrack('free-starter')
              setIsOpen(true)
            }}
            id="floating-enroll-now-btn"
            className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white font-black text-sm shadow-[0_10px_30px_rgba(29,78,216,0.5)] hover:shadow-[0_15px_40px_rgba(29,78,216,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer"
            aria-label="Open Enrollment Guide Modal"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
            </span>
            <GraduationCap className="w-4 h-4 text-amber-300 transition-transform group-hover:rotate-12" />
            <span className="tracking-wide uppercase text-xs sm:text-sm font-black">ENROLL NOW - Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Interactive "How to Claim Your Student Membership" Modal */}
      <EnrollmentGuideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialTrack={selectedTrack}
      />
    </>
  )
}
