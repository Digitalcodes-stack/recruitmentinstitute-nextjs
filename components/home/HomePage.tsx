'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, Star,
  Users, BookOpen, Award, TrendingUp, ArrowRight,
  Phone, GraduationCap,
  BadgeCheck, Clock, Layers, PlayCircle
} from 'lucide-react'
import EnquiryModal from './EnquiryModal'
import homeStudentsBanner from '../../public/assets/images/banner/home9.jpg'

/* ─── Data ─────────────────────────────────────────────────── */

const defaultCourses = [
  {
    id: 1,
    title: 'Recruitment Career Starter',
    badge: 'Beginner Friendly',
    badgeCls: 'bg-sky-600 text-white',
    level: 'For Freshers',
    duration: '4 Weeks',
    desc: 'Become job-ready for your first recruitment job in 4 weeks. Master candidate sourcing, Boolean search, Job Portal sourcing, and screening calls.',
    href: '/recruitment-career-starter',
    image: '/assets/images/about/tab1.jpg',
    bar: 'from-sky-500 to-sky-700',
    highlights: ['Job Portal & Sourcing', 'Candidate Calling Drills', 'Placement & Resume Support'],
  },
  {
    id: 2,
    title: 'Professional Recruitment Specialist',
    badge: 'Most Popular',
    badgeCls: 'bg-red-600 text-white',
    level: 'For Professionals',
    duration: '8 Weeks',
    desc: 'Master end-to-end recruitment with practical industry training. Full lifecycle requisition management, IT/Non-IT sourcing, and STAR interviewing.',
    href: '/professional-recruitment-specialist',
    image: '/assets/images/banner/home9.jpg',
    bar: 'from-red-500 to-red-700',
    highlights: ['IT & Non-IT Tech Sourcing', 'STAR Interview Framework', 'Salary & Offer Negotiation'],
  },
  {
    id: 3,
    title: 'Advanced Recruitment & TA Masterclass',
    badge: 'Executive Track',
    badgeCls: 'bg-purple-600 text-white',
    level: 'Senior Professionals',
    duration: '6 Weeks',
    desc: 'Upgrade from recruiter to strategic talent acquisition leader. Headhunting, TA analytics, headcount forecasting, and leadership SLAs.',
    href: '/advanced-recruitment-ta-masterclass',
    image: '/assets/images/courses/home14/3.jpg',
    bar: 'from-purple-500 to-purple-700',
    highlights: ['Executive Headhunting', 'TA Dashboards & Analytics', 'Leadership Hiring SLAs'],
  },
  {
    id: 4,
    title: 'Recruitment Business Accelerator',
    badge: 'Agency Track',
    badgeCls: 'bg-amber-600 text-white',
    level: 'Entrepreneurship',
    duration: '8 Weeks',
    desc: 'Don’t just become a recruiter — build your recruitment agency. Legal incorporation, B2B client acquisition, MSAs, and 12-month ₹1 Cr scaling roadmap.',
    href: '/recruitment-business-accelerator',
    image: '/assets/images/courses/style4/4.jpg',
    bar: 'from-amber-500 to-amber-700',
    highlights: ['Agency Legal & MSA Setup', 'B2B Client Prospecting', '12-Month ₹1 Cr Blueprint'],
  },
  {
    id: 5,
    title: 'Recruitment Business Growth Consulting',
    badge: '1-to-1 Advisory',
    badgeCls: 'bg-emerald-600 text-white',
    level: 'Business Consulting',
    duration: '3 Months',
    desc: 'Build, acquire clients, deliver, collect and scale. Bespoke 1-on-1 advisory for existing recruitment and HR outsourcing agency founders.',
    href: '/recruitment-business-growth-consulting',
    image: '/assets/images/courses/home14/4.jpg',
    bar: 'from-emerald-500 to-emerald-700',
    highlights: ['Retained Search Positioning', 'Cash Flow & DSO Optimization', 'Direct Founder Mentorship'],
  },
  {
    id: 6,
    title: 'Corporate Recruitment Training',
    badge: 'Enterprise',
    badgeCls: 'bg-indigo-600 text-white',
    level: 'Corporate',
    duration: 'Custom (2–6 Wks)',
    desc: 'Practical recruitment training designed around your enterprise hiring requirements. Interview calibration and talent retention workflows.',
    href: '/corporate-recruitment-training',
    image: '/assets/images/courses/home14/2.jpg',
    bar: 'from-indigo-500 to-indigo-700',
    highlights: ['Custom Hiring Playbooks', 'Interviewer Calibration', 'Pre-Boarding Retention'],
  },
]

import type { SiteStatItem } from '@/lib/site-stats-constants'
import { DEFAULT_SITE_STATS } from '@/lib/site-stats-constants'

const defaultStats: SiteStatItem[] = DEFAULT_SITE_STATS

function renderStatIcon(icon: string, cls = "w-6 h-6 sm:w-7 sm:h-7") {
  switch (icon) {
    case 'users': return <Users className={cls} />
    case 'book': return <BookOpen className={cls} />
    case 'award': return <Award className={cls} />
    case 'trending': return <TrendingUp className={cls} />
    case 'graduation': return <GraduationCap className={cls} />
    case 'star': return <Star className={cls} />
    case 'shield': return <BadgeCheck className={cls} />
    case 'clock': return <Clock className={cls} />
    default: return <Award className={cls} />
  }
}

const whyUs = [
  { icon: <BadgeCheck className="w-6 h-6" />, title: 'Expert Instructors', desc: 'Learn from active industry recruiters and HR professionals with real corporate experience.', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  { icon: <Layers className="w-6 h-6" />, title: 'Comprehensive Syllabus', desc: 'Every module maps to real-world workflows — no placeholders, no outdated theory.', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { icon: <PlayCircle className="w-6 h-6" />, title: '100% Practical Focus', desc: 'Work with live ATS platforms, boolean search strings, and real-world recruitment cases.', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { icon: <GraduationCap className="w-6 h-6" />, title: 'Placement Assistance', desc: 'Receive mock interview coaching, resume reviews, and partner company referrals.', iconBg: '#FFFBEB', iconColor: '#D97706' },
  { icon: <Clock className="w-6 h-6" />, title: 'Flexible Batches', desc: 'Weekday and weekend batches designed for working professionals and students alike.', iconBg: '#FFF1F2', iconColor: '#E11D48' },
  { icon: <Award className="w-6 h-6" />, title: 'Industry Certificate', desc: 'Earn a recognised certification that demonstrates your HR and recruitment expertise.', iconBg: '#F0FDF4', iconColor: '#059669' },
]

const process = [
  { n: '01', title: 'Choose Your Course', desc: 'Browse our programs and select the one that best fits your career goals and experience level.' },
  { n: '02', title: 'Enroll & Register', desc: 'Fill out the enquiry form or WhatsApp us. Our counsellors will guide you through admissions.' },
  { n: '03', title: 'Learn & Practice', desc: 'Attend live sessions, complete hands-on projects, and practice on real ATS tools and job portals.' },
  { n: '04', title: 'Get Certified & Placed', desc: 'Earn your certificate, build your HR resume, and get placement assistance through our network.' },
]

const defaultTestimonials = [
  { name: 'Poonam Pol', role: 'HR Executive', company: 'Tech Startup, Pune', initial: 'P', grad: 'from-red-500 to-rose-600', text: 'The End-to-End Recruitment Training completely transformed my career. The practical approach — boolean searching, ATS exposure — helped me land an HR Specialist role in less than 2 months.' },
  { name: 'Rahul Sharma', role: 'Recruitment Consultant', company: 'Independent Agency', initial: 'R', grad: 'from-blue-500 to-blue-700', text: 'Outstanding curriculum! The HR Entrepreneurship program gave me a clear roadmap to start my own agency. The client billing and business development guidance was worth every rupee.' },
  { name: 'Priya Desai', role: 'HR Talent Partner', company: 'MNC, Bangalore', initial: 'P', grad: 'from-emerald-500 to-teal-600', text: 'The corporate upskilling program helped standardise our entire talent acquisition workflow. Our average cost-to-hire decreased significantly while retention metrics improved.' },
  { name: 'Amit Kulkarni', role: 'Senior Recruiter', company: 'IT Firm, Pune', initial: 'A', grad: 'from-purple-500 to-purple-700', text: 'I switched from sales to HR after completing the Beginners program. The trainers were incredibly patient and the practical exercises gave me the confidence to start my HR career.' },
]

/* ─── Types ─────────────────────────────────────────────────── */

interface ServiceItem { id: number; title: string; description: string; image: string; slug: string }
interface ExpertItem { id: number; name: string; profession: string; image: string; category: string }
interface ClientItem { id: number; name: string; logo: string; website: string }

interface HomePageProps {
  courses?: typeof defaultCourses
  stats?: typeof defaultStats
  testimonials?: typeof defaultTestimonials
  services?: ServiceItem[]
  experts?: ExpertItem[]
  clients?: ClientItem[]
}

/* ─── Accent palette per course card ──────────────────────── */
const ACCENTS = [
  { glow: 'rgba(14,165,233,0.18)', light: '#EFF6FF', border: '#BAE6FD', solid: '#0284C7', grad: 'linear-gradient(135deg,#0284C7,#0369A1)', num: '01' },
  { glow: 'rgba(220,38,38,0.18)', light: '#FEF2F2', border: '#FECACA', solid: '#DC2626', grad: 'linear-gradient(135deg,#B91C1C,#DC2626)', num: '02' },
  { glow: 'rgba(124,58,237,0.18)', light: '#F5F3FF', border: '#DDD6FE', solid: '#7C3AED', grad: 'linear-gradient(135deg,#6D28D9,#7C3AED)', num: '03' },
  { glow: 'rgba(217,119,6,0.18)', light: '#FFFBEB', border: '#FDE68A', solid: '#D97706', grad: 'linear-gradient(135deg,#D97706,#B45309)', num: '04' },
  { glow: 'rgba(5,150,105,0.18)', light: '#F0FDF4', border: '#BBF7D0', solid: '#059669', grad: 'linear-gradient(135deg,#047857,#059669)', num: '05' },
  { glow: 'rgba(79,70,229,0.18)', light: '#EEF2FF', border: '#C7D2FE', solid: '#4F46E5', grad: 'linear-gradient(135deg,#4F46E5,#4338CA)', num: '06' },
]

/* ─── Testimonial colour palette ───────────────────────────── */
const T_COLORS = [
  { border: '#BFDBFE', badge: '#EFF6FF', accent: '#1D4ED8', top: '#1D4ED8' },
  { border: '#BBF7D0', badge: '#F0FDF4', accent: '#059669', top: '#059669' },
  { border: '#DDD6FE', badge: '#F5F3FF', accent: '#7C3AED', top: '#7C3AED' },
  { border: '#FDE68A', badge: '#FFFBEB', accent: '#D97706', top: '#D97706' },
]

const FALLBACK_TESTIMONIAL_PHOTOS = [
  '/assets/images/testimonial/home12/1.jpg',
  '/assets/images/testimonial/home12/2.jpg',
  '/assets/images/testimonial/home12/3.jpg',
  '/assets/images/testimonial/home12/4.jpg',
]

/* ─── Hero avatar colours ───────────────────────────────────── */
const AVATAR_COLORS = ['#F59E0B', '#1D4ED8', '#10B981', '#7C3AED', '#DC2626']
const AVATAR_LETTERS = ['P', 'R', 'A', 'S', 'M']

export default function HomePage({
  courses: courseData,
  stats: statData,
  testimonials: testimonialData,
  services: serviceData,
  experts: expertData,
  clients: clientData,
}: HomePageProps) {
  const courses = courseData?.length ? courseData : defaultCourses
  const stats = statData?.length ? statData : defaultStats
  const testimonials = testimonialData?.length ? testimonialData : defaultTestimonials
  const services = serviceData ?? []
  const experts = expertData ?? []
  const clients = clientData ?? []
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-accent-line" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="hero-diagonal-bg" />
        </div>
        <div className="hero-grid-bg" />
        <div className="hero-glow-top" />
        <div className="hero-glow-bottom" />

        <div className="container relative z-10 w-full hero-inner">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* LEFT */}
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                <span className="hero-eyebrow-text">India&apos;s #1 Recruitment Academy</span>
              </div>

              <div>
                <h1 className="hero-h1">Launch Your</h1>
                <h1 className="hero-h1--gradient">HR &amp; Recruitment</h1>
                <h1 className="hero-h1">Career Today.</h1>
              </div>

              <p className="hero-sub">
                India&apos;s most practical recruitment training — boolean search, ATS tools, sourcing strategy, and real placement support. From freshers to entrepreneurs.
              </p>

              <div className="hero-chips">
                {[
                  { label: `${stats[0]?.value || '5,000+'} Graduates`, cls: 'hero-chip hero-chip--blue' },
                  { label: `${stats[3]?.value || '95%'} Placement Rate`, cls: 'hero-chip hero-chip--green' },
                  { label: 'Industry Certificate', cls: 'hero-chip hero-chip--purple' },
                  { label: 'Live + Online Batches', cls: 'hero-chip hero-chip--orange' },
                ].map((chip) => (
                  <span key={chip.label} className={chip.cls}>
                    <CheckCircle2 className="w-3 h-3" />
                    {chip.label}
                  </span>
                ))}
              </div>

              <div className="hero-ctas">
                <Link href="/courses" className="hero-cta-primary">
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </Link>
                <button onClick={() => setEnquiryOpen(true)} className="hero-cta-secondary">
                  <Phone className="w-5 h-5" /> Free Callback
                </button>
              </div>

              <div className="hero-social-proof">
                <div className="hero-avatars">
                  {AVATAR_COLORS.map((c, i) => (
                    <div key={i} className="hero-avatar" style={{ background: c, marginLeft: i === 0 ? 0 : -10 }}>
                      {AVATAR_LETTERS[i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="hero-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="hero-social-text">Trusted by <strong style={{ color: '#0F172A' }}>{stats[0]?.value || '5,000+'}</strong> HR professionals</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="hero-right">
              <div className="hero-deco-ring" />

              <div className="hero-img-wrap">
                <Image src={homeStudentsBanner} alt="HR Training students" fill className="object-cover object-center" priority sizes="(max-width: 1024px) 90vw, 580px" />
                <div className="hero-img-overlay" />

                <div className="hero-img-badge">
                  <div className="hero-img-badge-icon">
                    <GraduationCap style={{ width: 22, height: 22, color: 'white' }} />
                  </div>
                  <div>
                    <p className="hero-img-badge-num">{stats[0]?.value || '5,000+'}</p>
                    <p className="hero-img-badge-sub">Graduates Placed</p>
                  </div>
                </div>
              </div>

              <div className="hero-float-rating">
                <div className="hero-stars" style={{ marginBottom: 6 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="hero-float-rating-num">4.9 / 5.0</p>
                <p className="hero-float-rating-sub">200+ Google Reviews</p>
              </div>

              <div className="hero-float-placement">
                <p className="hero-float-placement-num">{stats[3]?.value || '95%'}</p>
                <p className="hero-float-placement-sub">Placement Support Success</p>
                <div className="hero-float-placement-bar-track">
                  <div className="hero-float-placement-bar-fill" />
                </div>
              </div>

              <div className="hero-since-label hidden xl:flex">
                <span className="hero-since-line" />
                <span className="hero-since-text">Since 2014</span>
                <span className="hero-since-line" />
              </div>
            </div>
          </div>

          {/* TRUST BAR */}
          <div className="hero-trust-bar">
            {stats.map((item, i, arr) => (
              <div key={i} className={`hero-trust-item${i < arr.length - 1 ? ' hero-trust-item--bordered' : ''}`}>
                <div className="hero-trust-icon" style={{ background: item.iconBg, color: item.iconColor }}>
                  {renderStatIcon(item.icon, "w-5 h-5")}
                </div>
                <div>
                  <p className="hero-trust-value">{item.value}</p>
                  <p className="hero-trust-label">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLIENT MARQUEE ════════════════════════════════════
      {clients.length > 0 && (
        <section className="marquee-section">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="marquee-label-wrap">
              <p className="marquee-label">
                Our Alumni<br /><span className="marquee-label-accent">Work At</span>
              </p>
            </div>
            <div className="marquee-track-wrap">
              <div className="marquee-track">
                {[...clients, ...clients].map((c, i) => {
                  const src = c.logo.startsWith('http') ? c.logo : `/${c.logo.replace(/^\/+/, '')}`
                  const imgEl = <img key={i} src={src} alt={c.name} style={{ height: 34, maxWidth: 120, objectFit: 'contain', display: 'block' }} />
                  return c.website ? (
                    <a key={i} href={c.website} target="_blank" rel="noopener noreferrer" title={c.name} className="marquee-logo-link">
                      {imgEl}
                    </a>
                  ) : <div key={i} className="marquee-logo-static">{imgEl}</div>
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      */}

      {/* ══ STATS BAR ═════════════════════════════════════════
      <section className="stats-bar-section">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`stats-bar-item group${i < 3 ? ' stats-bar-item--bordered' : ''}`}>
                <div className="stats-bar-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                  {renderStatIcon(s.icon, "w-7 h-7")}
                </div>
                <div className="text-center sm:text-left">
                  <div className="stats-bar-value">{s.value}</div>
                  <div className="stats-bar-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ══ COURSES ═══════════════════════════════════════════ */}
      <section className="courses-section">
        <div className="courses-section-bg-radial" />
        <div className="courses-section-dots" />

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <div style={{ maxWidth: '620px' }}>
              <div className="courses-eyebrow">
                <BookOpen className="courses-eyebrow-icon w-3.5 h-3.5" />
                <span className="courses-eyebrow-text">Our Training Programs</span>
              </div>
              <h2 className="courses-heading">
                Choose Your Course With{' '}
                <span className="courses-heading-accent">India&apos;s No.1 Recruitment Institute</span>
              </h2>
              <p className="courses-sub">
                Practical, industry-ready programs designed for every career stage — from freshers to corporate leaders.
              </p>
            </div>
            <Link href="/courses" className="courses-view-all">
              View All Programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c, i) => {
              const a = ACCENTS[i] ?? ACCENTS[0]
              return (
                <article
                  key={c.id}
                  className="course-card-v2 group"
                  style={{ border: `1.5px solid ${a.border}` }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-10px)'
                    el.style.boxShadow = `0 24px 60px -8px ${a.glow}, 0 4px 24px rgba(0,0,0,0.08)`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
                  }}
                >
                  <div className="course-card-top-bar" style={{ background: a.grad }} />

                  <div className="course-card-img-wrap">
                    <Image
                      src={c.image} alt={c.title} fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    />
                    <div className="course-card-img-overlay" />

                    <div className="course-card-badge">
                      <span className={`font-extrabold uppercase ${c.badgeCls}`}>{c.badge}</span>
                    </div>

                    <div className="course-card-duration">
                      <Clock className="w-3 h-3" style={{ color: a.solid }} />
                      <span className="course-card-duration-text">{c.duration}</span>
                    </div>
                  </div>

                  <div className="course-card-body-v2">
                    <span className="course-card-level" style={{ color: a.solid }}>{c.level}</span>
                    <h3 className="course-card-title">{c.title}</h3>
                    <p className="course-card-desc">{c.desc}</p>

                    <div className="course-card-highlights">
                      {c.highlights.map((h) => (
                        <div key={h} className="course-card-highlight-item">
                          <span className="course-card-check" style={{ background: a.light, border: `1px solid ${a.border}` }}>
                            <CheckCircle2 className="w-3 h-3" style={{ color: a.solid }} />
                          </span>
                          <span className="course-card-check-text">{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                      <span className="text-sky-700 font-extrabold">Online: 50% OFF</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-800 font-extrabold">Classroom: 10% OFF</span>
                    </div>

                    <Link
                      href={c.href}
                      className="course-card-cta group/btn"
                      style={{ background: a.grad, boxShadow: `0 4px 16px -4px ${a.glow}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    >
                      Explore Program
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="courses-trust-strip">
            <div className="courses-trust-items">
              {[
                { icon: <GraduationCap className="w-4 h-4" />, text: '5,000+ Graduates' },
                { icon: <BadgeCheck className="w-4 h-4" />, text: 'Industry Certificate' },
                { icon: <PlayCircle className="w-4 h-4" />, text: 'Live Online Sessions' },
              ].map(({ icon, text }) => (
                <div key={text} className="courses-trust-item">
                  <span className="courses-trust-icon">{icon}</span>
                  <span className="courses-trust-text">{text}</span>
                </div>
              ))}
            </div>
            <p className="courses-trust-note">Online &amp; Offline Batches Available</p>
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ═════════════════════════════════════ */}
      <section className="why-section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="why-eyebrow">Why Choose Us</span>
              <h2 className="why-heading">The Career Advantage</h2>
              <div className="why-divider" />
              <p className="why-desc">
                At Recruitment Institute, we replace theoretical lectures with practical recruiter labs. Our goal is to prepare you for real team workloads on day one.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                {whyUs.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-default">
                    <div className="why-feature-icon" style={{ background: f.iconBg, color: f.iconColor }}>
                      {f.icon}
                    </div>
                    <div>
                      <h4 className="why-feature-title">{f.title}</h4>
                      <p className="why-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="why-ctas">
                <button onClick={() => setEnquiryOpen(true)} className="why-enquire-btn">
                  Enquire Now <ArrowRight className="w-5 h-5" />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="why-whatsapp-btn">
                  <WhatsAppIcon /> WhatsApp Us
                </a>
              </div>
            </div>

            {/* Dark promo panel */}
            <div className="why-promo-panel">
              <div className="why-promo-glow-top" />
              <div className="why-promo-glow-bottom" />
              <div className="why-promo-accent-line" />

              <div className="relative z-10 flex flex-col gap-7">
                <div className="why-promo-icon">
                  <TrophyIcon />
                </div>

                <div>
                  <h3 className="why-promo-title">Begin Your Learning Path Today</h3>
                  <p className="why-promo-desc">
                    Join a network of 5,000+ HR graduates placing in specialised roles across India. Master modern ATS tools, sourcing, and build your recruiter career.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[['5,000+', 'Students Trained'], ['95%', 'Placement Rate'], ['10+ Yrs', 'Of Excellence'], ['4', 'Expert Courses']].map(([v, l]) => (
                    <div key={l} className="why-promo-stat">
                      <div className="why-promo-stat-value">{v}</div>
                      <div className="why-promo-stat-label">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="why-promo-rating">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <div>
                    <p className="why-promo-rating-title">4.9 / 5.0 Rating</p>
                    <p className="why-promo-rating-sub">Based on 200+ Google reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <section className="hiw-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <span className="hiw-eyebrow">Simple Process</span>
            <h2 className="hiw-heading">How It Works</h2>
            <div className="hiw-divider" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hiw-connector hidden lg:block" />
            {process.map((p, i) => (
              <div key={i} className="hiw-step group">
                <div className="hiw-step-num">{p.n}</div>
                <div className="hiw-step-card">
                  <h3 className="hiw-step-title">{p.title}</h3>
                  <p className="hiw-step-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hiw-cta-wrap">
            <button onClick={() => setEnquiryOpen(true)} className="hiw-cta-btn">
              Get Started Today <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══════════════════════════════════════════ */}
      {services.length > 0 && (
        <section className="services-section">
          <div className="container">
            <div className="services-header">
              <div className="services-eyebrow">
                <span className="services-eyebrow-dot" />
                <span className="services-eyebrow-text">What We Offer</span>
              </div>
              <h2 className="services-heading">Our Services</h2>
              <p className="services-desc">
                End-to-end HR &amp; recruitment solutions designed to accelerate your career and your organisation.
              </p>
            </div>

            <div className="services-grid">
              {services.map((s, i) => {
                const accents = ['#1D4ED8', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2']
                const lightBgs = ['#EFF6FF', '#F5F3FF', '#F0FDF4', '#FEF2F2', '#FFFBEB', '#ECFEFF']
                const fallbackImgs = [
                  '/assets/images/banner/home9.jpg',
                  '/assets/images/about/tab2.jpg',
                  '/assets/images/about/tab1.jpg',
                  '/assets/images/bg/about-bg.jpg',
                  '/assets/images/bg/main-home.jpg',
                  '/assets/images/breadcrumbs/5.jpg',
                ]
                const acc = accents[i % accents.length]
                const lbg = lightBgs[i % lightBgs.length]
                const src = s.image
                  ? (s.image.startsWith('http') ? s.image : `/${s.image.replace(/^\/+/, '')}`)
                  : fallbackImgs[i % fallbackImgs.length]
                const href = '/contact'

                return (
                  <div key={s.id} className="service-card">
                    <div className="service-card-img-wrap">
                      <img src={src} alt={s.title} className="service-card-img" />
                      <div className="service-card-img-accent" style={{ background: acc }} />
                    </div>

                    <div className="service-card-body">
                      <div className="service-card-icon" style={{ background: lbg, border: `1.5px solid ${acc}22` }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: acc }}>{s.title.charAt(0)}</span>
                      </div>

                      <h3 className="service-card-title">{s.title}</h3>

                      {s.description && (
                        <p className="service-card-desc">{s.description}</p>
                      )}

                      <Link href={href} className="service-card-footer" style={{ borderTop: `1px solid ${acc}18`, textDecoration: 'none' }}>
                        <span className="service-card-footer-label" style={{ color: acc }}>Learn More</span>
                        <div className="service-card-arrow" style={{ background: lbg, border: `1.5px solid ${acc}30` }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6h8M6 2l4 4-4 4" stroke={acc} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ EXPERTS ═══════════════════════════════════════════ */}
      {experts.length > 0 && (
        <section className="experts-section">
          <div className="container">
            <div className="text-center" style={{ marginBottom: '52px' }}>
              <span className="experts-eyebrow">Meet The Team</span>
              <h2 className="experts-heading">Our Expert Trainers</h2>
              <p className="experts-sub">Learn from active industry professionals with real corporate experience.</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {experts.map((e, i) => {
                const ecolors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0284C7', '#DC2626', '#0891B2']
                const ec = ecolors[i % ecolors.length]
                const initials = e.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <div key={e.id} className="expert-card">
                    <div className="expert-card-header" style={{ background: `linear-gradient(135deg,${ec}22,${ec}11)` }}>
                      {e.image ? (
                        <img src={e.image} alt={e.name} className="expert-card-avatar" style={{ border: `3px solid ${ec}44` }} />
                      ) : (
                        <div className="expert-card-initials" style={{ background: ec }}>{initials}</div>
                      )}
                    </div>
                    <div className="expert-card-body">
                      <p className="expert-card-name">{e.name}</p>
                      {e.profession && <p className="expert-card-profession">{e.profession}</p>}
                      <span className="expert-card-tag" style={{ background: `${ec}11`, color: ec, border: `1px solid ${ec}33` }}>
                        {e.category}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="text-center" style={{ maxWidth: 620, margin: '0 auto 52px' }}>
            <div className="testimonials-eyebrow">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Alumni Reviews
            </div>
            <h2 className="testimonials-heading">
              What Our Students{' '}
              <span className="testimonials-heading-accent">Say</span>
            </h2>
            <p className="testimonials-sub">
              Real stories from HR professionals and career switchers who trained with us.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => {
              const c = T_COLORS[i % T_COLORS.length]
              const imageSrc = (t as { image?: string | null }).image
                ? (((t as { image?: string | null }).image as string).startsWith('http')
                  ? ((t as { image?: string | null }).image as string)
                  : `/${((t as { image?: string | null }).image as string).replace(/^\/+/, '')}`)
                : FALLBACK_TESTIMONIAL_PHOTOS[i % FALLBACK_TESTIMONIAL_PHOTOS.length]
              return (
                <div
                  key={i}
                  className="testimonial-card-v2 hover:-translate-y-1"
                  style={{ borderColor: c.border }}
                >
                  <div className="testimonial-card-top-bar" style={{ background: c.top }} />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="testimonial-card-quote">&ldquo;{t.text}&rdquo;</p>
                  <div className="testimonial-card-footer">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={t.name}
                        className="testimonial-card-avatar"
                        style={{ objectFit: 'cover', borderColor: c.border }}
                      />
                    ) : (
                      <div
                        className="testimonial-card-avatar"
                        style={{ background: c.badge, borderColor: c.border, color: c.accent }}
                      >
                        {t.initial}
                      </div>
                    )}
                    <div>
                      <p className="testimonial-card-name">{t.name}</p>
                      <p className="testimonial-card-role">{t.role}</p>
                      <p className="testimonial-card-company" style={{ color: c.accent }}>{t.company}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="testimonials-aggregate">
            <div className="testimonials-score-box">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <div className="testimonials-score-divider" />
              <div>
                <p className="testimonials-score-num">4.9 / 5.0</p>
                <p className="testimonials-score-sub">Based on 200+ Google reviews</p>
              </div>
            </div>
            <a href="/testimonials" className="testimonials-all-link">
              View All Reviews →
            </a>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════ */}
      <section className="cta-banner-section">
        <div className="cta-banner-bg" />
        <div className="cta-banner-glow-top" />
        <div className="cta-banner-glow-bottom" />

        <div className="container relative z-10 text-center flex flex-col items-center gap-8">
          <span className="cta-banner-eyebrow">Next Batch Enrolling Now</span>

          <h2 className="cta-banner-heading">Start Your Recruitment Career Today</h2>

          <p className="cta-banner-sub">
            Register today. Join our live recruiter training network, master modern screening models, and fast-track your HR career.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/courses" className="cta-banner-enroll">
              Enroll Now <ArrowRight className="w-5 h-5" />
            </Link>
            <button onClick={() => setEnquiryOpen(true)} className="cta-banner-talk">
              <Phone className="w-5 h-5" /> Talk To Counsellor
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {['100% Practical Training', 'Industry Certificate', 'Placement Support', 'Expert Mentors'].map((t) => (
              <span key={t} className="cta-banner-feature">
                <CheckCircle2 className="cta-banner-feature-icon w-4 h-4 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}

function TrophyIcon() {
  return (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
