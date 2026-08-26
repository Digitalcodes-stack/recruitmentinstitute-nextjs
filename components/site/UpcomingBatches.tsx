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

  return (
    <section style={{ background: '#F8FAFC', padding: '80px 0', position: 'relative' }} id="upcoming-batches">
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '11px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span>2025–2026 Admissions Open</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 14px' }}>
            Upcoming <span style={{ color: '#E63946' }}>Batches</span> &amp; Cohorts
          </h2>

          <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
            {subtitle}
          </p>

          {/* ── SEGMENTED FILTER CONTROLS ───────────────────────────── */}
          <div style={{ marginTop: '28px', display: 'inline-flex', padding: '6px', borderRadius: '16px', background: '#E2E8F0', maxWidth: '100%', overflowX: 'auto' }}>
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
                      fontSize: '10px',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
            {visibleBatches.map((batch) => {
              const modeInfo = getModeInfo(batch.mode)
              const seatsRemaining = batch.seatsLeft ?? Math.max(0, batch.capacity - batch.enrolledCount)
              const isLowSeats = seatsRemaining <= 5
              const courseLink = batch.courseSlug.startsWith('/') ? batch.courseSlug : `/${batch.courseSlug}`

              return (
                <div
                  key={batch.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {/* Top Color Accent Line */}
                  <div style={{ height: '4px', width: '100%', background: modeInfo.accentBorder }} />

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Top Badges Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${modeInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${modeInfo.dotClass}`} />
                          {modeInfo.icon}
                          <span>{modeInfo.label}</span>
                        </span>

                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          {batch.batchCode}
                        </span>
                      </div>

                      {/* Course Title & Track */}
                      <Link href={courseLink} style={{ textDecoration: 'none', display: 'block' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginBottom: '4px' }}>
                          {batch.courseTitle}
                        </h3>
                      </Link>

                      <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {batch.name}
                      </p>

                      {/* Date & Schedule Box */}
                      <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: '#EF4444', letterSpacing: '.08em' }}>START</span>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                              {batch.displayStartDate ? batch.displayStartDate.split(' ')[0] : batch.startDate.split('-')[2] || '15'}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800, color: '#94A3B8', display: 'block' }}>
                              Cohort Commences
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                              {batch.displayStartDate || batch.startDate}
                            </span>
                          </div>
                        </div>

                        <div style={{ paddingTop: '8px', borderTop: '1px solid #E2E8F0', display: 'grid', gap: '4px', fontSize: '11.5px', color: '#475569', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock style={{ width: '13px', height: '13px', color: '#94A3B8', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{batch.schedule}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar style={{ width: '13px', height: '13px', color: '#94A3B8', flexShrink: 0 }} />
                            <span>Duration: {batch.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Lead Pill */}
                      {batch.trainerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                          {batch.trainerImage ? (
                            <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                              <Image
                                src={batch.trainerImage}
                                alt={batch.trainerName}
                                fill
                                style={{ objectFit: 'cover', objectPosition: 'top' }}
                              />
                            </div>
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                              {batch.trainerName[0]}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800, color: '#94A3B8', display: 'block', lineHeight: 1, marginBottom: '2px' }}>
                              Faculty Lead
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {batch.trainerName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Pricing, Urgency & Actions */}
                    <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      {/* Seat Urgency Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isLowSeats ? '#DC2626' : '#475569' }}>
                          <Users style={{ width: '12px', height: '12px' }} />
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
                            width: `${(batch.enrolledCount / batch.capacity) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Pricing Row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', marginRight: '8px', fontWeight: 600 }}>
                            {formatPrice(batch.originalPrice)}
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>
                            {formatPrice(batch.discountedPrice)}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                          {Math.round(((batch.originalPrice - batch.discountedPrice) / batch.originalPrice) * 100)}% OFF
                        </span>
                      </div>

                      {/* Dual Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => handleEnrollClick(batch)}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #DC2626 0%, #E63946 100%)',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(220,38,38,0.25)',
                          }}
                        >
                          <span>Enroll Now</span>
                          <ArrowRight style={{ width: '13px', height: '13px' }} />
                        </button>

                        <Link
                          href={courseLink}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '12px',
                            background: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '12px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            border: '1px solid #E2E8F0',
                            textAlign: 'center',
                          }}
                        >
                          <BookOpen style={{ width: '13px', height: '13px' }} />
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
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
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
