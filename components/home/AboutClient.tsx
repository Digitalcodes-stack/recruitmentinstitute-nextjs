'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { AboutSection } from '@/types'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Handshake,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

interface Props {
  sections: AboutSection[]
}

const fallbackSections: AboutSection[] = [
  {
    id: 1,
    title: 'About Recruitment Institute',
    subtitle: 'Who we are',
    description:
      'Recruitment Institute is a proud initiative by industry experts in India. We are on a mission to train every individual talent who wants to start and excel their career in Recruitment. We train you with practical, workplace-ready skills used by hiring teams every day.',
    image: null,
    createdAt: new Date(),
  },
]

const stats = [
  { value: '5,000+', label: 'Professionals Trained', icon: Users, color: '#1E40AF', bg: '#EFF6FF' },
  { value: '10+ Yrs', label: 'Industry Experience', icon: Award, color: '#7C3AED', bg: '#F5F3FF' },
  { value: '95%', label: 'Placement Support', icon: BadgeCheck, color: '#059669', bg: '#F0FDF4' },
  { value: '4', label: 'Specialized Programs', icon: BookOpenCheck, color: '#EA580C', bg: '#FFF7ED' },
]

const pillars = [
  {
    icon: TrendingUp,
    title: 'Practical Recruitment Skills',
    text: 'Boolean search, screening, calling, ATS workflows, offer coordination, and the habits hiring teams expect every day.',
    color: '#1E40AF',
    bg: '#EFF6FF',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Corporate Ready Training',
    text: 'Sessions built around live hiring cases, job descriptions, recruiter scorecards, and real communication practice.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: Handshake,
    title: 'Career Support',
    text: 'Resume guidance, mock interviews, and placement support channels for every student after course completion.',
    color: '#059669',
    bg: '#F0FDF4',
  },
]

const outcomes = [
  'End-to-end recruitment lifecycle practice',
  'Live sourcing and screening simulations',
  'Trainer-led feedback on recruiter communication',
  'Weekday and weekend learning options',
  'Certificate and placement assistance',
]

const checkpoints = [
  'Industry expert mentors',
  'Hands-on live assignments',
  'Placement oriented learning',
  'Beginner friendly batches',
]

const sectionImages = [
  '/assets/images/banner/home9.jpg',
  '/assets/images/banner/home4.jpg',
  '/assets/images/about/tab2.jpg',
]

function cleanText(value?: string | null) {
  if (!value) return ''
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function AboutClient({ sections }: Props) {
  const displaySections = sections.length > 0 ? sections : fallbackSections

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)', paddingTop: '80px', paddingBottom: '100px' }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* left glow */}
        <div className="absolute top-0 left-0 pointer-events-none"
          style={{ width: 500, height: 500, background: 'rgba(30,64,175,0.12)', filter: 'blur(100px)', transform: 'translate(-30%,-20%)' }} />
        {/* right glow */}
        <div className="absolute bottom-0 right-0 pointer-events-none"
          style={{ width: 400, height: 400, background: 'rgba(30,64,175,0.10)', filter: 'blur(80px)', transform: 'translate(20%,20%)' }} />

        <div className="container relative z-10">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 mb-8" style={{ fontSize: '12px', color: '#64748B' }}>
            <Link href="/"
              style={{ color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93C5FD' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748B' }}
            >Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: '#94A3B8' }}>About Us</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-6"
                style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <MapPin className="w-3.5 h-3.5" />
                Pune Based HR & Recruitment Academy
              </div>

              <h1 style={{ fontSize: 'clamp(34px,4.5vw,58px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' }}>
                Building Confident<br />
                <span style={{ color: '#60A5FA' }}>Recruiters</span> for<br />
                Modern Hiring Teams
              </h1>

              <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '500px', marginBottom: '36px' }}>
                Recruitment Institute bridges the gap between classroom HR knowledge and real hiring workflows. Students learn by practicing what recruiters actually do every day.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #1E40AF, #2563EB)', padding: '14px 28px', fontSize: '14px', boxShadow: '0 8px 24px rgba(30,64,175,0.4)', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-bold rounded-xl transition-all duration-200"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', padding: '14px 28px', fontSize: '14px', background: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)' }}
                >
                  Talk to Admissions
                </Link>
              </div>
            </div>

            {/* Right — image mosaic */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl overflow-hidden" style={{ height: '220px' }}>
                  <Image src="/assets/images/about/tab2.jpg" alt="HR training" width={320} height={220}
                    className="w-full h-full object-cover" priority />
                </div>
                <div className="rounded-2xl overflow-hidden mt-8" style={{ height: '220px' }}>
                  <Image src="/assets/images/banner/home9.jpg" alt="Recruitment professionals" width={320} height={220}
                    className="w-full h-full object-cover" priority />
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ height: '180px' }}>
                  <Image src="/assets/images/about/tab1.jpg" alt="Training session" width={320} height={180}
                    className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden relative flex flex-col justify-end"
                  style={{ height: '180px' }}>
                  <Image
                    src="/assets/images/about/tab3.jpg"
                    alt="Career-First training"
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(30,64,175,0.55) 0%, rgba(15,23,42,0.82) 100%)' }} />
                  <div className="relative z-10 p-5">
                    <Sparkles className="w-5 h-5 mb-2" style={{ color: '#BFDBFE' }} />
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Career-First</p>
                    <p style={{ fontSize: '11px', color: '#BFDBFE', marginTop: '4px', lineHeight: 1.6 }}>
                      Practical HR training by working recruitment professionals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom wave */}
        <div className="absolute bottom-0 left-0 right-0"
          style={{ background: 'white', height: '56px', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="container">
          {/* section label */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block', padding: '5px 16px', borderRadius: '50px',
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              color: '#1E40AF', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px',
            }}>
              By The Numbers
            </div>
            <h2 style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Trusted by thousands of HR professionals
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
            className="stats-grid"
          >
            {stats.map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  padding: '36px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 0,
                  transition: 'all 0.3s ease',
                  minWidth: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-6px)'
                  el.style.boxShadow = '0 20px 56px rgba(30,64,175,0.13)'
                  el.style.borderColor = '#BFDBFE'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
                  el.style.borderColor = '#E2E8F0'
                }}
              >
                {/* icon box */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: item.bg, color: item.color, marginBottom: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <item.icon style={{ width: '22px', height: '22px' }} />
                </div>

                {/* number */}
                <p style={{
                  fontSize: 'clamp(36px, 3.5vw, 48px)',
                  fontWeight: 800,
                  color: item.color,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}>
                  {item.value}
                </p>

                {/* divider */}
                <div style={{
                  width: '36px', height: '3px', borderRadius: '2px',
                  background: item.color, opacity: 0.25, margin: '14px 0',
                }} />

                {/* label */}
                <p style={{
                  fontSize: '13px', fontWeight: 700, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  lineHeight: 1.4, margin: 0,
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── About Sections (from DB) ── */}
      <section style={{ background: '#F8FAFC', padding: '80px 0 64px' }}>
        <div className="container">
          {displaySections.map((section, index) => {
            const title = cleanText(section.title) || 'About Recruitment Institute'
            const subtitle = cleanText(section.subtitle) || 'Who we are'
            const description = cleanText(section.description)

            return (
              <div key={section.id}
                className="grid lg:grid-cols-2 gap-16 items-center"
                style={{ marginBottom: index < displaySections.length - 1 ? '100px' : 0 }}>

                {/* Text side */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: '50px',
                    background: '#EFF6FF', color: '#1E40AF',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                    marginBottom: '20px',
                  }}>
                    {subtitle}
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px,3vw,42px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '20px' }}>
                    {title}
                  </h2>
                  {description && (
                    <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.85, marginBottom: '32px' }}>
                      {description}
                    </p>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    {checkpoints.map((point) => (
                      <div key={point} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5"
                        style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                          style={{ background: '#F0FDF4', color: '#10B981' }}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image side */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative">
                    {/* decorative border */}
                    <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl pointer-events-none"
                      style={{ border: '6px solid rgba(30,64,175,0.12)' }} />
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full pointer-events-none"
                      style={{ background: 'rgba(30,64,175,0.06)' }} />

                    <div className="relative rounded-3xl overflow-hidden bg-white"
                      style={{ border: '1px solid #E2E8F0', boxShadow: '0 24px 64px rgba(0,0,0,0.10)', padding: '12px' }}>
                      <Image
                        src={sectionImages[index % sectionImages.length]}
                        alt={title}
                        width={640}
                        height={500}
                        className="w-full rounded-2xl object-cover"
                        style={{ aspectRatio: '4/3' }}
                      />
                      {/* overlay badge */}
                      <div className="absolute bottom-8 left-8 right-8 rounded-2xl p-5"
                        style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '4px' }}>
                          Our Training Promise
                        </p>
                        <p style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                          Clear skills. Real practice. Career confidence.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Pillars Section ── */}
      <section className="pillars-section" style={{
        background: 'linear-gradient(160deg, #0A1628 0%, #0F172A 40%, #111827 70%, #0A1628 100%)',
        padding: '96px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        {/* ambient glows */}
        <div className="absolute pointer-events-none" style={{ top: '-80px', left: '-80px', width: 480, height: 480, background: 'radial-gradient(circle, rgba(30,64,175,0.18) 0%, transparent 70%)', filter: 'blur(1px)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-60px', right: '-60px', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)', filter: 'blur(1px)' }} />
        <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(30,64,175,0.07) 0%, transparent 70%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>

          {/* ── Header ── */}
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 72px' }}>
            {/* badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 18px', borderRadius: '50px',
              background: 'rgba(30,64,175,0.18)',
              border: '1px solid rgba(96,165,250,0.25)',
              color: '#93C5FD', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
              Why We Exist
            </div>

            <h2 style={{
              fontSize: 'clamp(30px, 3.5vw, 48px)', fontWeight: 800,
              color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}>
              Training That{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60A5FA, #818CF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Feels Like the Job
              </span>
            </h2>

            {/* accent line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.5))' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
              <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(96,165,250,0.5), transparent)' }} />
            </div>

            <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.85 }}>
              Designed for freshers, career switchers, HR professionals, and future agency owners who want recruitment skills they can use immediately.
            </p>
          </div>

          {/* ── Cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }} className="pillars-grid">
            {pillars.map((item, idx) => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '24px',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(255,255,255,0.08)'
                  el.style.borderColor = 'rgba(96,165,250,0.3)'
                  el.style.transform = 'translateY(-8px)'
                  el.style.boxShadow = '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(96,165,250,0.15)'
                  const glow = el.querySelector('.pillar-glow') as HTMLDivElement
                  if (glow) glow.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(255,255,255,0.04)'
                  el.style.borderColor = 'rgba(255,255,255,0.09)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                  const glow = el.querySelector('.pillar-glow') as HTMLDivElement
                  if (glow) glow.style.opacity = '0'
                }}
              >
                {/* corner glow on hover */}
                <div className="pillar-glow" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                  opacity: 0, transition: 'opacity 0.35s ease', borderRadius: '24px 24px 0 0',
                }} />

                {/* card number watermark */}
                <div style={{
                  position: 'absolute', top: '24px', right: '28px',
                  fontSize: '72px', fontWeight: 900,
                  color: 'rgba(255,255,255,0.03)', lineHeight: 1,
                  letterSpacing: '-0.05em', userSelect: 'none',
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* icon */}
                <div style={{
                  width: '68px', height: '68px', borderRadius: '18px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)`,
                  border: `1px solid ${item.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '28px',
                  boxShadow: `0 8px 24px ${item.color}20`,
                }}>
                  <item.icon style={{ width: '28px', height: '28px', color: item.color }} />
                </div>

                {/* title */}
                <h3 style={{
                  fontSize: '20px', fontWeight: 700, color: 'white',
                  lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: '14px',
                }}>
                  {item.title}
                </h3>

                {/* divider */}
                <div style={{
                  width: '32px', height: '2px', borderRadius: '2px',
                  background: `linear-gradient(90deg, ${item.color}, transparent)`,
                  marginBottom: '16px',
                }} />

                {/* body */}
                <p style={{
                  fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.85,
                  margin: 0, flexGrow: 1,
                }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* ── Bottom trust strip ── */}
          <div style={{
            marginTop: '64px',
            padding: '28px 40px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '40px',
          }}>
            {[
              { label: 'Live recruiter-led sessions', dot: '#60A5FA' },
              { label: 'Real hiring case studies', dot: '#818CF8' },
              { label: 'ATS & Boolean practice labs', dot: '#34D399' },
              { label: 'Weekend & weekday batches', dot: '#F59E0B' },
            ].map(({ label, dot }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#CBD5E1', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .pillars-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── Outcomes Dark Section ── */}
      <section className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', padding: '80px 0' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 pointer-events-none"
          style={{ width: 400, height: 400, background: 'rgba(30,64,175,0.12)', filter: 'blur(80px)' }} />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* text */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#93C5FD', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Student Outcomes
              </div>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '20px' }}>
                Walk in curious.<br />Walk out <span style={{ color: '#60A5FA' }}>recruiter-ready.</span>
              </h2>
              <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '460px' }}>
                Whether your goal is a first HR role, a better corporate recruitment job, or your own consultancy — every session stays focused on practical execution.
              </p>
            </div>

            {/* outcomes card */}
            <div className="rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '36px', backdropFilter: 'blur(8px)' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {outcomes.map((point, idx) => (
                  <li key={point}
                    className="flex items-center gap-4"
                    style={{ paddingTop: idx > 0 ? '16px' : 0, paddingBottom: idx < outcomes.length - 1 ? '16px' : 0, borderBottom: idx < outcomes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                      style={{ background: 'rgba(30,64,175,0.3)', color: '#93C5FD' }}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span style={{ fontSize: '15px', color: '#CBD5E1', fontWeight: 500 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ background: '#F8FAFC', padding: '80px 0' }}>
        <div className="container">
          <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div className="grid lg:grid-cols-2">
              {/* left */}
              <div className="bg-white p-10 lg:p-14">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{ background: 'linear-gradient(135deg, #1E40AF, #2563EB)' }}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 style={{ fontSize: 'clamp(24px,2.5vw,36px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: '16px' }}>
                  Ready to start your HR journey?
                </h2>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.8, marginBottom: '32px' }}>
                  Speak with our admissions coordinator about batches, syllabus, eligibility, course fees, and placement support.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 font-bold text-white rounded-xl transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #1E40AF, #2563EB)', padding: '14px 28px', fontSize: '14px', boxShadow: '0 8px 24px rgba(30,64,175,0.3)', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                  >
                    Enquire Now
                    <BadgeCheck className="w-4 h-4" />
                  </Link>
                  <Link href="/courses"
                    className="inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200"
                    style={{ border: '1.5px solid #E2E8F0', color: '#0F172A', padding: '14px 28px', fontSize: '14px', background: 'white', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1E40AF'; (e.currentTarget as HTMLAnchorElement).style.color = '#1E40AF' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.color = '#0F172A' }}
                  >
                    View Courses
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* right — dark panel */}
              <div className="relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0F172A, #1E40AF)', padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="absolute top-0 right-0 pointer-events-none"
                  style={{ width: 240, height: 240, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', transform: 'translate(30%,-30%)' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '24px' }}>
                  What you get
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {['Dedicated admissions counselor', 'Course fee & EMI details', 'Batch schedule & timings', 'Syllabus walkthrough', 'Placement track record'].map((item) => (
                    <li key={item} className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                        style={{ background: 'rgba(96,165,250,0.2)', color: '#60A5FA' }}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
