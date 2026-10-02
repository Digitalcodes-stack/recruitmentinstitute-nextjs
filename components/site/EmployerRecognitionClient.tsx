'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, ArrowLeft } from 'lucide-react'

export default function EmployerRecognitionClient() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-b from-[#070D1D] via-[#0A1428] to-[#070D1D] text-white px-4 py-20 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Employer Recognition Program</span>
        </div>

        {/* Big Coming Soon Heading */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-6">
          Coming{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
            Soon
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
          Accreditation, hiring partnership benchmarks, and corporate recruiter recognition for forward-thinking enterprises. Launching Q4 2026.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/contact?interest=employer-partner"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-900/40 hover:-translate-y-0.5"
          >
            <span>Partner With Us / Contact</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700/80 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
