'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  PhoneCall,
  HelpCircle,
  FileText,
  AlertCircle,
  Zap,
} from 'lucide-react'
import WhatsAppIcon from '@/components/shared/WhatsAppIcon'

interface AssessmentResultFailedProps {
  scorePercentage: number
  passingScore?: number
  message?: string
  retakeCount?: number
  onRetry: () => void
}

export default function AssessmentResultFailed({
  scorePercentage,
  passingScore = 70,
  message,
  retakeCount = 0,
  onRetry,
}: AssessmentResultFailedProps) {
  const pointsNeeded = passingScore - scorePercentage

  return (
    <div className="w-full bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-white">
      {/* Top Banner / Score Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        {/* Score Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Score: {scorePercentage}% &bull; Passing Score: {passingScore}%</span>
        </div>

        {/* Supportive Headline */}
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
          Don&apos;t worry! Mastery takes practice.
        </h2>

        {/* Empathetic Subtitle */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {message || (
            <>
              You were just {pointsNeeded > 0 ? `${pointsNeeded}%` : 'a few points'} away from the passing mark.
              Recruitment and talent sourcing are dynamic skills—with targeted revision or expert guidance,
              you will cross the finish line on your next attempt.
            </>
          )}
        </p>

        {/* Progress Bar Visualizer */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
            <span>Your Score: {scorePercentage}%</span>
            <span className="text-emerald-400">Target: {passingScore}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(scorePercentage, 100)}%` }}
            />
            {/* Target Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400"
              style={{ left: `${passingScore}%` }}
              title={`Passing Threshold: ${passingScore}%`}
            />
          </div>
        </div>
      </div>

      {/* Two Clear Actionable Pathways Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10">
        
        {/* ======================================================== */}
        {/* PATH A: FREE SELF-STUDY & RE-ATTEMPT ROUTE */}
        {/* ======================================================== */}
        <div className="flex flex-col justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-slate-700 transition-all duration-200">
          <div>
            {/* Header / Icon */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Free Self-Paced Track
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Self-Study &amp; Re-attempt
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Review our comprehensive recruitment guides, master Boolean search strings, and brush up on core concepts before taking the test again.
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Master Boolean Guide:</strong> LinkedIn Recruiter, Google X-Ray &amp; ATS syntax formulas.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>92 Knowledge Hub Playbooks:</strong> Complete Q&amp;A playbooks for full-cycle talent acquisition.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Retake Option:</strong> Re-try test immediately with fresh focus.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again Now (Re-take Test)</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/knowledge"
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>Explore Knowledge Hub</span>
              </Link>
              <Link
                href="/knowledge/boolean-search-in-recruitment-guide"
                className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Read Boolean Guide</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PATH B: EXPERT-LED GUIDED LEARNING & CERTIFICATION */}
        {/* ======================================================== */}
        <div className="flex flex-col justify-between bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 sm:p-8 relative shadow-xl shadow-indigo-950/30 hover:border-indigo-400 transition-all duration-200">
          {/* Top Recommended Tag */}
          <div className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Recommended for Guaranteed Success
          </div>

          <div>
            {/* Header / Icon */}
            <div className="flex items-center justify-between mb-5 mt-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Fast-Track Mastery
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Fast-Track Your Expertise with Mentorship
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Skip trial-and-error. Join our live masterclasses, learn real-world sourcing workflows, and get 100% test-ready with industry leaders from ex-Google &amp; TCS.
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1-on-1 Mentorship:</strong> Direct coaching from seasoned Talent Acquisition Directors.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Placement Support:</strong> Resume optimization drills, mock technical interviews, and partner referrals.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Guaranteed Credential:</strong> Verified executive certificate with distinction badge upon cohort completion.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-indigo-900/60">
            <Link
              href="/courses"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 text-center active:scale-95"
            >
              <span>Explore Premium Certification Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/917385204165?text=Hello%2C%20I%20just%20took%20the%20HR%20Assessment%20and%20would%20like%20to%20talk%20to%20a%20counsellor%20about%20guided%20training."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition text-center"
            >
              <WhatsAppIcon size={15} color="#25D366" />
              <span>Book a Free 1-on-1 Counselling Call</span>
            </a>
          </div>
        </div>

      </div>

      {/* Trust & Reassurance Strip */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Retakes allowed anytime</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>5,000+ HR professionals certified</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Accepted by 200+ top hiring agencies</span>
          </span>
        </div>

        <Link
          href="/contact"
          className="text-slate-300 hover:text-amber-300 transition-colors font-medium flex items-center gap-1"
        >
          <span>Need help with your score? Contact Support</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
