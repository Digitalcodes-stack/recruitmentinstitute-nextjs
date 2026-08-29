'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { AboutSection } from '@/types'
import styles from './AboutClient.module.css'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Handshake,
  IndianRupee,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'


import type { SiteStatItem } from '@/lib/site-stats-constants'

interface TestimonialItem {
  id: number
  author: string | null
  title: string | null
  description: string | null
  rating: number | null
  image: string | null
}

interface Props {
  sections: AboutSection[]
  testimonials?: TestimonialItem[]
  stats?: SiteStatItem[]
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

const defaultAboutStats: SiteStatItem[] = [
  { value: '5,000+', label: 'Professionals Trained', icon: 'users', iconColor: '#1E40AF', iconBg: '#EFF6FF' },
  { value: '10+ Yrs', label: 'Industry Expertise', icon: 'award', iconColor: '#7C3AED', iconBg: '#F5F3FF' },
  { value: '95%', label: 'Placement Success', icon: 'trending', iconColor: '#059669', iconBg: '#F0FDF4' },
  { value: '6', label: 'Programs Available', icon: 'book', iconColor: '#EA580C', iconBg: '#FFF7ED' },
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

function renderAboutStatIcon(icon: string) {
  switch (icon) {
    case 'users': return <Users style={{ width: '22px', height: '22px' }} />
    case 'book': return <BookOpenCheck style={{ width: '22px', height: '22px' }} />
    case 'award': return <Award style={{ width: '22px', height: '22px' }} />
    case 'trending': return <TrendingUp style={{ width: '22px', height: '22px' }} />
    case 'graduation': return <GraduationCap style={{ width: '22px', height: '22px' }} />
    case 'shield': return <BadgeCheck style={{ width: '22px', height: '22px' }} />
    default: return <Award style={{ width: '22px', height: '22px' }} />
  }
}

export default function AboutClient({ sections, testimonials = [], stats }: Props) {
  const displaySections = sections.length > 0 ? sections : fallbackSections
  const displayStats = stats && stats.length > 0 ? stats : defaultAboutStats

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


                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-bold rounded-xl transition-all duration-200"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', padding: '14px 28px', fontSize: '14px', background: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}


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
      <section className={`${styles.sectionLight} ${styles.sectionPadStats}`}>
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

          <div className={styles.statsGrid}>
            {displayStats.map((item) => (
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
              >
                {/* icon box */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: item.iconBg, color: item.iconColor, marginBottom: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {renderAboutStatIcon(item.icon)}
                </div>

                {/* number */}
                <p style={{
                  fontSize: 'clamp(36px, 3.5vw, 48px)',
                  fontWeight: 800,
                  color: item.iconColor,
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
                  background: item.iconColor, opacity: 0.25, margin: '14px 0',
                }} />

                {/* label */}
                <p style={{
                  fontSize: '13px', fontWeight: 700, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  lineHeight: 1.5, margin: 0,
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── About Sections (from DB) ── */}
      <section className={`${styles.sectionLight} ${styles.sectionPadAbout}`}>
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
      <section className={styles.pillarsSection}>
        <div className={styles.pillarsDotGrid} />
        <div className={styles.pillarsGlow1} />
        <div className={styles.pillarsGlow2} />
        <div className={styles.pillarsGlow3} />

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
          <div className={styles.pillarsGrid}>
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

      </section>

      {/* ── Outcomes Dark Section ── */}
      <section className={styles.outcomesSection}>
        <div className={styles.outcomesDotGrid} />
        <div className={styles.outcomesGlow} />

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
      <section className={styles.ctaSection}>
        <div className={styles.ctaBlob1} />
        <div className={styles.ctaBlob2} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          {/* ── Top label ── */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 100, padding: '6px 20px', marginBottom: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#1D4ED8' }}>Take the Next Step</span>
            </div>
          </div>

          {/* ── Main card ── */}
          <div style={{ background: '#fff', borderRadius: 32, border: '1px solid #E2E8F0', boxShadow: '0 24px 80px rgba(30,64,175,0.10)', overflow: 'hidden' }}>
            <div className={styles.ctaGrid}>

              {/* ── Left: CTA ── */}
              <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* icon */}
                <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, boxShadow: '0 10px 28px rgba(30,64,175,0.30)' }}>
                  <GraduationCap style={{ width: 28, height: 28, color: '#fff' }} />
                </div>

                <h2 style={{ fontSize: 'clamp(26px,2.8vw,40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.18, letterSpacing: '-0.03em', marginBottom: 16 }}>
                  Ready to start your<br />
                  <span style={{ background: 'linear-gradient(135deg,#1E40AF,#2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HR journey?</span>
                </h2>

                <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.85, marginBottom: 36, maxWidth: 400 }}>
                  Speak with our admissions coordinator about batches, syllabus, eligibility, course fees, and placement support.
                </p>

                {/* buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12, marginBottom: 40 }}>
                  <Link href="/contact"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: '#fff', padding: '14px 28px', borderRadius: 14, fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(30,64,175,0.32)' }}>
                    Enquire Now
                    <BadgeCheck style={{ width: 16, height: 16 }} />
                  </Link>
                  <Link href="/courses"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1.5px solid #BFDBFE', color: '#1D4ED8', padding: '14px 28px', borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: 'none', background: '#EFF6FF' }}>
                    View Courses
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </Link>
                </div>

                {/* mini trust row */}
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '10px 24px', paddingTop: 24, borderTop: '1px solid #F1F5F9' }}>
                  {[
                    { v: '5,000+', l: 'Graduates' },
                    { v: '95%', l: 'Placement' },
                    { v: '10+ Yrs', l: 'Experience' },
                  ].map(({ v, l }) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: '#1E40AF', letterSpacing: '-0.03em' }}>{v}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: What You Get ── */}
              <div style={{ background: 'linear-gradient(145deg,#EFF6FF 0%,#F5F3FF 100%)', borderLeft: '1px solid #E2E8F0', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #BFDBFE', borderRadius: 100, padding: '5px 14px', marginBottom: 28, alignSelf: 'flex-start' as const }}>
                  <Sparkles style={{ width: 12, height: 12, color: '#2563EB' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#1D4ED8' }}>What You Get</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: Users,          text: 'Dedicated admissions counselor',  color: '#1D4ED8', bg: '#EFF6FF' },
                    { icon: IndianRupee,    text: 'Course fee & EMI details',         color: '#059669', bg: '#F0FDF4' },
                    { icon: CalendarDays,  text: 'Batch schedule & timings',         color: '#7C3AED', bg: '#F5F3FF' },
                    { icon: BookOpenCheck,  text: 'Syllabus walkthrough',             color: '#D97706', bg: '#FFFBEB' },
                    { icon: TrendingUp,     text: 'Placement track record',           color: '#0891B2', bg: '#ECFEFF' },
                  ].map(({ icon: Icon, text, color, bg }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 14, padding: '14px 18px', border: '1px solid #E8EDF5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 17, height: 17, color }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{text}</span>
                      <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: 11, height: 11, color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section style={{ background: '#F8FAFC', padding: '80px 0', borderTop: '1px solid #E2E8F0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 50, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 18 }}>
                <Award style={{ width: 11, height: 11, color: '#D97706' }} /> Alumni Reviews
              </div>
              <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-.03em', margin: '0 0 14px' }}>
                What Our Students{' '}
                <span style={{ background: 'linear-gradient(120deg,#1D4ED8,#2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Say
                </span>
              </h2>
              <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
                Real stories from HR professionals and career switchers who trained with us.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
              {testimonials.map((t, i) => {
                const tColors = [
                  { border: '#BFDBFE', badge: '#EFF6FF', accent: '#1D4ED8' },
                  { border: '#BBF7D0', badge: '#F0FDF4', accent: '#059669' },
                  { border: '#DDD6FE', badge: '#F5F3FF', accent: '#7C3AED' },
                  { border: '#FDE68A', badge: '#FFFBEB', accent: '#D97706' },
                ]
                const c = tColors[i % tColors.length]
                const name = t.author || 'Alumni'
                const role = t.title || 'Student'
                const imgSrc = t.image ? (t.image.startsWith('http') ? t.image : `/${t.image.replace(/^\/+/, '')}`) : null
                const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={t.id} style={{ background: '#fff', border: `1.5px solid ${c.border}`, borderRadius: 20, padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 2px 12px rgba(15,23,42,.05)' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[...Array(5)].map((_, si) => (
                        <span key={si} style={{ fontSize: 14, color: si < (t.rating ?? 5) ? '#F59E0B' : '#E2E8F0' }}>★</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, fontStyle: 'italic', flex: 1, margin: 0 }}>
                      &ldquo;{t.description}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c.border}` }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.badge, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: c.accent }}>{initials}</span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{name}</p>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>{role}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 50, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 style={{ width: 10, height: 10, color: '#059669' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase' as const, letterSpacing: '.1em' }}>Verified</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/testimonials" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                View All Reviews <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
