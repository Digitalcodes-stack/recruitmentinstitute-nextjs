'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Laptop,
  Building2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react'
import { BatchItem, UpcomingBatchesProps } from '@/types/training'
import { DEFAULT_BATCHES } from '@/lib/data/trainingData'
import RazorpayCheckoutModal from '@/components/payments/RazorpayCheckoutModal'

export default function UpcomingBatches({
  batches = DEFAULT_BATCHES,
  title = 'Upcoming Live Batches',
  subtitle = 'Industry-accredited cohorts with weekend & evening schedules • Limited to 25 learners per batch',
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
          accentBorder: 'from-sky-500 to-blue-600',
          dotClass: 'bg-sky-500',
        }
      case 'OFFLINE':
        return {
          label: 'Pune Classroom',
          icon: <Building2 className="w-3.5 h-3.5" />,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          accentBorder: 'from-emerald-500 to-teal-600',
          dotClass: 'bg-emerald-500',
        }
      case 'HYBRID':
        return {
          label: 'Executive Hybrid',
          icon: <Layers className="w-3.5 h-3.5" />,
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
          accentBorder: 'from-purple-500 to-indigo-600',
          dotClass: 'bg-purple-500',
        }
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/60 to-white relative overflow-hidden" id="upcoming-batches">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-100 text-[#E63946] text-xs font-extrabold uppercase tracking-wider mb-3.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#E63946] animate-ping inline-block" />
            <span>2025–2026 Admissions Open</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] tracking-tight leading-tight mb-4">
            Upcoming <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-600">Batches</span> & Cohorts
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            {subtitle}
          </p>

          {/* ── SEGMENTED FILTER CONTROLS ───────────────────────────── */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-200/60 backdrop-blur-xs border border-slate-200/80 shadow-inner max-w-full overflow-x-auto">
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: 'All Cohorts', count: rawBatches.length },
                { id: 'ONLINE', label: 'Live Online', count: rawBatches.filter((b) => b.mode === 'ONLINE').length },
                { id: 'OFFLINE', label: 'Pune Classroom', count: rawBatches.filter((b) => b.mode === 'OFFLINE').length },
                { id: 'HYBRID', label: 'Hybrid Tracks', count: rawBatches.filter((b) => b.mode === 'HYBRID').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMode(tab.id as any)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    selectedMode === tab.id
                      ? 'bg-white text-[#0A1628] shadow-md shadow-slate-900/5 ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-[#0A1628] hover:bg-white/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      selectedMode === tab.id ? 'bg-slate-100 text-[#0A1628]' : 'bg-slate-300/60 text-slate-600'
                    }`}
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
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No batches scheduled currently</h3>
            <p className="text-xs text-slate-500 mb-5">
              New cohorts for this format will be announced shortly. Contact admissions for upcoming slot requests.
            </p>
            <button
              onClick={() => setSelectedMode('ALL')}
              className="px-4 py-2 bg-[#0A1628] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              View All Active Batches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleBatches.map((batch) => {
              const modeInfo = getModeInfo(batch.mode)
              const seatsLeft = batch.totalSeats - batch.enrolledCount
              const isLowSeats = seatsLeft <= 5

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Color Accent Line */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${modeInfo.accentBorder}`} />

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${modeInfo.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${modeInfo.dotClass}`} />
                          {modeInfo.icon}
                          <span>{modeInfo.label}</span>
                        </span>

                        <span className="text-[10.5px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          {batch.batchCode}
                        </span>
                      </div>

                      {/* Course Title & Track */}
                      <Link href={batch.courseHref} className="block group/title">
                        <h3 className="text-lg font-bold text-[#0A1628] group-hover/title:text-[#E63946] transition-colors leading-snug mb-1">
                          {batch.courseTitle}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 font-semibold mb-4 line-clamp-1">
                        {batch.name}
                      </p>

                      {/* Date & Schedule Box */}
                      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 mb-4 space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                            <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">START</span>
                            <span className="text-xs font-black text-slate-900 leading-none">
                              {batch.startDate.split(' ')[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                              Cohort Commences
                            </span>
                            <span className="text-xs font-bold text-[#0A1628]">
                              {batch.startDate}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 gap-1 text-[11px] text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{batch.schedule}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Duration: {batch.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Faculty Lead Pill */}
                      {batch.trainer && (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 mb-4 shadow-2xs">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={batch.trainer.image}
                              alt={batch.trainer.name}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none mb-0.5">
                              Faculty Lead
                            </span>
                            <span className="text-xs font-bold text-[#0A1628] block truncate">
                              {batch.trainer.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Pricing, Urgency & Actions */}
                    <div className="pt-4 border-t border-slate-100">
                      {/* Seat Urgency Indicator */}
                      <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                        <span className={`flex items-center gap-1 ${isLowSeats ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                          <Users className="w-3 h-3" />
                          <span>{isLowSeats ? `Only ${seatsLeft} seats remaining` : `${seatsLeft} seats available`}</span>
                        </span>
                        <span className="text-slate-400 font-semibold">
                          {batch.enrolledCount}/{batch.totalSeats} Filled
                        </span>
                      </div>

                      {/* Seat Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isLowSeats ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(batch.enrolledCount / batch.totalSeats) * 100}%` }}
                        />
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-xs text-slate-400 line-through mr-2 font-semibold">
                            {formatPrice(batch.originalPrice)}
                          </span>
                          <span className="text-xl font-black text-[#0A1628]">
                            {formatPrice(batch.discountedPrice)}
                          </span>
                        </div>
                        <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {Math.round(((batch.originalPrice - batch.discountedPrice) / batch.originalPrice) * 100)}% OFF
                        </span>
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleEnrollClick(batch)}
                          className="py-3 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs hover:from-red-700 hover:to-rose-700 transition-all shadow-md shadow-red-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Enroll Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={batch.courseHref}
                          className="py-3 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center gap-1 text-center"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
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
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors cursor-pointer shadow-xs"
            >
              <span>{showAll ? 'Show Less Batches' : `View All ${filteredBatches.length} Batches`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        )}

        {/* ── TRUST SIGNALS FOOTER ────────────────────────────────────── */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Corporate Faculty Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Live Recruiter ATS & AI Labs</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
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
