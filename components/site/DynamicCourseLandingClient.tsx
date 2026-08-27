'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, BadgeCheck, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  Clock, GraduationCap, Layers, MessageSquare, Phone, Search,
  Shield, Sparkles, Star, Target, TrendingUp, Users, Zap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import CareerSupportSection from '@/components/home/CareerSupportSection'
import PlacementProjectsSection from '@/components/home/PlacementProjectsSection'
import type { DynamicCourseData } from '@/lib/services/courseDataService'

interface Props {
  course: DynamicCourseData
}

export default function DynamicCourseLandingClient({ course }: Props) {
  const [openModule, setOpenModule] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const toggleModule = (idx: number) => {
    setOpenModule(openModule === idx ? null : idx)
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  return (
    <>
      {/* ── Modal ── */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />

      {/* ══════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: course.accent }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit"
                style={{ background: course.badgeBg, border: `1px solid ${course.badgeBorder}` }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: course.badgeColor }} />
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: course.badgeColor }}>
                  {course.badge} • Next Batch: {course.startDate}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Key Meta Pills */}
              <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Duration: <strong>{course.duration}</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Enrolled: <strong>{course.totalStudents.toLocaleString('en-IN')}+ Learners</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rating: <strong>{course.rating} / 5.0</strong></span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${course.accent}, #1e40af)` }}
                >
                  <span>Enroll in Next Batch</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="https://wa.me/917385204165"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Chat on WhatsApp (+91 7385204165)</span>
                </a>
              </div>
            </div>

            {/* Right Card / Pricing Highlight */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none" style={{ background: course.accent }} />

                <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tuition & Enrollment</span>
                    <h3 className="text-xl font-bold text-white mt-1">Transparent Pricing</h3>
                  </div>
                  {course.pricing.savingsPercent > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full">
                      Save {course.pricing.savingsPercent}%
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black text-white">
                      ₹{course.pricing.finalFee.toLocaleString('en-IN')}
                    </span>
                    {course.pricing.discount > 0 && (
                      <span className="text-lg text-slate-500 line-through font-semibold">
                        ₹{course.pricing.baseFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    EMI available starting from <strong>₹{course.pricing.emiPerMonth.toLocaleString('en-IN')}/month</strong> with 0% interest options.
                  </p>
                </div>

                {/* Inclusions */}
                <div className="space-y-3 border-t border-slate-800/80 pt-5 mb-8 text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live Instructor-Led Sessions + Lifetime LMS Access</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified QR-Coded Certificate of Completion</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1-on-1 Resume Building & Placement Support</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-world Case Studies & Sourcing Projects</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="w-full py-4 rounded-xl font-bold text-white text-center text-sm uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${course.accent}, #2563eb)` }}
                >
                  Apply for Admission
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. SYLLABUS & CURRICULUM ACCORDION (LIVE DB)
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3"
              style={{ background: course.accentLight, color: course.accent, border: `1px solid ${course.accentBorder}` }}>
              <BookOpen className="w-3.5 h-3.5" />
              Dynamic Course Syllabus ({course.curriculum.length} Modules)
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curriculum & Practical Training Modules
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-3">
              Hands-on modules structured to transition you into a top-performing talent professional.
            </p>
          </div>

          {/* Curriculum List */}
          <div className="space-y-4">
            {course.curriculum.map((mod, idx) => {
              const isOpen = openModule === idx
              return (
                <div
                  key={mod.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(idx)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-extrabold"
                        style={{ background: course.accentLight, color: course.accent, border: `1px solid ${course.accentBorder}` }}>
                        {mod.week}
                      </span>
                      <span className="text-base md:text-lg font-bold text-slate-900">
                        {mod.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 md:px-6 pt-1 border-t border-slate-100 bg-slate-50/40">
                      {mod.description && (
                        <p className="text-xs text-slate-500 mb-3 italic">{mod.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                        {mod.details.map((item, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. CAREER SUPPORT & PROJECTS
      ══════════════════════════════════════════════ */}
      <CareerSupportSection />
      <PlacementProjectsSection />

      {/* ══════════════════════════════════════════════
          4. COURSE FAQS ACCORDION (LIVE DB)
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 bg-blue-50 text-blue-600 border border-blue-200">
              <MessageSquare className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Questions About {course.title}
            </h2>
          </div>

          <div className="space-y-3.5">
            {course.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={faq.id || idx}
                  className="border border-slate-200 rounded-2xl p-5 transition-colors bg-white hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-base md:text-lg text-slate-900"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="pt-3 text-sm md:text-base text-slate-600 leading-relaxed border-t border-slate-100 mt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
