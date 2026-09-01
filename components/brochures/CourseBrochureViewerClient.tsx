'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Download, Printer, Share2, Phone, MessageCircle, Calendar, CheckCircle2,
  Sparkles, Award, Users, BookOpen, Clock, Layers, Star, ArrowRight, ShieldCheck,
  ChevronDown, ChevronUp, Copy, Check, ExternalLink, GraduationCap, Briefcase,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CourseBrochure } from '@/lib/data/course-brochures'

interface Props {
  brochure: CourseBrochure
  allBrochures: CourseBrochure[]
}

export default function CourseBrochureViewerClient({ brochure, allBrochures }: Props) {
  const [expandedModule, setExpandedModule] = useState<number | null>(1)
  const [copiedLink, setCopiedLink] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      toast.success('Brochure link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleWhatsApp = () => {
    const text = `Hello Recruitment Institute, I am reviewing the official brochure for "${brochure.title}". I would like to schedule a free demo session and know about the upcoming batch.`
    window.open(`https://wa.me/917385204165?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadName || !leadPhone) {
      toast.error('Please enter your name and phone number')
      return
    }

    setLeadSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          email: leadEmail || 'candidate@recruitmentinstitute.in',
          subject: `Brochure Demo Inquiry: ${brochure.title}`,
          message: `Candidate downloaded/reviewed brochure for ${brochure.title} and requested a callback/demo slot.`,
        }),
      })

      if (res.ok) {
        setLeadSubmitted(true)
        toast.success('Demo request registered! Our senior counsellor will connect with you.')
      } else {
        throw new Error('Failed to submit')
      }
    } catch {
      toast.error('Unable to send request right now. Please message on WhatsApp directly.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white print:bg-white print:text-black">
      
      {/* ================= STICKY TOP ACTIONS BAR (Hidden in print) ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
                RI
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                  Recruitment Institute
                </div>
                <div className="text-[11px] font-semibold text-slate-500">Official Course Syllabus</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all active:scale-95 border border-slate-200"
              title="Download or Print PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Download PDF / Print</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200"
              title="Copy shareable link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm shadow-emerald-200 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">WhatsApp Admissions</span>
              <span className="sm:hidden">WhatsApp</span>
            </button>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-200 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Demo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= PRINT COVER HEADER (Visible in print only) ================= */}
      <div className="hidden print:block p-8 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">RECRUITMENT INSTITUTE</h1>
            <p className="text-xs text-slate-600">India’s #1 Practical HR & Recruitment Training Academy • Pune Campus</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">Official Prospectus & Syllabus</p>
            <p>Helpline: +91-7385204165 • support@recruitmentinstitute.in</p>
          </div>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 print:bg-none print:text-black print:p-0">
        
        {/* Background glow graphics (hidden in print) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 print:hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/30 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-black tracking-wider uppercase bg-amber-400 text-slate-950 rounded-full shadow-sm">
              {brochure.badge}
            </span>
            <span className="px-3 py-1 text-xs font-bold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10 rounded-full">
              {brochure.category}
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-white/10 text-slate-300 rounded-full">
              Level: {brochure.level}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white print:text-slate-950 mb-4 leading-tight">
            {brochure.title}
          </h1>

          <p className="text-lg sm:text-xl text-indigo-100/90 print:text-slate-700 max-w-3xl mb-8 leading-relaxed font-normal">
            {brochure.subtitle}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 print:border-slate-300 print:bg-slate-50 print:text-slate-900">
            <div className="p-3">
              <div className="text-xs text-indigo-200 print:text-slate-500 font-semibold mb-1">⏱️ Program Duration</div>
              <div className="text-lg sm:text-xl font-black text-white print:text-slate-900">{brochure.duration}</div>
              <div className="text-[11px] text-slate-300 print:text-slate-500">{brochure.batchHours}</div>
            </div>
            <div className="p-3 border-l border-white/10 print:border-slate-200">
              <div className="text-xs text-indigo-200 print:text-slate-500 font-semibold mb-1">⭐ Star Rating</div>
              <div className="text-lg sm:text-xl font-black text-amber-300 print:text-amber-600">{brochure.rating} / 5.0</div>
              <div className="text-[11px] text-slate-300 print:text-slate-500">{brochure.reviewsCount}+ verified reviews</div>
            </div>
            <div className="p-3 border-l border-white/10 print:border-slate-200">
              <div className="text-xs text-indigo-200 print:text-slate-500 font-semibold mb-1">🎯 Career Placement</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 print:text-emerald-700">100% Support</div>
              <div className="text-[11px] text-slate-300 print:text-slate-500">150+ Hiring Partners</div>
            </div>
            <div className="p-3 border-l border-white/10 print:border-slate-200">
              <div className="text-xs text-indigo-200 print:text-slate-500 font-semibold mb-1">📍 Learning Mode</div>
              <div className="text-base sm:text-lg font-black text-white print:text-slate-900">Live Online & Pune</div>
              <div className="text-[11px] text-slate-300 print:text-slate-500">Classroom + Recordings</div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* 1. EXECUTIVE SUMMARY & HIGHLIGHTS */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-4 text-indigo-600 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Executive Program Overview</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
            Why this program guarantees your career transformation
          </h2>

          <p className="text-slate-600 text-base leading-relaxed mb-6 font-normal">
            {brochure.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-3.5 pt-4 border-t border-slate-100">
            {brochure.keyHighlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/70">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-sm font-semibold text-slate-800 leading-snug">{highlight}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TARGET AUDIENCE */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm print:bg-none print:border print:border-slate-300 print:text-black">
          <div className="flex items-center gap-2.5 mb-3 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Eligibility & Audience</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold mb-6">Who is this program designed for?</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {brochure.whoShouldAttend.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 print:border-slate-300 print:bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-sm font-medium text-indigo-50 print:text-slate-800 leading-relaxed">{item}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. TOOLS & SOFTWARE MASTERY */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2.5 mb-3 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Practical Stack</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Industry Tools & Software Mastered</h2>
          <p className="text-slate-600 text-sm mb-6">
            Get hands-on live operational training on the exact recruitment and HR tools used by Fortune 500 corporations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {brochure.toolsCovered.map((tool, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="font-bold text-xs text-slate-900 mb-1">{tool.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{tool.category}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. STEP-BY-STEP MODULAR CURRICULUM */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Detailed Syllabus & Modules</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Comprehensive Curriculum Breakdown</h2>
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
              {brochure.modules.length} Intensive Modules
            </span>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            Each module combines live theoretical concepts with real-world hiring assignments and case studies.
          </p>

          <div className="space-y-4">
            {brochure.modules.map((mod) => {
              const isExpanded = expandedModule === mod.moduleNumber
              return (
                <div
                  key={mod.moduleNumber}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'border-indigo-300 bg-indigo-50/20 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setExpandedModule(isExpanded ? null : mod.moduleNumber)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {mod.moduleNumber}
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-slate-900">{mod.title}</div>
                        <div className="text-xs font-semibold text-indigo-600 mt-0.5">{mod.duration}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-slate-400 print:hidden">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Always show in print or when expanded */}
                  <div className={`px-5 pb-5 pt-1 border-t border-indigo-100 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                    <div className="text-xs font-semibold text-slate-500 mb-2 italic">
                      <strong>Objective:</strong> {mod.objective}
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Topics Covered:</div>
                      <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                        {mod.topics.map((topic, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Practical Outcome:</strong> {mod.practicalOutcome}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. 100% PLACEMENT SUPPORT & MOCK INTERVIEWS */}
        <section className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm print:bg-none print:border print:border-slate-300 print:text-black">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Placement Ecosystem</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">100% Dedicated Career & Placement Support</h2>
          <p className="text-emerald-100/90 text-sm max-w-3xl mb-6 font-normal">
            We don’t just train you — we prepare your resume, conduct rigorous mock interviews with senior HR leaders, and schedule direct interview rounds with our 150+ corporate hiring partners.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {brochure.placementBenefits.map((benefit, bIdx) => (
              <div key={bIdx} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 print:border-slate-200 print:bg-slate-50">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-2">
                  ✓
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-50 print:text-slate-900 leading-snug">{benefit}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CERTIFICATE OF COMPLETION */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                <span>Industry Credential</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{brochure.certificationTitle}</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {brochure.certificationDescription}
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Verifiable QR Code & Unique Credential ID</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> Shareable on LinkedIn & Resumes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /> ISO 9001:2015 Accredited Institute Certificate</li>
              </ul>
            </div>

            {/* Certificate Visual Mockup */}
            <div className="w-full md:w-80 p-5 rounded-xl bg-gradient-to-br from-amber-50 to-indigo-50 border-2 border-amber-300 shadow-md text-center">
              <div className="text-xs font-extrabold tracking-widest text-amber-800 uppercase mb-1">Certificate of Excellence</div>
              <div className="text-[10px] text-slate-500 mb-3">Recruitment Institute • Pune</div>
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl mb-3 shadow-inner">
                🎓
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">{brochure.title}</div>
              <div className="text-[10px] text-slate-600 mb-3">Awarded for Practical Competency Clearance</div>
              <div className="text-[9px] font-mono text-indigo-700 bg-white/80 py-1 px-2 rounded border border-indigo-200 inline-block">
                VERIFIED CREDENTIAL ID: RI-2026-CTAS
              </div>
            </div>
          </div>
        </section>

        {/* 7. UPCOMING BATCHES & TUITION FEES */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Upcoming Batches & Schedule</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Reserve Your Seat in Next Batch</h2>
            </div>
            
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-right">
              <div className="text-xs font-semibold text-slate-500">Special Offer Tuition Fee</div>
              <div className="text-2xl font-black text-indigo-700">
                ₹{brochure.discountedFee.toLocaleString('en-IN')}{' '}
                <span className="text-sm line-through text-slate-400 font-medium">₹{brochure.originalFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700">{brochure.emiOption}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {brochure.upcomingBatches.map((batch, bIdx) => (
              <div key={bIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{batch.type}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800">
                    {batch.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-indigo-700 mb-1">{batch.timing}</div>
                <div className="text-[11px] text-slate-500 mb-3">{batch.days}</div>
                <div className="text-xs font-medium text-slate-600 flex items-center justify-between border-t border-slate-200 pt-2">
                  <span>Seats Available:</span>
                  <span className="font-bold text-rose-600">{batch.seatsLeft} seats left</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Demo Registration Box (Hidden in print) */}
          <div className="bg-slate-900 text-white rounded-xl p-6 print:hidden">
            {leadSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">Demo Session Registered Successfully!</h3>
                <p className="text-slate-300 text-xs">Our senior admissions counsellor will call you shortly on {leadPhone} with the meeting link.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-1">Attend a Free Live Demo Class Before Enrolling</h3>
                <p className="text-xs text-slate-300 mb-4">Experience our live practical teaching methodology, ask questions to mentors, and inspect our portal setups.</p>
                
                <form onSubmit={handleLeadSubmit} className="grid sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number *"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="px-3.5 py-2.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={leadSubmitting}
                    className="px-4 py-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {leadSubmitting ? 'Registering...' : 'Register for Free Demo →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* 8. FAQS */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {brochure.faqs.map((faq, fIdx) => (
              <div key={fIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 mb-1.5">Q: {faq.question}</div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">A: {faq.answer}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. EXPLORE OTHER PROGRAMS */}
        <section className="print:hidden">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Explore Other Certification Programs</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {allBrochures
              .filter((b) => b.slug !== brochure.slug)
              .slice(0, 3)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/brochures/${other.slug}`}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                    {other.badge}
                  </span>
                  <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 mt-2 mb-1">
                    {other.title}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">⏱️ {other.duration} • 🎯 100% Placement</div>
                </Link>
              ))}
          </div>
        </section>

      </main>

      {/* ================= OFFICIAL FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="font-extrabold text-white text-base">Recruitment Institute Pune</div>
          <p>FC Road, Shivajinagar, Pune, Maharashtra 411005 • Helpline: +91-7385204165 • support@recruitmentinstitute.in</p>
          <p className="text-slate-500 text-[11px]">© {new Date().getFullYear()} Recruitment Institute. All rights reserved. • ISO 9001:2015 Certified Academy.</p>
        </div>
      </footer>

    </div>
  )
}
