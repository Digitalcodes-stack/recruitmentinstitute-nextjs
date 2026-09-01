'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FileText, Mail, MessageSquare, Send, Copy, ExternalLink, Printer,
  Sparkles, CheckCircle2, Star, Clock, BookOpen, Layers, Award,
  Users, Check, X, Search, ShieldCheck, IndianRupee, HelpCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { CourseBrochure } from '@/lib/data/course-brochures'

interface Props {
  brochures: CourseBrochure[]
}

export default function AdminBrochuresClient({ brochures }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [activeModalBrochure, setActiveModalBrochure] = useState<CourseBrochure | null>(null)
  
  // Modal Form State
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [candidatePhone, setCandidatePhone] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const categories = ['ALL', 'Recruitment & Sourcing', 'HR Generalist', 'Entrepreneurship & Business', 'Corporate Programs']

  const filteredBrochures = brochures.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const openSendModal = (brochure: CourseBrochure, defaultName = '', defaultEmail = '', defaultPhone = '') => {
    setActiveModalBrochure(brochure)
    setCandidateName(defaultName)
    setCandidateEmail(defaultEmail)
    setCandidatePhone(defaultPhone)
    setCustomNote(`Hi ${defaultName || 'there'}, here is the official course brochure and syllabus for the ${brochure.title} as discussed. Feel free to review the modules and book your free live demo session!`)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalBrochure || !candidateEmail) {
      toast.error('Please enter candidate email address')
      return
    }

    setSendingEmail(true)
    try {
      const res = await fetch('/api/admin/brochures/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: activeModalBrochure.slug,
          candidateName,
          candidateEmail,
          candidatePhone,
          customNote,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Official brochure email sent to ${candidateEmail}!`)
        setActiveModalBrochure(null)
      } else {
        throw new Error(data.error || 'Failed to dispatch email')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch email')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendWhatsApp = (brochure: CourseBrochure, phone = '', name = '') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://recruitmentinstitute.in'
    const link = `${baseUrl}/brochures/${brochure.slug}`
    const greetingName = name ? `Dear ${name}` : 'Hello'
    const message = `${greetingName},\n\nThank you for connecting with *Recruitment Institute Pune*! 🎓\n\nHere is the official syllabus and curriculum brochure for:\n*${brochure.title}*\n\n⏱️ Duration: ${brochure.duration}\n🎯 Placement Support: 100% Dedicated Assistance\n💳 Tuition Fee: ₹${brochure.discountedFee.toLocaleString('en-IN')}\n\n👉 *View & Download Official Brochure:* ${link}\n\nWould you like to schedule a free live demo session today or tomorrow? Let us know your convenient time!`

    const digits = phone.replace(/\D/g, '')
    const targetUrl = digits
      ? `https://wa.me/${digits.startsWith('91') ? digits : '91' + digits}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(targetUrl, '_blank')
  }

  const handleCopyLink = (slug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://recruitmentinstitute.in'
    const link = `${baseUrl}/brochures/${slug}`
    navigator.clipboard.writeText(link)
    setCopiedSlug(slug)
    toast.success('Brochure link copied to clipboard!')
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  return (
    <div className="space-y-6">
      
      {/* ================= PAGE TITLE & ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-black tracking-wide uppercase bg-indigo-100 text-indigo-800 rounded-md">
              Admissions & Outreach Hub
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Official Course Brochures & Candidate Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">
            1-click dispatch of official course prospectuses, syllabus PDFs, and demo class invitations to candidates via Email & WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/contacts"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
          >
            <span>View Leads & Call Logs</span>
          </Link>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-indigo-50 px-2 py-0.5 rounded text-indigo-700">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{brochures.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Official Program Brochures</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">Modules</span>
          </div>
          <div className="text-2xl font-black text-slate-900">25+</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Practical Training Modules</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700">Partners</span>
          </div>
          <div className="text-2xl font-black text-slate-900">150+</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Hiring Companies Network</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-amber-50 px-2 py-0.5 rounded text-amber-700">Multi-Channel</span>
          </div>
          <div className="text-2xl font-black text-slate-900">1-Click</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Email & WhatsApp Dispatch</div>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORY FILTER ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brochures by course or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ================= BROCHURES GRID ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredBrochures.map((brochure) => (
          <div
            key={brochure.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Card Header */}
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 text-[11px] font-black uppercase rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  {brochure.badge}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{brochure.rating}</span>
                  <span className="text-slate-400">({brochure.reviewsCount})</span>
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-1 leading-snug">
                {brochure.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
                {brochure.subtitle}
              </p>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Duration</div>
                  <div className="font-bold text-slate-800">{brochure.duration}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Special Fee</div>
                  <div className="font-bold text-indigo-700">₹{brochure.discountedFee.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Placement</div>
                  <div className="font-bold text-emerald-700">100% Support</div>
                </div>
              </div>

              {/* Module count and key topics */}
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Modules & Topics Covered ({brochure.modules.length}):</span>
                </div>
                <div className="space-y-1">
                  {brochure.modules.slice(0, 3).map((m) => (
                    <div key={m.moduleNumber} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-800">{m.title}</span>
                    </div>
                  ))}
                  {brochure.modules.length > 3 && (
                    <div className="text-[11px] font-semibold text-indigo-600 pl-3.5">
                      + {brochure.modules.length - 3} more modules in full brochure
                    </div>
                  )}
                </div>
              </div>

              {/* Tools Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
                {brochure.toolsCovered.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
                    {t.icon} {t.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSendModal(brochure)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-200 active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send to Candidate</span>
                </button>

                <button
                  onClick={() => handleSendWhatsApp(brochure)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shadow-emerald-200 active:scale-95"
                  title="Share via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyLink(brochure.slug)}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Copy shareable link"
                >
                  {copiedSlug === brochure.slug ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <Link
                  href={`/brochures/${brochure.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ================= SEND TO CANDIDATE MODAL ================= */}
      {activeModalBrochure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">Send Official Brochure to Candidate</h3>
                  <p className="text-[11px] text-indigo-200">Delivered via official SMTP from support@recruitmentinstitute.in</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalBrochure(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendEmail} className="p-6 space-y-4 text-xs">
              
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-600">Selected Program</div>
                  <div className="font-black text-slate-900 text-sm">{activeModalBrochure.title}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded">
                  ₹{activeModalBrochure.discountedFee.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sneha Kulkarni"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@gmail.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9823456789"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personalized Admissions Note</label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Add custom notes or demo class timings..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(activeModalBrochure, candidatePhone, candidateName)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send on WhatsApp</span>
                </button>

                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingEmail ? 'Dispatching...' : 'Send Official Email →'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
