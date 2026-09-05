'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X, Sparkles } from 'lucide-react'

export interface SessionCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  studentName?: string
  candidateName?: string
  sessionTitle?: string
  courseTitle?: string
  completedSessionNum?: number
  totalSessions?: number
  nextSessionTitle?: string
  nextSessionDate?: string
  onContinueNextSession?: () => void
  nextSessionUrl?: string
  progressUrl?: string
}

export default function SessionCompletionModal({
  isOpen,
  onClose,
  studentName,
  candidateName,
  sessionTitle,
  courseTitle,
  completedSessionNum,
  totalSessions,
  nextSessionTitle,
  nextSessionDate,
  onContinueNextSession,
  nextSessionUrl = '/profile',
  progressUrl = '/profile',
}: SessionCompletionModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(10, 22, 40, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalPop {
          0% { transform: scale(0.92) translateY(12px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes balloonFloatLeft {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes balloonFloatRight {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes balloonFloatCenter {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.8; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmerGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>

      {/* Modal Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -15px rgba(10, 22, 40, 0.3), 0 0 1px 1px rgba(255, 255, 255, 0.8) inset',
          overflow: 'hidden',
          animation: 'modalPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #E2E8F0',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F1F5F9'
            e.currentTarget.style.color = '#0F172A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'
            e.currentTarget.style.color = '#64748B'
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        {/* ── TOP ARTWORK SECTION: BALLOONS, FLOWERS & GOLD SHIMMER ── */}
        <div
          style={{
            position: 'relative',
            height: '210px',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFF7ED 50%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          {/* Subtle Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '320px',
              height: '220px',
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(253, 230, 138, 0.15) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Floating Confetti Elements */}
          {[
            { left: '15%', top: '20px', delay: '0s', bg: '#F59E0B', size: '6px', rot: '12deg' },
            { left: '25%', top: '45px', delay: '0.4s', bg: '#FDA4AF', size: '7px', rot: '45deg' },
            { left: '75%', top: '25px', delay: '0.2s', bg: '#93C5FD', size: '5px', rot: '25deg' },
            { left: '85%', top: '50px', delay: '0.6s', bg: '#FBBF24', size: '6px', rot: '60deg' },
            { left: '50%', top: '15px', delay: '0.3s', bg: '#FDE047', size: '4px', rot: '30deg' },
            { left: '38%', top: '60px', delay: '0.7s', bg: '#F472B6', size: '5px', rot: '15deg' },
            { left: '62%', top: '55px', delay: '0.5s', bg: '#60A5FA', size: '6px', rot: '40deg' },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                width: c.size,
                height: c.size,
                borderRadius: i % 2 === 0 ? '50%' : '1px',
                background: c.bg,
                transform: `rotate(${c.rot})`,
                animation: `confettiFall 3s infinite ease-in-out ${c.delay}`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Sophisticated Vector Balloon & Floral Garland Artwork */}
          <svg
            viewBox="0 0 520 210"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              {/* Metallic Gold Gradient */}
              <radialGradient id="goldBalloon" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="30%" stopColor="#FDE68A" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>

              {/* Champagne Ivory Gradient */}
              <radialGradient id="ivoryBalloon" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#FEF3C7" />
                <stop offset="85%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </radialGradient>

              {/* Soft Rose Blush Gradient */}
              <radialGradient id="roseBalloon" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="40%" stopColor="#FECDD3" />
                <stop offset="80%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#E11D48" />
              </radialGradient>

              {/* Pastel Sky Blue Gradient */}
              <radialGradient id="blueBalloon" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#F0F9FF" />
                <stop offset="40%" stopColor="#BAE6FD" />
                <stop offset="80%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </radialGradient>

              {/* Pearl White Petal Gradient */}
              <linearGradient id="whitePetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Soft Pink Petal Gradient */}
              <linearGradient id="pinkPetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="60%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>

              {/* Balloon Specular Highlight */}
              <linearGradient id="specular" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* BALLOON STRINGS */}
            <g stroke="#CBD5E1" strokeWidth="1" opacity="0.6" fill="none">
              <path d="M 120 95 Q 125 150 140 190" />
              <path d="M 165 75 Q 170 140 180 195" />
              <path d="M 215 65 Q 210 130 200 195" />
              <path d="M 310 65 Q 315 130 320 195" />
              <path d="M 360 75 Q 355 140 345 195" />
              <path d="M 405 95 Q 400 150 380 190" />
            </g>

            {/* LEFT BALLOON CLUSTER */}
            {/* 1. Champagne Ivory Left (Back) */}
            <g style={{ animation: 'balloonFloatLeft 5s infinite ease-in-out' }}>
              <ellipse cx="120" cy="80" rx="34" ry="42" fill="url(#ivoryBalloon)" />
              <ellipse cx="112" cy="68" rx="14" ry="20" fill="url(#specular)" />
            </g>

            {/* 2. Metallic Gold Left (Center-Top) */}
            <g style={{ animation: 'balloonFloatCenter 6s infinite ease-in-out 0.5s' }}>
              <ellipse cx="165" cy="60" rx="38" ry="48" fill="url(#goldBalloon)" />
              <ellipse cx="155" cy="46" rx="16" ry="24" fill="url(#specular)" />
            </g>

            {/* 3. Soft Rose Blush Left (Front) */}
            <g style={{ animation: 'balloonFloatLeft 4.5s infinite ease-in-out 1s' }}>
              <ellipse cx="205" cy="85" rx="32" ry="40" fill="url(#roseBalloon)" />
              <ellipse cx="198" cy="74" rx="12" ry="18" fill="url(#specular)" />
            </g>

            {/* RIGHT BALLOON CLUSTER */}
            {/* 4. Soft Rose Blush Right (Back) */}
            <g style={{ animation: 'balloonFloatRight 5.2s infinite ease-in-out 0.7s' }}>
              <ellipse cx="320" cy="85" rx="32" ry="40" fill="url(#roseBalloon)" />
              <ellipse cx="313" cy="74" rx="12" ry="18" fill="url(#specular)" />
            </g>

            {/* 5. Metallic Gold Right (Center-Top) */}
            <g style={{ animation: 'balloonFloatCenter 5.8s infinite ease-in-out 1.2s' }}>
              <ellipse cx="360" cy="60" rx="38" ry="48" fill="url(#goldBalloon)" />
              <ellipse cx="350" cy="46" rx="16" ry="24" fill="url(#specular)" />
            </g>

            {/* 6. Pastel Sky Blue Right (Front) */}
            <g style={{ animation: 'balloonFloatRight 4.8s infinite ease-in-out 0.3s' }}>
              <ellipse cx="405" cy="80" rx="34" ry="42" fill="url(#blueBalloon)" />
              <ellipse cx="396" cy="68" rx="14" ry="20" fill="url(#specular)" />
            </g>

            {/* ── BOTANICAL FLORAL GARLAND (PEONIES, ROSES & BABY'S BREATH) ── */}
            {/* Baby's breath sprigs */}
            <g fill="#FFFFFF" opacity="0.95">
              <circle cx="210" cy="120" r="3" />
              <circle cx="218" cy="115" r="2.5" />
              <circle cx="225" cy="125" r="3" />
              <circle cx="295" cy="120" r="3" />
              <circle cx="305" cy="115" r="2.5" />
              <circle cx="312" cy="125" r="3" />
              <circle cx="255" cy="95" r="2.5" />
              <circle cx="265" cy="95" r="3" />
            </g>

            {/* Subtle Olive/Sage Foliage */}
            <g fill="#94A3B8" opacity="0.5">
              <path d="M 230 135 C 220 120 200 125 210 140 Z" />
              <path d="M 290 135 C 300 120 320 125 310 140 Z" />
              <path d="M 260 110 C 255 95 245 100 252 115 Z" />
              <path d="M 260 110 C 265 95 275 100 268 115 Z" />
            </g>

            {/* Left Blossom: Soft Pink Peony */}
            <g transform="translate(225, 140)">
              <circle cx="0" cy="0" r="16" fill="url(#pinkPetal)" opacity="0.9" />
              <circle cx="-5" cy="-3" r="10" fill="#FDA4AF" opacity="0.6" />
              <circle cx="4" cy="3" r="8" fill="#F43F5E" opacity="0.4" />
              <circle cx="0" cy="0" r="4" fill="#FFE4E6" />
            </g>

            {/* Center Master Blossom: Pristine White & Ivory Rose */}
            <g transform="translate(260, 130)">
              <circle cx="0" cy="0" r="22" fill="url(#whitePetal)" stroke="#F1F5F9" strokeWidth="1" />
              <circle cx="-6" cy="-4" r="14" fill="#FFFFFF" opacity="0.9" />
              <circle cx="5" cy="3" r="12" fill="#FEF3C7" opacity="0.6" />
              <circle cx="0" cy="0" r="7" fill="#FDE68A" opacity="0.5" />
              <circle cx="0" cy="0" r="3" fill="#D97706" opacity="0.6" />
            </g>

            {/* Right Blossom: Soft Pink Peony */}
            <g transform="translate(295, 140)">
              <circle cx="0" cy="0" r="16" fill="url(#pinkPetal)" opacity="0.9" />
              <circle cx="5" cy="-3" r="10" fill="#FDA4AF" opacity="0.6" />
              <circle cx="-4" cy="3" r="8" fill="#F43F5E" opacity="0.4" />
              <circle cx="0" cy="0" r="4" fill="#FFE4E6" />
            </g>
          </svg>

          {/* Milestone Shimmer Tag */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '50px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
              color: '#B45309',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              zIndex: 10,
            }}
          >
            <Sparkles style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
            <span>Session Accomplished</span>
          </div>
        </div>

        {/* ── CENTER CONTENT SECTION ── */}
        <div style={{ padding: '28px 32px 36px', textAlign: 'center' }}>
          
          {/* Student Badge (if present) */}
          {(studentName || candidateName) && (
            <div
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                background: '#F1F5F9',
                padding: '4px 12px',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            >
              Student: <span style={{ color: '#0F172A' }}>{studentName || candidateName}</span>
            </div>
          )}

          {/* Main Serif Heading */}
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 900,
              color: '#0A1628',
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: '-0.02em',
              margin: '0 0 10px',
              lineHeight: 1.15,
            }}
          >
            Congratulations!
          </h2>

          {/* Clean Medium Weight Subtitle */}
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1E293B',
              margin: '0 0 6px',
              lineHeight: 1.4,
            }}
          >
            {sessionTitle ? (
              <>You have successfully completed <span style={{ color: '#0284C7' }}>&ldquo;{sessionTitle}&rdquo;</span>.</>
            ) : (
              'You have successfully completed this session.'
            )}
          </p>

          {/* Supportive Motivation Line */}
          <p
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748B',
              margin: '0 auto 28px',
              maxWidth: '380px',
              lineHeight: 1.6,
            }}
          >
            Keep going — you’re one step closer to your certification{courseTitle ? ` in ${courseTitle}` : ''}.
          </p>

          {/* ── ACTION BUTTONS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            {onContinueNextSession ? (
              <button
                onClick={onContinueNextSession}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0A1628 0%, #0F213A 100%)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(10, 22, 40, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0F213A 0%, #1E3A8A 100%)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 22, 40, 0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0A1628 0%, #0F213A 100%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(10, 22, 40, 0.25)'
                }}
              >
                <span>Continue to Next Session</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            ) : (
              <Link
                href={nextSessionUrl}
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0A1628 0%, #0F213A 100%)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(10, 22, 40, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0F213A 0%, #1E3A8A 100%)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 22, 40, 0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0A1628 0%, #0F213A 100%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(10, 22, 40, 0.25)'
                }}
              >
                <span>Continue to Next Session</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            )}

            {/* Subtle Secondary Text Link */}
            <Link
              href={progressUrl}
              onClick={onClose}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748B',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                padding: '4px 8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0A1628')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              View Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
