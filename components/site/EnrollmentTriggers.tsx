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
  const [isVisible, setIsVisible] = useState(false)

  // Listen for clicks on buttons with data-open-enrollment-modal
  useEffect(() => {
    const handleTriggerClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-open-enrollment-modal]') as HTMLElement | null
      if (target) {
        e.preventDefault()
        const track = (target.getAttribute('data-track') as 'free-starter' | 'pro-certification') || 'free-starter'
        setSelectedTrack(track)
        setIsOpen(true)
      }
    }

    document.addEventListener('click', handleTriggerClick)
    return () => document.removeEventListener('click', handleTriggerClick)
  }, [])

  // Show floating button after slight scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Floating Sticky Enroll Now Pill Button */}
      {showFloatingButton && (
        <div
          className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={() => {
              setSelectedTrack('free-starter')
              setIsOpen(true)
            }}
            id="floating-enroll-now-btn"
            className="group flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
            aria-label="Open Enrollment Guide Modal"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
            </span>
            <GraduationCap className="w-4 h-4 text-amber-300 transition-transform group-hover:rotate-12" />
            <span className="tracking-wide">ENROLL NOW - Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Interactive Modal */}
      <EnrollmentGuideModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialTrack={selectedTrack}
      />
    </>
  )
}
