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
} from 'lucide-react'
import { BatchItem, UpcomingBatchesProps } from '@/types/training'
import { DEFAULT_BATCHES } from '@/lib/data/trainingData'
import EnquiryModal from '@/components/home/EnquiryModal'
import RazorpayCheckoutModal from '@/components/payments/RazorpayCheckoutModal'

export default function UpcomingBatches({
  batches = DEFAULT_BATCHES,
  title = 'Upcoming Batches',
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

  const getModeBadge = (mode: 'ONLINE' | 'OFFLINE' | 'HYBRID') => {
    switch (mode) {
      case 'ONLINE':
        return {
          label: 'Live Online',
          icon: <Laptop className="w-3.5 h-3.5" />,
          bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
          dot: 'bg-sky-500',
        }
      case 'OFFLINE':
        return {
          label: 'Pune Classroom',
          icon: <Building2 className="w-3.5 h-3.5" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
        }
      case 'HYBRID':
        return {
          label: 'Hybrid Cohort',
          icon: <Layers className="w-3.5 h-3.5" />,
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dot: 'bg-purple-500',
        }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC] border-y border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Live Cohort Admissions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] tracking-tight mb-4">
            {title} <span className="text-red-600">2025–2026</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {subtitle}
          </p>

          {/* Clean Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs max-w-fit mx-auto">
            {[
              { id: 'ALL', label: 'All Batches' },
              { id: 'ONLINE', label: 'Live Online' },
              { id: 'OFFLINE', label: 'Pune Classroom' },
              { id: 'HYBRID', label: 'Hybrid Cohorts' },
            ].map((tab) => {
              const active = selectedMode === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMode(tab.id as typeof selectedMode)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#0A1628] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'ALL' && (
                    <span className="ml-1.5 text-xs opacity-75 font-normal">({rawBatches.length})</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No batches currently found</h3>
            <p className="text-sm text-slate-600 mb-6">
              New cohorts start every two weeks. Please check other delivery modes.
            </p>
            <button
              onClick={() => setSelectedMode('ALL')}
              className="px-5 py-2.5 bg-[#0A1628] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              View All Batches
            </button>
          </div>
        ) : (
          /* Batches Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {visibleBatches.map((batch) => {
              const modeMeta = getModeBadge(batch.mode)
              const isUrgent = batch.seatsLeft <= 8
              const savings = batch.originalPrice - batch.discountedPrice
              const discountPercent = Math.round((savings / batch.originalPrice) * 100)

              return (
                <div
                  key={batch.id}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-red-300 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(10,22,40,0.12)] flex flex-col justify-between overflow-hidden shadow-xs"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className={`h-2 w-full ${
                      batch.mode === 'ONLINE'
                        ? 'bg-sky-500'
                        : batch.mode === 'OFFLINE'
                        ? 'bg-emerald-500'
                        : 'bg-purple-500'
                    }`}
                  />

                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    {/* Header: Mode & Batch Code */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${modeMeta.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${modeMeta.dot}`} />
                        {modeMeta.icon}
                        {modeMeta.label}
                      </span>

                      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        {batch.batchCode}
                      </span>
                    </div>

                    {/* Course Title */}
                    <div className="mb-4">
                      <Link
                        href={`/${batch.courseSlug}`}
                        className="text-lg sm:text-xl font-extrabold text-[#0A1628] hover:text-red-600 transition-colors leading-snug block"
                      >
                        {batch.courseTitle}
                      </Link>
                      <p className="text-xs font-bold text-slate-500 mt-1">{batch.name}</p>
                    </div>

                    {/* Start Date & Schedule Card */}
                    <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 mb-5 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shadow-xs shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Commences On
                          </p>
                          <p className="text-sm sm:text-base font-extrabold text-[#0A1628]">
                            {batch.displayStartDate || batch.startDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{batch.duration}</span>
                      </div>
                    </div>

                    {/* Schedule Time */}
                    <p className="text-xs font-medium text-slate-600 mb-5">
                      <strong className="text-slate-900 font-semibold">Schedule:</strong> {batch.schedule}
                    </p>

                    {/* Faculty Lead */}
                    {batch.trainerName && (
                      <div className="flex items-center gap-3 py-3 border-t border-slate-100 mb-5">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                          {batch.trainerImage ? (
                            <Image
                              src={batch.trainerImage}
                              alt={batch.trainerName}
                              fill
                              sizes="40px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#0A1628] text-white text-xs font-bold flex items-center justify-center">
                              {batch.trainerName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Faculty Lead
                          </p>
                          <p className="text-xs font-extrabold text-[#0A1628] truncate">{batch.trainerName}</p>
                          <p className="text-[11px] font-medium text-slate-500 truncate">{batch.trainerTitle}</p>
                        </div>
                      </div>
                    )}

                    {/* Bottom: Urgency, Price, Actions */}
                    <div className="mt-auto pt-2">
                      {/* Urgency & Capacity */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full ${
                            isUrgent
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isUrgent ? 'bg-red-600 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          {isUrgent ? `Only ${batch.seatsLeft} seats left` : `${batch.seatsLeft} seats available`}
                        </span>

                        <span className="text-xs font-semibold text-slate-400">
                          {batch.enrolledCount}/{batch.capacity} Enrolled
                        </span>
                      </div>

                      {/* Price Block */}
                      <div className="mb-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#0A1628]">
                            {formatPrice(batch.discountedPrice)}
                          </span>
                          {batch.originalPrice > batch.discountedPrice && (
                            <span className="text-sm font-semibold text-slate-400 line-through">
                              {formatPrice(batch.originalPrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                          Save {formatPrice(savings)} ({discountPercent}% Off) • Flexible EMI Available
                        </p>
                      </div>

                      {/* CTAs */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleEnrollClick(batch)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-md shadow-red-600/20 cursor-pointer"
                        >
                          <span>Enroll Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/${batch.courseSlug}`}
                          className="w-full flex items-center justify-center px-3 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 text-center"
                        >
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

        {/* View All Batches Action */}
        {showAllButton && filteredBatches.length > 6 && !showAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white border-2 border-slate-300 text-[#0A1628] font-extrabold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 cursor-pointer"
            >
              <span>View Full Schedule ({filteredBatches.length} Batches)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Trust Badges Under Cards */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Verified Corporate Faculty</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Live Project & Real ATS Lab Access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Dedicated Placement & Referral Support</span>
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
