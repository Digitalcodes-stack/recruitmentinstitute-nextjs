import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Award,
  Users,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react'
import TrainersListClient from '@/components/site/TrainersListClient'
import { DEFAULT_TRAINERS } from '@/lib/data/trainingData'
import { TrainerItem } from '@/types/training'

const BASE_URL = 'https://recruitmentinstitute.in'

export const metadata: Metadata = {
  title: 'Meet Our Expert HR & Recruitment Trainers in Pune - Recruitment Institute',
  description:
    'Learn from authentic industry practitioners with 10–20+ years of real corporate recruitment experience. Our faculty includes ex-Google, Amazon, TCS, and MNC recruitment leaders.',
  keywords:
    'HR trainers pune, recruitment mentors, talent acquisition faculty, HR corporate coaches, recruitment institute faculty',
  alternates: { canonical: `${BASE_URL}/trainers` },
  openGraph: {
    title: 'Expert HR & Recruitment Trainers - Recruitment Institute',
    description: 'Learn recruitment directly from veterans with 10–20+ years of Fortune 500 hiring experience.',
    url: `${BASE_URL}/trainers`,
    type: 'website',
    images: [{ url: `${BASE_URL}/assets/images/og-trainers.jpg`, width: 1200, height: 630, alt: 'Recruitment Institute Trainers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert HR & Recruitment Trainers - Recruitment Institute',
    description: 'Learn recruitment directly from veterans with 10–20+ years of Fortune 500 hiring experience.',
  },
}

export default async function TrainersPage() {
  let dbTrainers: TrainerItem[] = []

  try {
    const rawTrainers = await prisma.trainer.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      include: {
        batches: {
          select: { id: true, name: true, mode: true },
        },
      },
    })

    if (rawTrainers && rawTrainers.length > 0) {
      const TRAINER_PROFILES: Record<string, { image: string; companyEx: string; exp: number; rating: number; reviews: number; mentored: number; quote: string; certs: string[]; defaultTags: string[] }> = {
        'priya': {
          image: '/assets/images/trainers/priyanka_kulkarni.jpg',
          companyEx: 'Ex-TCS, Infosys, Wipro',
          exp: 15,
          rating: 4.98,
          reviews: 132,
          mentored: 1420,
          quote: 'A solid foundation in statutory compliance and structured interviewing transforms freshers into boardroom-ready talent partners.',
          certs: ['CPHR Certified Human Resource Professional', 'POSH Certified Master Trainer', 'XLRI Executive Talent Certificate'],
          defaultTags: ['Corporate HR', 'HR Operations', 'Statutory Compliance'],
        },
        'suresh': {
          image: '/assets/images/trainers/rajesh_sharma.jpg',
          companyEx: 'Ex-Google, Amazon, Microsoft',
          exp: 18,
          rating: 4.95,
          reviews: 148,
          mentored: 1850,
          quote: 'Recruiting is not keyword matching — it is understanding business architecture and candidate psychology.',
          certs: ['SHRM-SCP Certified Senior Professional', 'AIRS Certified Diversity Recruiter', 'LinkedIn Certified Talent Leader'],
          defaultTags: ['Tech Recruitment', 'Executive Search', 'Boolean Sourcing'],
        },
        'priti': {
          image: '/assets/images/trainers/ananya_roy.jpg',
          companyEx: 'Founder | Ex-Randstad, Adecco',
          exp: 16,
          rating: 4.94,
          reviews: 92,
          mentored: 890,
          quote: 'Running an HR agency gives you tremendous financial leverage when backed by structured recruitment systems.',
          certs: ['Certified Staffing Professional (CSP)', 'National Talent Leader Awardee'],
          defaultTags: ['HR Entrepreneurship', 'Client Acquisition', 'Contract Staffing'],
        },
        'rohit': {
          image: '/assets/images/trainers/amit_deshmukh.jpg',
          companyEx: 'Ex-McKinsey, Michael Page, Korn Ferry',
          exp: 14,
          rating: 4.90,
          reviews: 104,
          mentored: 1100,
          quote: 'Master Boolean logic and automated talent mapping, and you will never run out of qualified pipeline.',
          certs: ['AIRS Certified Social Sourcing Specialist', 'Greenhouse & Lever ATS Certified Expert'],
          defaultTags: ['AI in Sourcing', 'ATS Automation', 'Headhunting'],
        },
        'vivek': {
          image: '/assets/images/trainers/vikram_joshi.jpg',
          companyEx: 'Ex-Barclays, Deutsche Bank',
          exp: 13,
          rating: 4.88,
          reviews: 76,
          mentored: 760,
          quote: 'Financial and GCC hiring demands high speed and precision in credential evaluation.',
          certs: ['Talent Sourcing Specialist (TSS)', 'SHRM-CP'],
          defaultTags: ['BFSI Recruitment', 'GCC Hiring', 'Salary Benchmarking'],
        },
      }

      dbTrainers = rawTrainers.map((t, idx) => {
        const lower = t.name.toLowerCase()
        const key = Object.keys(TRAINER_PROFILES).find((k) => lower.includes(k))
        const profile = key ? TRAINER_PROFILES[key] : (idx % 2 === 0 ? TRAINER_PROFILES['suresh'] : TRAINER_PROFILES['priya'])

        const tags = t.specialization
          ? t.specialization.split(',').map((s) => s.trim())
          : profile.defaultTags

        const modes: ('Online' | 'Offline' | 'Hybrid')[] =
          t.batches.length > 0
            ? Array.from(
                new Set(
                  t.batches.map((b) => (b.mode === 'ONLINE' ? 'Online' : b.mode === 'OFFLINE' ? 'Offline' : 'Hybrid'))
                )
              )
            : ['Online', 'Offline']

        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone || undefined,
          designation: t.specialization ? `${t.specialization} Specialist` : 'Senior Recruitment Mentor',
          companyEx: profile.companyEx,
          experienceYears: profile.exp,
          specializationTags: tags,
          bio: t.bio ? t.bio.slice(0, 160) + (t.bio.length > 160 ? '…' : '') : 'Active recruitment practitioner with extensive Fortune 500 corporate hiring experience.',
          longBio: t.bio || 'Comprehensive mentoring in modern recruitment lifecycles, ATS platforms, and talent acquisition strategies.',
          image: profile.image,
          rating: profile.rating,
          reviewsCount: profile.reviews,
          studentsMentored: profile.mentored,
          coursesTaught: ['End-to-End Recruitment Training', 'HR Courses for Beginners'],
          modes,
          featured: true,
          quote: profile.quote,
          certifications: profile.certs,
        }
      })
    }
  } catch (error) {
    console.error('Error fetching trainers from Prisma:', error)
  }

  const trainersList = dbTrainers.length > 0 ? dbTrainers : DEFAULT_TRAINERS

  const trainerSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/trainers#webpage`,
        url: `${BASE_URL}/trainers`,
        name: 'Meet Our Expert Trainers - Recruitment Institute',
        description: 'Learn from industry practitioners with 10–20+ years of real recruitment experience.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/trainers#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Trainers', item: `${BASE_URL}/trainers` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Recruitment Institute Master Faculty',
        numberOfItems: trainersList.length,
        itemListElement: trainersList.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Person',
            name: t.name,
            jobTitle: t.designation,
            description: t.bio,
            image: `${BASE_URL}${t.image}`,
            worksFor: { '@type': 'Organization', name: 'Recruitment Institute' },
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trainerSchema) }}
      />

      {/* ── SIMPLIFIED CALM HERO ─────────────────────────────────── */}
      <section className="bg-[#0A1628] text-white pt-20 pb-16 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E63946] mb-3">
            Faculty & Mentors
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Meet Our Expert Trainers
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto mb-8 font-normal">
            Learn directly from active recruitment practitioners and agency founders with 10–20+ years of real corporate experience.
          </p>

          {/* 4 Clean Impact Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">15+</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Master Mentors</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">100%</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Practitioners</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-black text-white">5,000+</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Graduates</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-400">4.9★</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Avg Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER & TRAINERS GRID ───────────────────────────────── */}
      <TrainersListClient trainers={trainersList} />

      {/* ── CLEAN BOTTOM CTA ─────────────────────────────────────── */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-2xl bg-[#0A1628] text-white p-8 sm:p-12 text-center shadow-lg border border-slate-800">
            <div className="max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>1-on-1 Faculty Mentorship</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white">
                Want personalized guidance from our faculty?
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                Book a free 1-on-1 profile evaluation with our senior faculty advisors to choose the right training track.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E63946] text-white font-bold text-xs sm:text-sm hover:bg-red-700 transition-all shadow-md shadow-red-600/25 text-center"
                >
                  Book Free Mentorship Call
                </Link>

                <a
                  href="https://wa.me/917385204165"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all text-center"
                >
                  WhatsApp Admissions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
