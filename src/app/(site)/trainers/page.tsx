import { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import TrainersListClient from '@/components/site/TrainersListClient'
import { prisma } from '@/lib/prisma'
import { TrainerItem } from '@/types/training'
import { buildTrainerItem, slugifyName } from '@/lib/trainer-profile'

export const metadata: Metadata = {
  title: 'Expert Trainer & Business Coach: Recruitment & HR Training in India | Recruitment Institute',
  description:
    'Meet our expert recruitment trainers, business coaches, and talent acquisition faculty in India. 100% practitioner-led mentorship by senior corporate HR leaders and headhunters.',
  keywords: [
    'Expert Trainer & Business Coach',
    'Recruitment & HR Training in India',
    'Recruitment Training in Pune',
    'Recruitment Training Institute in Pune',
    'HR trainers Pune',
    'Recruitment faculty',
    'Talent acquisition mentors',
    'Corporate HR mentors India',
    'Executive search trainers',
    'Recruitment Institute',
  ],
  alternates: {
    canonical: 'https://recruitmentinstitute.in/trainers',
  },
  openGraph: {
    title: 'Expert Trainer & Business Coach: Recruitment & HR Training in India | Recruitment Institute',
    description:
      'Meet our expert recruitment trainers, business coaches, and talent acquisition faculty in India. 100% practitioner-led mentorship by senior corporate HR leaders and headhunters.',
    url: 'https://recruitmentinstitute.in/trainers',
    type: 'website',
    images: [
      {
        url: 'https://recruitmentinstitute.in/assets/images/trainers/shesha_shhiv_mohanty.jpg',
        width: 1200,
        height: 630,
        alt: 'Expert Trainer & Business Coach - Recruitment Institute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert Trainer & Business Coach: Recruitment & HR Training in India | Recruitment Institute',
    description:
      'Meet our expert recruitment trainers, business coaches, and talent acquisition faculty in India. 100% practitioner-led mentorship by senior corporate HR leaders and headhunters.',
    images: ['https://recruitmentinstitute.in/assets/images/trainers/shesha_shhiv_mohanty.jpg'],
  },
}

export default async function TrainersPage() {
  const dbTrainers = await prisma.trainer.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } })
  const TOP_TRAINERS = ['Brahmita Nayak', 'Rahul Limaye', 'Debabrata Pattanayak', 'Shesha Shhiv Mohanty', 'Tukuna Kumar Lenka', 'Saurav Dey']
  dbTrainers.sort((a, b) => {
    const ai = TOP_TRAINERS.indexOf(a.name)
    const bi = TOP_TRAINERS.indexOf(b.name)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  // Real faculty on record, mapped with distinct rich profiles and dynamic profileJson updates.
  // Shared with /trainers/[slug] so both surfaces render identical, previously-reviewed content.
  const liveTrainers: TrainerItem[] = dbTrainers.map((t) => ({
    ...buildTrainerItem(t),
    slug: t.isPublic ? (t.slug || slugifyName(t.name)) : undefined,
  }))

  // Only show DB trainers (no static fallback trainers)
  const allTrainers = liveTrainers

  const trainersSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://recruitmentinstitute.in/trainers#webpage',
        url: 'https://recruitmentinstitute.in/trainers',
        name: 'Faculty & Expert Trainers | Recruitment Institute Pune',
        description: 'Meet our master HR and recruitment faculty at Recruitment Institute. 100% industry practitioners with 10-30+ years experience.',
        isPartOf: { '@id': 'https://recruitmentinstitute.in/#website' },
        breadcrumb: { '@id': 'https://recruitmentinstitute.in/trainers#breadcrumb' },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://recruitmentinstitute.in/trainers#breadcrumb',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://recruitmentinstitute.in' },
          { '@type': 'ListItem', position: 2, name: 'Faculty & Trainers', item: 'https://recruitmentinstitute.in/trainers' },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': 'https://recruitmentinstitute.in/trainers#faculty',
        name: 'Faculty & Industry Mentors',
        numberOfItems: allTrainers.length,
        itemListElement: allTrainers.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Person',
            name: t.name,
            jobTitle: t.designation,
            description: t.bio,
            image: t.image ? (t.image.startsWith('http') ? t.image : `https://recruitmentinstitute.in${t.image}`) : undefined,
            knowsAbout: t.specializationTags,
            url: t.slug ? `https://recruitmentinstitute.in/trainers/${t.slug}` : undefined,
            worksFor: {
              '@type': 'EducationalOrganization',
              '@id': 'https://recruitmentinstitute.in/#organization',
              name: 'Recruitment Institute',
              url: 'https://recruitmentinstitute.in',
            },
            sameAs: t.linkedinUrl ? [t.linkedinUrl] : undefined,
          },
        })),
      },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trainersSchema) }}
      />

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F213A 50%, #0A1628 100%)', color: '#FFFFFF', paddingTop: '100px', paddingBottom: '70px', position: 'relative' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 44px' }}>
            {/* Tag Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '50px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#F87171', fontSize: '11px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '18px' }}>
              <ShieldCheck style={{ width: '14px', height: '14px' }} />
              <span>100% Industry Practitioner Faculty</span>
            </div>

            {/* Main Headline */}
            <h1 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 16px' }}>
              Expert Trainer &amp; Business Coach:{' '}
              <span style={{ color: '#E63946' }}>
                Recruitment &amp; HR Training in India
              </span>
            </h1>

            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
              Our faculty members are veteran corporate talent acquisition leaders, headhunters and agency founders with 10–20+ years of real hiring experience.
            </p>
          </div>

          {/* 4 Impact Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ padding: '20px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>15+</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Master Mentors</span>
            </div>

            <div style={{ padding: '20px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#34D399', display: 'block', marginBottom: '2px' }}>100%</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Practitioners</span>
            </div>

            <div style={{ padding: '20px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#F87171', display: 'block', marginBottom: '2px' }}>5,000+</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Graduates</span>
            </div>

            <div style={{ padding: '20px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#FDE047', display: 'block', marginBottom: '2px' }}>4.9★</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.08em' }}>Mentor Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACULTY DIRECTORY LIST ───────────────────────────────────── */}
      <section style={{ padding: '60px 0 80px' }}>
        <TrainersListClient initialTrainers={allTrainers} />
      </section>

      {/* ── BOTTOM CTA BANNER ────────────────────────────────────────── */}
      <section style={{ padding: '70px 20px', background: '#0F172A', color: '#FFFFFF', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 900, margin: '0 0 12px' }}>
            Want 1-on-1 Guidance for Your HR &amp; Recruitment Career?
          </h2>
          <p style={{ fontSize: '14.5px', color: '#94A3B8', maxWidth: '580px', margin: '0 auto 32px', lineHeight: 1.7, fontWeight: 500 }}>
            Schedule a complimentary 20-minute mentorship session with one of our master trainers to map out your career goals.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            <Link
              href="/contact"
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #DC2626 0%, #E63946 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
              }}
            >
              <span>Book Free Mentorship Call</span>
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>

            <a
              href="https://wa.me/917385204165?text=Hello,%20I%20would%20like%20to%20connect%20with%20a%20faculty%20mentor%20at%20Recruitment%20Institute."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#059669',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MessageCircle style={{ width: '16px', height: '16px' }} />
              <span>WhatsApp Admissions</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
