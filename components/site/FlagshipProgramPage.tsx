'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Phone, MessageSquare,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'

export interface FlagshipStat {
  label: string
  value: string
}

export interface FlagshipFeatureBlock {
  title: string
  desc: string
}

export interface FlagshipProcessStep {
  title: string
  desc: string
}

export interface FlagshipFaq {
  q: string
  a: string
}

export interface FlagshipRelatedLink {
  label: string
  href: string
}

export interface FlagshipContent {
  pillTag: string
  h1: string
  h1Accent?: string
  subheading: string
  heroStats: FlagshipStat[]
  primaryCtaLabel: string
  secondaryCtaLabel: string

  whoForTitle: string
  whoFor: FlagshipFeatureBlock[]

  includesTitle: string
  includes: FlagshipFeatureBlock[]

  processTitle: string
  processSubtitle: string
  process: FlagshipProcessStep[]

  benefitsTitle: string
  benefits: FlagshipFeatureBlock[]

  faqs: FlagshipFaq[]

  finalCtaTitle: string
  finalCtaSubtitle: string

  relatedLinks: FlagshipRelatedLink[]
}

interface Props {
  content: FlagshipContent
  enquiryProgramName: string
}

export default function FlagshipProgramPage({ content: c, enquiryProgramName }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 sm:pb-16">
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCourse={enquiryProgramName}
        defaultMode="online"
      />

      {/* ── HERO ── */}
      <header className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-b border-slate-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-400/10 via-blue-500/5 to-transparent blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs md:text-sm font-semibold text-slate-800">
              <span>{c.pillTag}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              {c.h1}{' '}
              {c.h1Accent && (
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                  {c.h1Accent}
                </span>
              )}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-normal">
              {c.subheading}
            </p>

            {c.heroStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-3xl pt-2">
                {c.heroStats.map((s, i) => (
                  <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
                    <div className="text-lg sm:text-2xl font-black text-slate-900">{s.value}</div>
                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base tracking-wide shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{c.primaryCtaLabel}</span>
                <ArrowRight className="w-5 h-5 text-amber-400" />
              </button>

              <a
                href={`https://wa.me/917385204165?text=${encodeURIComponent(`Hi Recruitment Institute, I want to learn more about ${enquiryProgramName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{c.secondaryCtaLabel}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              {c.whoForTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {c.whoFor.map((item, i) => (
              <div key={i} className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-4">
              {c.includesTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {c.includes.map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">{c.processTitle}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{c.processSubtitle}</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {c.process.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">{c.benefitsTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {c.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {c.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-900">{faq.q}</span>
                    <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── RELATED PROGRAMS ── */}
      {c.relatedLinks.length > 0 && (
        <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">Explore Related Programs</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              {c.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md text-sm font-semibold text-slate-800 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 mb-4">
            {c.finalCtaTitle}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
            {c.finalCtaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base tracking-wide shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              {c.primaryCtaLabel}
            </button>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-base border-2 border-slate-300 hover:border-slate-400 transition-colors"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 max-w-5xl">
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold text-slate-900">{c.h1}</div>
          </div>
          <div className="sm:hidden">
            <div className="text-xs font-bold text-slate-900">Interested in this program?</div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="tel:+917385204165"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <Phone className="w-3.5 h-3.5" /> Call Us
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              {c.primaryCtaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
