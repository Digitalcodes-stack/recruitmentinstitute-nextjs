import { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  Award,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react'
import TrainersListClient from '@/components/site/TrainersListClient'
import { DEFAULT_TRAINERS } from '@/lib/data/trainingData'

export const metadata: Metadata = {
  title: 'Meet Our Expert HR & Recruitment Faculty in Pune | Recruitment Institute',
  description:
    'Learn directly from top Talent Acquisition leaders, Headhunters, and HR Directors from Google, Amazon, Microsoft, TCS, and McKinsey. 100% practitioner-led mentorship.',
  keywords: [
    'HR trainers Pune',
    'Recruitment faculty',
    'Talent acquisition mentors',
    'Corporate HR mentors India',
    'Executive search trainers',
  ],
}

export default function TrainersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Recruitment Institute Faculty',
    description: 'Expert Recruitment & HR Faculty from top global companies.',
    url: 'https://recruitmentinstitute.in/trainers',
    employee: DEFAULT_TRAINERS.map((t) => ({
      '@type': 'Person',
      name: t.name,
      jobTitle: t.role,
      worksFor: {
        '@type': 'Organization',
        name: t.exCompany,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#0A1628] via-[#0F213A] to-[#0A1628] text-white pt-28 pb-20 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/10 blur-[130px] pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-red-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Industry Practitioner Faculty</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Learn Directly From Active{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-rose-400 to-amber-300">
                Talent Leaders
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              Our faculty members are veteran corporate talent acquisition leaders, headhunters, and agency founders with 10–20+ years of real hiring experience.
            </p>
          </div>

          {/* 4 Impact Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block mb-0.5">15+</span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Master Mentors</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block mb-0.5">100%</span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Practitioners</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-red-400 block mb-0.5">5,000+</span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Graduates</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block mb-0.5">4.9★</span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Mentor Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACULTY DIRECTORY LIST ───────────────────────────────────── */}
      <section className="py-14 sm:py-20 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrainersListClient initialTrainers={DEFAULT_TRAINERS} />
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ────────────────────────────────────────── */}
      <section className="py-16 bg-[#0A1628] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
            Want 1-on-1 Guidance for Your HR & Recruitment Career?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed font-medium">
            Schedule a complimentary 20-minute mentorship session with one of our master trainers to map out your career goals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm hover:from-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <span>Book Free Mentorship Call</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/917385204165?text=Hello,%20I%20would%20like%20to%20connect%20with%20a%20faculty%20mentor%20at%20Recruitment%20Institute."
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-6 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admissions</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
