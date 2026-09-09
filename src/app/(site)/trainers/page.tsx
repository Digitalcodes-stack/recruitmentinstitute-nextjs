import { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import TrainersListClient from '@/components/site/TrainersListClient'
import { DEFAULT_TRAINERS } from '@/lib/data/trainingData'
import { prisma } from '@/lib/prisma'
import { TrainerItem } from '@/types/training'

export const metadata: Metadata = {
  title: 'Meet Our Expert HR & Recruitment Faculty in Pune | Recruitment Institute',
  description:
    'Learn directly from top Talent Acquisition leaders, Headhunters and HR Directors from Google, Amazon, Microsoft, TCS and McKinsey. 100% practitioner-led mentorship.',
  keywords: [
    'HR trainers Pune',
    'Recruitment faculty',
    'Talent acquisition mentors',
    'Corporate HR mentors India',
    'Executive search trainers',
  ],
}

/** Neutral initials avatar for trainers with no photo on file — never guess a stock photo for a real person. */
function initialsAvatar(name: string) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="#0F172A"/><text x="240" y="340" font-family="Arial, sans-serif" font-size="160" font-weight="700" fill="#94A3B8" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export default async function TrainersPage() {
  const dbTrainers = await prisma.trainer.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } })
  const TOP_TRAINERS = ['Brahmita Nayak', 'Shesha Shhiv Mohanty', 'Debabrata Pattanayak']
  dbTrainers.sort((a, b) => {
    const ai = TOP_TRAINERS.indexOf(a.name)
    const bi = TOP_TRAINERS.indexOf(b.name)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })

  // Real faculty on record, mapped with distinct rich profiles
  const liveTrainers: TrainerItem[] = dbTrainers.map((t) => {
    const lower = t.name.toLowerCase()
    const isBrahmita = lower.includes('brahmita')
    const isShesha = lower.includes('shesha') || lower.includes('shhiv') || lower.includes('mohanty')
    const isDebabrata = lower.includes('debabrata') || lower.includes('pattanayak') || lower.includes('dpattanayak')

    if (isBrahmita) {
      return {
        id: 100000 + t.id,
        name: t.name,
        email: t.email,
        phone: t.phone ?? undefined,
        designation: 'Recruitment & HR Transformation Expert',
        experienceYears: 22,
        specializationTags: [
          'End-to-End Recruitment & Talent Acquisition',
          'Corporate & MNC Hiring',
          'Recruitment & Staffing Business Setup',
          'Recruitment Consulting',
          'Client & Candidate Management',
          'HR & Recruitment Transformation',
          'Recruiter Leadership & Team Building',
          'AI & Future of Recruitment',
        ],
        bio: 'Talent Acquisition Leader, Recruitment Business Mentor and Corporate & MNC Hiring Specialist with 22+ years empowering professionals and entrepreneurs to build structured, scalable recruitment practices.',
        longBio: `Talent Acquisition Leader | Recruitment Business Mentor | Corporate & MNC Hiring Specialist\n\nBrahmita Nayak is an experienced HR and Recruitment professional with deep expertise in end-to-end talent acquisition, corporate & MNC recruitment, staffing and recruitment consulting.\n\nShe brings practical industry knowledge across the complete recruitment lifecycle — from understanding client requirements and sourcing talent to screening, selection, closure and recruitment operations.\n\nHer expertise also extends to setting up and strengthening recruitment consulting and staffing businesses, helping professionals and entrepreneurs build structured, scalable recruitment practices.\n\nLearn from experience. Build recruitment excellence. Transform the way you hire.\n\nBrahmita Nayak — Empowering Recruiters, HR Professionals & Recruitment Entrepreneurs to build stronger careers and businesses.`,
        image: t.image || '/assets/images/trainers/brahmita_mam.jpg',
        companyEx: 'Talent Acquisition Leader | Recruitment Business Mentor | Corporate & MNC Hiring Specialist',
        rating: 4.98,
        reviewsCount: 146,
        studentsMentored: 1400,
        coursesTaught: ['End-to-End Recruitment Training', 'HR Corporate Training Course', 'HR Courses for Beginners', 'Recruitment Business Accelerator'],
        modes: ['Online', 'Offline', 'Hybrid'],
        featured: true,
        quote: 'Learn from experience. Build recruitment excellence. Transform the way you hire.',
        certifications: ['Talent Acquisition Leader', 'Corporate & MNC Recruitment Consultant', 'Recruitment Business Mentor', 'HR Transformation Expert'],
        linkedinUrl: 'https://www.linkedin.com/in/brahmita/',
      }
    }

    if (isShesha) {
      return {
        id: 100000 + t.id,
        name: t.name,
        email: t.email,
        phone: t.phone ?? undefined,
        designation: 'AI Transformation & Recruitment Specialist | Startup & Business Growth Strategist',
        experienceYears: 22,
        specializationTags: [
          'AI in Recruitment',
          'Generative AI for Recruiters',
          'AI-Powered Sourcing',
          'Boolean Search',
          'Recruitment Automation',
          'Candidate Screening',
          'AI-Assisted Recruitment Operations',
          'Recruitment Business Development',
          'Recruitment Agency Setup',
          'Client Acquisition',
          'Recruitment Entrepreneurship',
          'HR Technology & Future of Work',
        ],
        bio: 'AI Business Transformation Consultant, Startup Builder and Growth Strategist bridging the gap between traditional recruitment and AI-powered recruitment.',
        longBio: `The future of recruitment belongs to recruiters who know how to use AI.\n\nShesha brings extensive experience across IT, business transformation, recruitment, consulting, technology and AI.\n\nHis LinkedIn profile describes him as an AI Business Transformation Consultant, Startup Builder and Growth Strategist, with active work and thought leadership around recruitment, AI and the future of work.\n\nAt Recruitment Institute, his focus is to bridge the gap between traditional recruitment and AI-powered recruitment.`,
        image: t.image || '/assets/images/trainers/shesha_sir.jpg',
        companyEx: 'AI Business Transformation Consultant | Startup Builder & Growth Strategist',
        rating: 4.99,
        reviewsCount: 158,
        studentsMentored: 1550,
        coursesTaught: ['AI for Recruitment', 'Corporate Recruitment Training', 'Professional Recruitment Specialist', 'HR Entrepreneurship Program'],
        modes: ['Online', 'Offline', 'Hybrid'],
        featured: true,
        quote: "AI will not replace recruiters. Recruiters who know how to use AI will outperform recruiters who don't.",
        certifications: ['AI Business Transformation Consultant', 'Master AI Talent Architect', 'Generative AI for Recruiters', 'Advanced Boolean & AI-Powered Sourcing'],
        linkedinUrl: 'https://www.linkedin.com/in/sheshamohanty/',
      }
    }

    if (isDebabrata) {
      return {
        id: 100000 + t.id,
        name: t.name,
        email: t.email,
        phone: t.phone ?? undefined,
        designation: 'Senior HR & Talent Acquisition Leader | Recruitment & Leadership Mentor',
        experienceYears: 22,
        specializationTags: [
          'HR & Recruitment Fundamentals',
          'Talent Acquisition',
          'Leadership Hiring',
          'Candidate Evaluation',
          'Hiring Strategy',
          'HR Communication',
          'People Management',
          'Time & Performance Management',
          'Corporate HR Practices',
        ],
        bio: 'Senior HR & Talent Acquisition Leader bringing 22+ years of real-world hiring expertise across organizational leadership, people management and corporate recruitment.',
        longBio: `Learn Recruitment from someone who understands hiring from the leadership side.\n\nDeba brings extensive professional experience in HR, talent management, leadership and organizational hiring, with strong exposure to real-world recruitment requirements.\n\nHis experience in the hospitality sector gives learners an opportunity to understand recruitment beyond resumes — including business requirements, people management, leadership hiring, candidate evaluation and workforce needs.\n\nHe is also actively involved in hiring and talent identification and has been recognized for his contribution to the hospitality industry.\n\nDebabrata's LinkedIn profile demonstrates active involvement in hiring, leadership and HR-related professional activities, including recruitment for finance, sales and hospitality leadership positions.`,
        image: t.image || '/assets/images/trainers/debabrata_pattanayak.jpg',
        companyEx: 'Senior HR & Talent Acquisition Leader | Recruitment & Leadership Mentor',
        rating: 4.97,
        reviewsCount: 138,
        studentsMentored: 1250,
        coursesTaught: ['HR Corporate Training Course', 'End-to-End Recruitment Training', 'HR Entrepreneurship Program'],
        modes: ['Online', 'Offline', 'Hybrid'],
        featured: true,
        quote: 'Recruitment is not just about filling a position. It is about finding the right person for the right business need.',
        certifications: ['Senior HR & Talent Acquisition Leader', 'Recruitment & Leadership Mentor', 'Hospitality Industry HR Awardee', 'Strategic Talent & Executive Hiring'],
        linkedinUrl: 'https://www.linkedin.com/in/dpattanayak/',
      }
    }

    return {
      id: 100000 + t.id,
      name: t.name,
      email: t.email,
      phone: t.phone ?? undefined,
      designation: t.specialization || 'Faculty Trainer',
      experienceYears: 15,
      specializationTags: t.specialization ? t.specialization.split(',').map((s) => s.trim()) : ['Recruitment & HR'],
      bio: t.bio || 'Experienced recruitment and HR practitioner at Recruitment Institute.',
      longBio: t.bio || 'Experienced recruitment and HR practitioner at Recruitment Institute.',
      image: t.image || initialsAvatar(t.name),
      rating: 5,
      reviewsCount: 50,
      studentsMentored: 1000,
      coursesTaught: ['End-to-End Recruitment Training'],
      modes: ['Online', 'Offline', 'Hybrid'],
      featured: true,
      quote: 'Great recruiters connect business goals with human potential to build world-class teams.',
    }
  })

  // Only show DB trainers (no static fallback trainers)
  const allTrainers = liveTrainers

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Recruitment Institute Faculty',
    description: 'Expert Recruitment & HR Faculty from top global companies.',
    url: 'https://recruitmentinstitute.in/trainers',
    employee: allTrainers.map((t) => ({
      '@type': 'Person',
      name: t.name,
      jobTitle: t.designation,
      worksFor: {
        '@type': 'Organization',
        name: t.companyEx || 'Recruitment Institute',
      },
    })),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
              Learn Directly From Active{' '}
              <span style={{ color: '#E63946' }}>
                Talent Leaders
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
