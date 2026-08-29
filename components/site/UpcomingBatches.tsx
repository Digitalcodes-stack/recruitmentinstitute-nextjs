'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Laptop,
  Building2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { BatchItem, UpcomingBatchesProps } from '@/types/training'
import { DEFAULT_BATCHES } from '@/lib/data/trainingData'
import RazorpayCheckoutModal from '@/components/payments/RazorpayCheckoutModal'

export default function UpcomingBatches({
  batches = DEFAULT_BATCHES,
  title = 'Upcoming Batches & Cohorts',
  subtitle = 'Limited seats • Live Online + Offline options • New batches every month',
  showAllButton = true,
  defaultFilter = 'ALL',
}: UpcomingBatchesProps) {
  const [selectedMode, setSelectedMode] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'HYBRID'>(defaultFilter)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null)
  const [showAll, setShowAll] = useState(false)

  const rawBatches = batches && batches.length > 0 ? batches : DEFAULT_BATCHES

  const filteredBatches = useMemo(() => {
    if (selectedMode === 'ALL') return rawBatches
    return rawBatches.filter((b) => b.mode === selectedMode)
  }, [rawBatches, selectedMode])

  const visibleBatches = useMemo(() => {
    if (showAll || !showAllButton) return filteredBatches
    return filteredBatches.slice(0, 6)
  }, [filteredBatches, showAll, showAllButton])

  const handleEnrollClick = (batch: BatchItem) => {
    setSelectedBatch(batch)
    setCheckoutOpen(true)
  }

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p)
  }

  const getModeInfo = (mode: 'ONLINE' | 'OFFLINE' | 'HYBRID') => {
    switch (mode) {
      case 'ONLINE':
        return {
          label: 'Live Online Cohort',
          icon: <Laptop className="w-3.5 h-3.5" />,
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
          accentBorder: '#0284C7',
          dotClass: 'bg-sky-500',
        }
      case 'OFFLINE':
        return {
          label: 'Pune Classroom',
          icon: <Building2 className="w-3.5 h-3.5" />,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          accentBorder: '#059669',
          dotClass: 'bg-emerald-500',
        }
      case 'HYBRID':
        return {
          label: 'Executive Hybrid',
          icon: <Layers className="w-3.5 h-3.5" />,
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
          accentBorder: '#7C3AED',
          dotClass: 'bg-purple-500',
        }
    }
  }

  const getCourseTheme = (courseTitle: string = '', courseSlug: string = '') => {
    const normalized = (courseTitle + ' ' + courseSlug).toLowerCase()

    if (normalized.includes('entrepreneur') || normalized.includes('accelerator')) {
      return {
        name: 'Entrepreneurship',
        accentColor: '#D97706',
        headerGradient: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)',
        cardBorder: '#FDE68A',
        cardShadow: 'rgba(217, 119, 6, 0.08)',
        badgeBg: '#FFFBEB',
        badgeText: '#B45309',
        badgeBorder: '#FDE68A',
        dateBoxStartColor: '#D97706',
        btnGradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
        btnShadow: 'rgba(217, 119, 6, 0.3)',
      }
    }

    if (normalized.includes('corporate')) {
      return {
        name: 'Corporate Training',
        accentColor: '#4F46E5',
        headerGradient: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)',
        cardBorder: '#C7D2FE',
        cardShadow: 'rgba(79, 70, 229, 0.08)',
        badgeBg: '#EEF2FF',
        badgeText: '#4338CA',
        badgeBorder: '#C7D2FE',
        dateBoxStartColor: '#4F46E5',
        btnGradient: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
        btnShadow: 'rgba(79, 70, 229, 0.3)',
      }
    }

    if (normalized.includes('consulting') || normalized.includes('growth')) {
      return {
        name: 'Business Consulting',
        accentColor: '#059669',
        headerGradient: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
        cardBorder: '#BBF7D0',
        cardShadow: 'rgba(5, 150, 105, 0.08)',
        badgeBg: '#F0FDF4',
        badgeText: '#047857',
        badgeBorder: '#BBF7D0',
        dateBoxStartColor: '#059669',
        btnGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        btnShadow: 'rgba(5, 150, 105, 0.3)',
      }
    }

    if (normalized.includes('masterclass') || normalized.includes('senior') || normalized.includes('advanced')) {
      return {
        name: 'Senior Professionals',
        accentColor: '#7C3AED',
        headerGradient: 'linear-gradient(90deg, #7C3AED 0%, #9333EA 100%)',
        cardBorder: '#DDD6FE',
        cardShadow: 'rgba(124, 58, 237, 0.08)',
        badgeBg: '#F5F3FF',
        badgeText: '#6D28D9',
        badgeBorder: '#DDD6FE',
        dateBoxStartColor: '#7C3AED',
        btnGradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        btnShadow: 'rgba(124, 58, 237, 0.3)',
      }
    }

    if (normalized.includes('starter') || normalized.includes('fresher') || normalized.includes('beginner')) {
      return {
        name: 'For Freshers',
        accentColor: '#0284C7',
        headerGradient: 'linear-gradient(90deg, #0284C7 0%, #06B6D4 100%)',
        cardBorder: '#BAE6FD',
        cardShadow: 'rgba(2, 132, 199, 0.08)',
        badgeBg: '#F0F9FF',
        badgeText: '#0369A1',
        badgeBorder: '#BAE6FD',
        dateBoxStartColor: '#0284C7',
        btnGradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        btnShadow: 'rgba(2, 132, 199, 0.3)',
      }
    }

    // Default / Professional
    return {
      name: 'For Professionals',
      accentColor: '#DC2626',
      headerGradient: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
      cardBorder: '#FECACA',
      cardShadow: 'rgba(220, 38, 38, 0.08)',
      badgeBg: '#FEF2F2',
      badgeText: '#B91C1C',
      badgeBorder: '#FECACA',
      dateBoxStartColor: '#DC2626',
      btnGradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      btnShadow: 'rgba(220, 38, 38, 0.3)',
    }
  }

  const getCountdownInfo = (startDateStr?: string, displayStr?: string) => {
    let target: Date | null = null
    if (startDateStr) {
      const d = new Date(startDateStr)
      if (!isNaN(d.getTime())) target = d
    }
    if (!target && displayStr) {
      const d = new Date(displayStr)
      if (!isNaN(d.getTime())) target = d
    }

    if (!target) {
      return {
        badgeText: 'Admissions Open',
        hurryText: '⚡ Limited seats available — Reserve your seat!',
        badgeClass: 'badge-flash-amber',
        isUrgent: false,
      }
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return {
        badgeText: '🔥 Starts Today',
        hurryText: '⚡ Batch starts today — Final registrations closing!',
        badgeClass: 'badge-flash-red',
        isUrgent: true,
      }
    } else if (diffDays === 1) {
      return {
        badgeText: '🚀 Starts Tomorrow',
        hurryText: '🔥 Starting tomorrow — Final registrations closing!',
        badgeClass: 'badge-flash-red',
        isUrgent: true,
      }
    } else if (diffDays > 1 && diffDays <= 7) {
      return {
        badgeText: `⚡ Starts in ${diffDays} Days`,
        hurryText: `⏳ Only ${diffDays} days left — Admissions closing fast!`,
        badgeClass: 'badge-flash-orange',
        isUrgent: true,
      }
    } else if (diffDays > 7 && diffDays <= 20) {
      return {
        badgeText: `📅 Starts in ${diffDays} Days`,
        hurryText: `✨ Upcoming cohort — Enroll early to secure seat`,
        badgeClass: 'badge-flash-amber',
        isUrgent: false,
      }
    } else if (diffDays > 20) {
      return {
        badgeText: `🗓️ Starting Soon`,
        hurryText: `✨ Pre-registrations open for this batch`,
        badgeClass: 'badge-flash-blue',
        isUrgent: false,
      }
    } else {
      return {
        badgeText: '🎯 Admissions Open',
        hurryText: '⚡ New registrations open for this cohort',
        badgeClass: 'badge-flash-green',
        isUrgent: false,
      }
    }
  }

  return (
    <section style={{ background: '#F8FAFC', padding: '80px 0 96px', position: 'relative' }} id="upcoming-batches">
      <style>{`
        @keyframes flashPulseRed {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          50% { box-shadow: 0 0 12px 3px rgba(220, 38, 38, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
        }
        @keyframes flashPulseOrange {
          0% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          50% { box-shadow: 0 0 10px 2px rgba(234, 88, 12, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
        }
        .badge-flash-red {
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          color: #FFFFFF !important;
          border: 1px solid #EF4444;
          animation: flashPulseRed 2s infinite ease-in-out;
        }
        .badge-flash-orange {
          background: #FFF7ED;
          color: #C2410C !important;
          border: 1px solid #FDBA74;
          animation: flashPulseOrange 2.2s infinite ease-in-out;
        }
        .badge-flash-amber {
          background: #FFFBEB;
          color: #B45309 !important;
          border: 1px solid #FDE68A;
        }
        .badge-flash-blue {
          background: #EFF6FF;
          color: #1D4ED8 !important;
          border: 1px solid #BFDBFE;
        }
        .badge-flash-green {
          background: #F0FDF4;
          color: #15803D !important;
          border: 1px solid #BBF7D0;
        }
        .batch-card-hover {
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }
        .batch-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12) !important;
        }
        @media (max-width: 768px) {
          .batches-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '50px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '11px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <Sparkles style={{ width: '13px', height: '13px', color: '#DC2626' }} />
            <span>2025–2026 Admissions Open</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 14px' }}>
            Upcoming <span style={{ color: '#E63946' }}>Batches</span> &amp; Cohorts
          </h2>

          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {subtitle}
          </p>

          {/* ── SEGMENTED FILTER CONTROLS ───────────────────────────── */}
          <div style={{ marginTop: '28px', display: 'inline-flex', padding: '5px', borderRadius: '16px', background: '#E2E8F0', maxWidth: '100%', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[
                { id: 'ALL', label: 'All Cohorts', count: rawBatches.length },
                { id: 'ONLINE', label: 'Live Online', count: rawBatches.filter((b) => b.mode === 'ONLINE').length },
                { id: 'OFFLINE', label: 'Pune Classroom', count: rawBatches.filter((b) => b.mode === 'OFFLINE').length },
                { id: 'HYBRID', label: 'Hybrid Tracks', count: rawBatches.filter((b) => b.mode === 'HYBRID').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMode(tab.id as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: selectedMode === tab.id ? '#FFFFFF' : 'transparent',
                    color: selectedMode === tab.id ? '#0F172A' : '#64748B',
                    boxShadow: selectedMode === tab.id ? '0 2px 8px rgba(15,23,42,0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 7px',
                      borderRadius: '50px',
                      fontWeight: 800,
                      background: selectedMode === tab.id ? '#F1F5F9' : '#CBD5E1',
                      color: selectedMode === tab.id ? '#0F172A' : '#475569',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BATCH CARDS GRID ────────────────────────────────────────── */}
        {visibleBatches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px', border: '1px dashed #CBD5E1', maxWidth: '500px', margin: '0 auto' }}>
            <Calendar style={{ width: '48px', height: '48px', color: '#94A3B8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>No batches scheduled currently</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              New cohorts for this format will be announced shortly. Contact admissions for upcoming slot requests.
            </p>
            <button
              onClick={() => setSelectedMode('ALL')}
              style={{ padding: '10px 20px', background: '#0F172A', color: '#fff', fontSize: '13px', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              View All Active Batches
            </button>
          </div>
        ) : (
          <div className="batches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
            {visibleBatches.map((batch) => {
              const modeInfo = getModeInfo(batch.mode)
              const theme = getCourseTheme(batch.courseTitle, batch.courseSlug)
              const seatsRemaining = batch.seatsLeft ?? Math.max(0, batch.capacity - batch.enrolledCount)
              const isLowSeats = seatsRemaining <= 5
              const courseLink = batch.courseSlug.startsWith('/') ? batch.courseSlug : `/${batch.courseSlug}`
              const countdown = getCountdownInfo(batch.startDate, batch.displayStartDate)

              return (
                <div
                  key={batch.id}
                  className="batch-card-hover"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: countdown.isUrgent ? '1.5px solid #FCA5A5' : `1.5px solid ${theme.cardBorder}`,
                    boxShadow: `0 4px 20px ${theme.cardShadow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Top Color Accent Line */}
                  <div style={{ height: '5px', width: '100%', background: theme.headerGradient }} />

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Top Badges Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${modeInfo.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${modeInfo.dotClass}`} />
                            {modeInfo.icon}
                            <span>{modeInfo.label}</span>
                          </span>

                          <span style={{ fontSize: '10.5px', fontWeight: 800, color: theme.badgeText, background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, padding: '3px 9px', borderRadius: '50px' }}>
                            {theme.name}
                          </span>
                        </div>

                        {/* Countdown Badge */}
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${countdown.badgeClass}`}
                          style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
                        >
                          <span>{countdown.badgeText}</span>
                        </div>
                      </div>

                      {/* Course Title */}
                      <Link href={courseLink} style={{ textDecoration: 'none', display: 'block', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1.3, transition: 'color 0.2s' }}>
                          {batch.courseTitle}
                        </h3>
                      </Link>

                      {/* Cohort Name & Batch Code (Redesigned: Clean Stack without overflow) */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600, margin: 0, lineHeight: 1.4, flex: 1 }}>
                          {batch.name}
                        </p>
                        <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#475569', fontWeight: 800, background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {batch.batchCode}
                        </span>
                      </div>

                      {/* Date & Schedule Box (Redesigned: Clean Spacing, Full Content Visible) */}
                      <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#FFFFFF', border: `1.5px solid ${theme.cardBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: theme.dateBoxStartColor, letterSpacing: '.06em' }}>START</span>
                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                              {batch.displayStartDate ? batch.displayStartDate.split(' ')[0] : batch.startDate.split('-')[2] || '12'}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                              Cohort Commences
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                              {batch.displayStartDate || batch.startDate}
                            </span>
                          </div>
                        </div>

                        {/* Schedule & Duration rows with full wrapping */}
                        <div style={{ paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <Clock style={{ width: '14px', height: '14px', color: '#64748B', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ lineHeight: 1.45 }}>{batch.schedule}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar style={{ width: '14px', height: '14px', color: '#64748B', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, color: '#0F172A' }}>Duration: {batch.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Lead Pill */}
                      {batch.trainerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                          {batch.trainerImage ? (
                            <div style={{ position: 'relative', width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #CBD5E1' }}>
                              <Image
                                src={batch.trainerImage}
                                alt={batch.trainerName}
                                fill
                                sizes="34px"
                                style={{ objectFit: 'cover', objectPosition: 'top' }}
                              />
                            </div>
                          ) : (
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              {batch.trainerName[0]}
                            </div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800, color: '#94A3B8', display: 'block', lineHeight: 1, marginBottom: '2px' }}>
                              Faculty Lead
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {batch.trainerName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Pricing, Urgency & Actions */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      {/* Seat Urgency Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isLowSeats ? '#DC2626' : '#475569' }}>
                          <Users style={{ width: '13px', height: '13px' }} />
                          <span>{isLowSeats ? `Only ${seatsRemaining} seats remaining` : `${seatsRemaining} seats available`}</span>
                        </span>
                        <span style={{ color: '#94A3B8', fontWeight: 600 }}>
                          {batch.enrolledCount}/{batch.capacity} Filled
                        </span>
                      </div>

                      {/* Seat Progress Bar */}
                      <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '50px', overflow: 'hidden', marginBottom: '14px' }}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '50px',
                            background: isLowSeats ? '#EF4444' : '#10B981',
                            width: `${Math.max(8, (batch.enrolledCount / batch.capacity) * 100)}%`,
                          }}
                        />
                      </div>

                      {/* Pricing Row — Online & Offline side by side */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                            Online 50% OFF
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            {formatPrice(batch.onlinePrice)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
                            Classroom 10% OFF
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            {formatPrice(batch.offlinePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Hurry Up Urgency Strip */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: countdown.isUrgent ? '#FEF2F2' : '#F8FAFC',
                          border: countdown.isUrgent ? '1px solid #FECACA' : '1px solid #E2E8F0',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: countdown.isUrgent ? '#DC2626' : '#475569',
                          marginBottom: '16px',
                        }}
                      >
                        <Zap style={{ width: '13px', height: '13px', color: countdown.isUrgent ? '#DC2626' : '#2563EB', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {countdown.hurryText}
                        </span>
                      </div>

                      {/* Dual Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => handleEnrollClick(batch)}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '12px',
                            background: theme.btnGradient,
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: `0 4px 14px ${theme.btnShadow}`,
                            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                          }}
                        >
                          <span>Enroll Now</span>
                          <ArrowRight style={{ width: '14px', height: '14px' }} />
                        </button>

                        <Link
                          href={courseLink}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '12px',
                            background: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '13px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: '1px solid #CBD5E1',
                            textAlign: 'center',
                            transition: 'background 0.18s ease',
                          }}
                        >
                          <BookOpen style={{ width: '14px', height: '14px' }} />
                          <span>Curriculum</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── SHOW MORE TOGGLE ────────────────────────────────────────── */}
        {showAllButton && filteredBatches.length > 6 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                color: '#1E293B',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{showAll ? 'Show Less Batches' : `View All ${filteredBatches.length} Batches`}</span>
              <ChevronRight style={{ width: '14px', height: '14px', transform: showAll ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
            </button>
          </div>
        )}

        {/* ── TRUST SIGNALS FOOTER ────────────────────────────────────── */}
        <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '32px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669' }} />
            <span>100% Corporate Faculty Guarantee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#D97706' }} />
            <span>Live Recruiter ATS &amp; AI Labs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ width: '16px', height: '16px', color: '#2563EB' }} />
            <span>Govt / ISO Recognized Certification</span>
          </div>
        </div>
      </div>

      {/* Razorpay Instant Checkout Modal */}
      {selectedBatch && (
        <RazorpayCheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false)
            setSelectedBatch(null)
          }}
          courseId={selectedBatch.courseId}
          courseTitle={selectedBatch.courseTitle}
          batchId={selectedBatch.id}
          batchName={selectedBatch.name}
          batchSchedule={selectedBatch.schedule}
          originalPrice={selectedBatch.originalPrice}
          discountedPrice={selectedBatch.discountedPrice}
        />
      )}
    </section>
  )
}
