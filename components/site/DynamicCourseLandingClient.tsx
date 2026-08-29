'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, BadgeCheck, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  Clock, Compass, Cpu, FileText, Globe, GraduationCap,
  HelpCircle, Layers, Layout, MessageSquare, Phone,
  QrCode, Search, Shield, ShieldCheck, Sparkles, Star,
  Target, TrendingUp, Users, Wrench, Zap
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
  const [selectedMode, setSelectedMode] = useState<'online' | 'offline'>('online')

  const onlinePricing = course.pricing?.online || {
    baseFee: course.pricing?.baseFee || 10000,
    discountPercent: 50,
    discountAmount: Math.round((course.pricing?.baseFee || 10000) * 0.5),
    finalFee: Math.round((course.pricing?.baseFee || 10000) * 0.5),
    emiPerMonth: Math.round(((course.pricing?.baseFee || 10000) * 0.5) / 3),
  }

  const offlinePricing = course.pricing?.offline || {
    baseFee: course.pricing?.baseFee || 10000,
    discountPercent: 10,
    discountAmount: Math.round((course.pricing?.baseFee || 10000) * 0.1),
    finalFee: Math.round((course.pricing?.baseFee || 10000) * 0.9),
    emiPerMonth: Math.round(((course.pricing?.baseFee || 10000) * 0.9) / 3),
  }

  const activePricing = selectedMode === 'online' ? onlinePricing : offlinePricing

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
        defaultCourse={course.title}
        defaultMode={selectedMode}
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

              {/* Short Description (Clean & Concise) */}
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
                {course.shortDescription || course.description}
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
                  <span>Rating: <strong>{course.rating.toFixed(1)} / 5.0</strong></span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-2xl cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${course.accent}, #1e40af)` }}
                >
                  <span>Enroll in Next Batch</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="https://wa.me/917385204165?text=Hi%2C%20I%20am%20interested%20in%20the%20End-to-End%20Recruitment%20Training%20program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Chat on WhatsApp (+91 7385204165)</span>
                </a>
              </div>
            </div>

            {/* Right Card / Dual Pricing Highlight */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 pointer-events-none" style={{ background: course.accent }} />

                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tuition & Pricing</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Select Learning Mode</h3>
                  </div>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    selectedMode === 'online'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedMode === 'online' ? 'Save 50% Online' : 'Save 10% Offline'}
                  </span>
                </div>

                {/* Mode Selector Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('online')}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      selectedMode === 'online'
                        ? 'bg-sky-600 text-white shadow-lg font-bold'
                        : 'text-slate-400 hover:text-slate-200 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Online Live</span>
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-sky-200 mt-0.5">
                      50% DISCOUNT
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('offline')}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      selectedMode === 'offline'
                        ? 'bg-amber-600 text-white shadow-lg font-bold'
                        : 'text-slate-400 hover:text-slate-200 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Classroom</span>
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-amber-200 mt-0.5">
                      10% DISCOUNT • PUNE
                    </span>
                  </button>
                </div>

                {/* Price Display */}
                <div className="mb-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-black text-white">
                      ₹{activePricing.finalFee.toLocaleString('en-IN')}
                    </span>
                    {activePricing.discountAmount > 0 && (
                      <span className="text-base md:text-lg text-slate-500 line-through font-semibold">
                        ₹{activePricing.baseFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      You Save ₹{activePricing.discountAmount.toLocaleString('en-IN')} ({activePricing.discountPercent}% OFF)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    EMI options available from <strong>₹{activePricing.emiPerMonth.toLocaleString('en-IN')}/month</strong> (0% interest).
                  </p>
                </div>

                {/* Inclusions per mode */}
                <div className="space-y-2.5 border-t border-slate-800/80 pt-4 mb-6 text-xs md:text-sm text-slate-300">
                  {selectedMode === 'online' ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Live Interactive Zoom Batches + HD Recording LMS</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>ISO-Accredited QR Verifiable Digital Certificate</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>1-on-1 Online Placement & Resume Guidance</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Full Digital Toolkit (Boolean queries, ATS templates)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Pune Center Physical Classroom & Recruiter Lab</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Face-to-Face Daily Mentorship & Live Calling Practice</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>In-Person Mock Interviews & Corporate Placement Drive</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Printed Courseware + QR Verifiable Certificate</span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setEnquiryOpen(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-center text-sm uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: selectedMode === 'online'
                      ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                      : 'linear-gradient(135deg, #d97706, #b45309)',
                  }}
                >
                  Apply for {selectedMode === 'online' ? 'Online Batch (50% OFF)' : 'Classroom Batch (10% OFF)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. DETAILED COURSE OVERVIEW & WHO SHOULD ENROLL
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Detailed Overview */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
                style={{ background: course.accentLight, color: course.accent, border: `1px solid ${course.accentBorder}` }}>
                <Compass className="w-3.5 h-3.5" />
                Comprehensive Program Overview
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Why Master Full-Lifecycle Recruitment With Us?
              </h2>
              <p className="text-slate-700 text-base md:text-lg leading-relaxed">
                {course.overview}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl font-black text-slate-900 block mb-1">60%+</span>
                  <span className="text-sm font-semibold text-slate-600">Hands-on Sourcing & Sourcing Labs</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl font-black text-slate-900 block mb-1">150+</span>
                  <span className="text-sm font-semibold text-slate-600">Corporate & Staffing Hiring Partners</span>
                </div>
              </div>
            </div>

            {/* Right: Who Should Enroll */}
            <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: course.accent }}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Who Should Enroll</h3>
                  <span className="text-xs text-slate-500 font-medium">Ideal candidate profile</span>
                </div>
              </div>

              <div className="space-y-4">
                {course.whoShouldEnroll.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.role}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. COMPLETE SYLLABUS & CURRICULUM (MODULE-WISE)
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
              Step-by-step competency roadmap engineered with live industry assignments and real-world hiring mandates.
            </p>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            {course.curriculum.map((mod, idx) => {
              const isOpen = openModule === idx
              return (
                <div
                  key={mod.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs transition-all duration-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(idx)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-extrabold"
                        style={{ background: course.accentLight, color: course.accent, border: `1px solid ${course.accentBorder}` }}>
                        {mod.week}
                      </span>
                      <span className="text-base md:text-lg font-bold text-slate-900">
                        {mod.title}
                      </span>
                      {mod.duration && (
                        <span className="hidden sm:inline-flex text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {mod.duration}
                        </span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 md:px-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-5">
                      {mod.description && (
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{mod.description}</p>
                      )}

                      {/* Learning Objectives */}
                      {mod.learningObjectives && mod.learningObjectives.length > 0 && (
                        <div>
                          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 block mb-2">
                            🎯 Learning Objectives
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {mod.learningObjectives.map((obj, oIdx) => (
                              <div key={oIdx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                                <Target className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Topics */}
                      <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 block mb-2">
                          📖 Detailed Topics & Lessons
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {mod.details.map((item, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Practical Activity / Assignment */}
                      {mod.practicalActivity && (
                        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs md:text-sm text-amber-900">
                          <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Practical Assignment / Activity: </strong>
                            <span>{mod.practicalActivity}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. MEASURABLE LEARNING OUTCOMES
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              Career Competencies
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Measurable Learning Outcomes
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-3">
              Skills and capabilities you will confidently demonstrate by graduation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.learningOutcomes.map((outcome, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md flex flex-col justify-between">
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. TOOLS & PLATFORMS COVERED
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 bg-blue-900/50 text-blue-300 border border-blue-700/50">
              <Cpu className="w-3.5 h-3.5" />
              Technology Stack
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Tools & Platforms Covered
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-3">
              Gain practical familiarity with industry-standard sourcing portals, ATS systems, and AI recruiter tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.toolsCovered.map((cat, idx) => (
              <div key={idx} className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80">
                <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  {cat.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cat.tools.map((tool, tIdx) => (
                    <span key={tIdx} className="bg-slate-900/90 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. CERTIFICATION DETAILS
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official ISO-Quality Credential
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {course.certificationDetails.title}
                </h3>
                <div className="space-y-2.5 pt-2">
                  {course.certificationDetails.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                <QrCode className="w-24 h-24 text-white mb-3" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">QR-Code Verifiable</span>
                <span className="text-[11px] text-slate-400 mt-1">Instant online credential verification for employers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. SUGGESTED COURSE STRUCTURE FOR LMS
      ══════════════════════════════════════════════ */}
      {course.lmsStructure && course.lmsStructure.length > 0 && (
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 bg-purple-50 text-purple-700 border border-purple-200">
                <Layout className="w-3.5 h-3.5" />
                LMS Learning Schedule
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Cohort Learning Roadmap
              </h2>
              <p className="text-slate-600 text-sm md:text-base mt-3">
                Structured timeline of weekly lecture modules, self-paced labs, and mentorship reviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.lmsStructure.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-start gap-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {item.week}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          8. CAREER SUPPORT & PROJECTS
      ══════════════════════════════════════════════ */}
      <CareerSupportSection />
      <PlacementProjectsSection />

      {/* ══════════════════════════════════════════════
          9. COURSE FAQS ACCORDION (LIVE DB)
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
                    className="w-full flex items-center justify-between text-left font-bold text-base md:text-lg text-slate-900 cursor-pointer"
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
