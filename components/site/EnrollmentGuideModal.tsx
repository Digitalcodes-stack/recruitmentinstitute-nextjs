'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Award,
  BookOpen,
  Phone,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Zap
} from 'lucide-react'
import WhatsAppIcon from '@/components/shared/WhatsAppIcon'

interface EnrollmentGuideModalProps {
  isOpen: boolean
  onClose: () => void
  initialTrack?: 'free-starter' | 'pro-certification'
}

export default function EnrollmentGuideModal({
  isOpen,
  onClose,
  initialTrack = 'free-starter',
}: EnrollmentGuideModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('Student / Fresher')
  const [selectedTrack, setSelectedTrack] = useState<'free-starter' | 'pro-certification'>(initialTrack)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setStep(1)
      setErrorMsg('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name, email, and mobile number.')
      return
    }
    setErrorMsg('')
    setStep(2)
  }

  const handleStep2Submit = () => {
    setStep(3)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      // Send lead/inquiry or redirect to student-login
      // If student is free-starter, store in localStorage or session and redirect
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'ri_enrollment_draft',
          JSON.stringify({ name, email, phone, role, selectedTrack, timestamp: new Date().toISOString() })
        )
      }
      setTimeout(() => {
        setIsSubmitting(false)
        window.location.href = `/student-login?registered=1&email=${encodeURIComponent(email)}&track=${selectedTrack}`
      }, 700)
    } catch {
      setIsSubmitting(false)
      window.location.href = `/student-login?registered=1`
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-white animate-in zoom-in-95 duration-200">
        
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800 relative bg-gradient-to-b from-slate-850 to-slate-900">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Quick 60-Second Enrollment Flow
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            How to Claim Your Student Membership
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join 5,000+ HR professionals and unlock 200+ recruiter toolkits, active community networking, and career placement support.
          </p>

          {/* Progress Visualizer */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className={step >= 1 ? 'text-blue-400 font-extrabold' : ''}>1. Your Details</span>
              <span className={step >= 2 ? 'text-blue-400 font-extrabold' : ''}>2. Select Track</span>
              <span className={step >= 3 ? 'text-blue-400 font-extrabold' : ''}>3. Instant Access</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Enter Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Mobile Number (+91) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Profile / Objective
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Student / Fresher">College Student / Recent Graduate</option>
                  <option value="Working Recruiter">Active Recruiter / HR Professional (1–3 yrs)</option>
                  <option value="Career Switcher">Transitioning into HR / Talent Acquisition</option>
                  <option value="HR Entrepreneur">Aspiring HR Consulting Business Owner</option>
                </select>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 2: Select Track</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Select Track */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Choose the membership path that matches your current learning objective:
              </p>

              <div className="grid grid-cols-1 gap-3.5">
                {/* Track Option 1: Free Starter */}
                <div
                  onClick={() => setSelectedTrack('free-starter')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedTrack === 'free-starter'
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase mb-1.5">
                        Free Forever &bull; ₹0
                      </div>
                      <h4 className="text-base font-bold text-white">Student Membership (Starter)</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Access the 5,000+ member HR community, 200+ recruiter knowledge resources, weekly webinars, and foundational tools.
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                      selectedTrack === 'free-starter' ? 'border-blue-500 bg-blue-600' : 'border-slate-600'
                    }`}>
                      {selectedTrack === 'free-starter' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Track Option 2: Pro Certification */}
                <div
                  onClick={() => setSelectedTrack('pro-certification')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedTrack === 'pro-certification'
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black uppercase mb-1.5">
                        <Award className="w-3 h-3 text-indigo-400" /> Flagship Career Track
                      </div>
                      <h4 className="text-base font-bold text-white">Pro Certification Track</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Includes full 100% placement support, 8-week cohort training, mock interviews, verifiable industry credential, and dedicated mentor.
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                      selectedTrack === 'pro-certification' ? 'border-indigo-500 bg-indigo-600' : 'border-slate-600'
                    }`}>
                      {selectedTrack === 'pro-certification' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Step 3: Instant Access</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Instant Dashboard Access Confirmation */}
          {step === 3 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-white">Your Membership is Ready to Unlock!</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  We have prepared your account profile for <strong>{name}</strong> ({email}).
                </p>
              </div>

              {/* Unlocked Perks Card */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>200+ Recruitment Toolkits:</strong> Boolean cheat sheets, JD blueprints, and calling scripts.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>5,000+ Peer Network:</strong> Access our exclusive WhatsApp &amp; Forum community.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>LMS Learning Vault:</strong> Career progression milestones and certificate tracker.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span>Unlocking Your Portal...</span>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Enter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Trust Signals */}
        <div className="p-4 sm:p-5 bg-slate-950/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-400" />
              <span>5,000+ Members</span>
            </span>
          </div>

          <a
            href="https://wa.me/917385204165?text=Hello%2C%20I%20have%20questions%20about%20Student%20Membership"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 font-semibold transition-colors"
          >
            <WhatsAppIcon size={14} color="#25D366" />
            <span>Questions? Talk to a Counsellor</span>
          </a>
        </div>

      </div>
    </div>
  )
}
