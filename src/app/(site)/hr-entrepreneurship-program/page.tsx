'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, BadgeCheck, BarChart3, BookOpen, Briefcase, Building2,
  CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Clock, GraduationCap,
  Lightbulb, MessageSquare, Monitor, Rocket, Shield, Sparkles, Star,
  TrendingUp, Users, Zap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import CareerSupportSection from '@/components/home/CareerSupportSection'
import PlacementProjectsSection from '@/components/home/PlacementProjectsSection'

/* â"€â"€â"€ Static data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

const FEATURES = [
  { icon: Briefcase,   title: 'Business Model Design',        desc: 'Build a profitable agency model from scratch fees, retainers, and contracts.' },
  { icon: Shield,      title: 'Legal Setup & Compliance',      desc: 'Register your firm, handle GST filings, and draft airtight client agreements.' },
  { icon: Users,       title: 'Client Acquisition & Sales',    desc: 'Cold-email frameworks, LinkedIn outreach, and corporate client negotiation.' },
  { icon: TrendingUp,  title: 'Revenue & Scaling Strategies',  desc: 'Retainer billing models, contract staffing expansion, and profit maximization.' },
  { icon: Building2,   title: 'Team Building & Management',    desc: 'Hire screeners, set KPIs, build culture, and manage performance at scale.' },
  { icon: BarChart3,   title: 'Marketing Your Firm',           desc: 'SEO, social media, content strategy, and brand positioning for your agency.' },
]

const CURRICULUM = [
  {
    week: 'Module 1–2',
    title: 'Entrepreneurship Foundations & Market Research',
    accent: '#3B82F6',
    details: [
      'Overview of industry trends and competitive landscape',
      'Analyzing talent demand across sectors',
      'Spotting market gaps and unmet hiring needs',
      'Evaluating niches and specialization areas',
      'Market research and feasibility studies',
      'Setting vision, mission, and business goals',
    ],
  },
  {
    week: 'Module 3–4',
    title: 'Business Planning & Legal Setup',
    accent: '#8B5CF6',
    details: [
      'Sole proprietorship vs LLC vs corporation structures',
      'Business registration and documentation steps',
      'Tax registration & GST filings',
      'Structuring commission and retainer packages',
      'Essential tools, technologies, and office setup',
      'Administrative processes and systems',
    ],
  },
  {
    week: 'Module 5–6',
    title: 'Client Acquisition, Sales & Marketing',
    accent: '#10B981',
    details: [
      'Cold emailing templates that convert',
      'LinkedIn outreach and social media strategy',
      'Finding and closing high-value corporate clients',
      'Content marketing, SEO, and online advertising',
      'Negotiating billing rates and terms of business',
      'Building a referral and partnership network',
    ],
  },
  {
    week: 'Module 7–8',
    title: 'Operations, Team Management & Scaling',
    accent: '#F59E0B',
    details: [
      'Recruiting and onboarding associate screeners',
      'Setting up daily target trackers and KPIs',
      'Performance reviews, incentives, and rewards',
      'Agency ATS platform selection and automation',
      'Contract staffing and executive search expansion',
      'Scaling revenue with retainer and RPO models',
    ],
  },
]

const FAQS = [
  { q: 'Is this course suitable for someone without a business background?', a: 'Yes, absolutely. The course is designed to guide you step-by-step through every aspect of starting your own recruitment business no prior business experience is required.' },
  { q: 'How long is the program?', a: 'The program runs for 2 months (8 weeks) with live sessions and recorded materials so you can study at your own pace.' },
  { q: 'What type of business can I start after this course?', a: 'You can start a recruitment agency, staffing consultancy, HR advisory firm, or any business related to talent acquisition and hiring.' },
  { q: 'How much capital do I need to start a recruitment business?', a: 'The course includes dedicated financial planning modules to help you structure a lean launch strategy and begin with minimal upfront capital.' },
  { q: 'Is one-on-one mentoring included?', a: 'Yes. The program includes mentorship sessions with experienced recruitment entrepreneurs who have built successful agencies from the ground up.' },
  { q: 'Are there networking opportunities?', a: 'Yes, you will have access to live networking events, peer forums, and our alumni community of recruitment business owners across India.' },
]

const STATS = [
  { value: '500+', label: 'Businesses Launched',  color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  { value: '2 Mo', label: 'Program Duration',      color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  { value: '95%',  label: 'Placement Success',     color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
  { value: '6',    label: 'Core Modules',           color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
]

/* â"€â"€â"€ Page Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

export default function EntrepreneurshipPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'faqs'>('overview')
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const openSyllabus = () => {
    setActiveTab('curriculum')
    requestAnimationFrame(() => {
      document.getElementById('syllabus-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <>
      <style>{`
        .ep-page { font-family: 'Poppins', sans-serif; }

        /* Hero */
        .ep-hero {
          background: linear-gradient(135deg, #060D1F 0%, #0A1628 35%, #0D1F40 65%, #071028 100%);
          position: relative; overflow: hidden; min-height: 640px;
          display: flex; align-items: center;
        }
        .ep-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .ep-tag {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 50px; font-size: 11px;
          font-weight: 800; letter-spacing: .18em; text-transform: uppercase;
        }
        .ep-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 15px; border-radius: 50px; font-size: 12px; font-weight: 600;
        }
        .ep-cta-primary {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg, #1E40AF, #2563EB);
          color: #fff; font-weight: 700; font-size: 15px;
          padding: 15px 34px; border-radius: 12px; border: none;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 8px 28px rgba(30,64,175,.45);
          transition: transform .2s, box-shadow .2s;
        }
        .ep-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(30,64,175,.55); }
        .ep-cta-ghost {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1.5px solid rgba(255,255,255,.18); color: #fff;
          font-weight: 600; font-size: 14px; padding: 14px 28px;
          border-radius: 12px; text-decoration: none;
          background: rgba(255,255,255,.06);
          transition: background .2s, border-color .2s;
        }
        .ep-cta-ghost:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.3); }

        /* Feature cards */
        .ep-feat {
          background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0;
          padding: 28px 24px; transition: transform .28s, box-shadow .28s, border-color .28s;
          position: relative; overflow: hidden;
        }
        .ep-feat::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #1E40AF, #2563EB); opacity: 0;
          transition: opacity .28s;
        }
        .ep-feat:hover { transform: translateY(-6px); box-shadow: 0 22px 50px rgba(15,23,42,.11); border-color: #BFDBFE; }
        .ep-feat:hover::after { opacity: 1; }

        /* Module accordion */
        .ep-module {
          border-radius: 16px; overflow: hidden;
          border: 1.5px solid #E2E8F0; background: #fff;
          transition: border-color .2s, box-shadow .2s;
          margin-bottom: 12px;
        }
        .ep-module.open { border-color: #BFDBFE; box-shadow: 0 8px 28px rgba(30,64,175,.1); }
        .ep-module-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; background: transparent; border: none; cursor: pointer;
          text-align: left; transition: background .18s;
        }
        .ep-module-btn:hover { background: #F8FAFC; }

        /* FAQ accordion */
        .ep-faq {
          border-radius: 14px; overflow: hidden;
          border: 1.5px solid #E2E8F0; background: #fff;
          transition: border-color .2s, box-shadow .2s;
          margin-bottom: 10px;
        }
        .ep-faq.open { border-color: #BFDBFE; box-shadow: 0 6px 20px rgba(30,64,175,.08); }
        .ep-faq-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; background: transparent; border: none; cursor: pointer;
          text-align: left;
        }

        /* Sidebar */
        .ep-sidebar {
          background: #fff; border-radius: 22px;
          border: 1.5px solid #E2E8F0;
          box-shadow: 0 20px 60px rgba(15,23,42,.1);
          overflow: hidden; position: sticky; top: 100px;
        }

        /* Tab bar */
        .ep-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 10px;
          font-size: 13px; font-weight: 700; border: none;
          cursor: pointer; transition: all .2s;
        }
        .ep-tab.active {
          background: linear-gradient(135deg, #1E40AF, #2563EB);
          color: #fff; box-shadow: 0 4px 14px rgba(30,64,175,.3);
        }
        .ep-tab:not(.active) { background: transparent; color: #64748B; }
        .ep-tab:not(.active):hover { color: #1E40AF; background: #F1F5F9; }

        @media (max-width: 1100px) {
          .ep-hero-grid { grid-template-columns: 1fr !important; }
          .ep-hero-right { display: none !important; }
        }
        @media (max-width: 1024px) {
          .ep-content-grid { grid-template-columns: 1fr !important; }
          .ep-sidebar { position: static !important; }
        }
        @media (max-width: 860px) {
          .ep-feat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .ep-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .ep-feat-grid { grid-template-columns: 1fr !important; }
          .ep-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .ep-cta-row { flex-direction: column !important; }
        }
      `}</style>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ep-page ep-hero">
        {/* Ambient glows */}
        <div aria-hidden style={{ position: 'absolute', top: -160, left: -80, width: 640, height: 640, background: 'radial-gradient(circle, rgba(30,64,175,.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -60, right: '18%', width: 440, height: 440, background: 'radial-gradient(circle, rgba(16,185,129,.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: '25%', right: '5%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Gold accent line */}
        <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #D97706 28%, #3B82F6 72%, transparent)', zIndex: 3 }} />

        <div className="container ep-page" style={{ position: 'relative', zIndex: 10, padding: '80px 0 96px' }}>
          <div className="ep-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 480px', gap: '72px', alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* Breadcrumb */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: 12, fontWeight: 500, transition: 'color .18s' }}

>Home</Link>
                <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
                <Link href="/courses" style={{ color: '#64748B', textDecoration: 'none', fontSize: 12, fontWeight: 500, transition: 'color .18s' }}

>Courses</Link>
                <ChevronRight style={{ width: 13, height: 13, color: '#475569' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>HR Entrepreneurship</span>
              </nav>

              {/* Eyebrow */}
              <div className="ep-tag" style={{ background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', color: '#FCD34D', marginBottom: 24 }}>
                <Rocket style={{ width: 12, height: 12 }} />
                HR Entrepreneurship Program
              </div>

              {/* Headline */}
              <h1 style={{ fontSize: 'clamp(34px, 4.2vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: '-.04em', marginBottom: 22 }}>
                Become a{' '}
                <span style={{ background: 'linear-gradient(120deg, #60A5FA 0%, #34D399 55%, #FCD34D 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Hiring Master
                </span>
                <br />& Start Your Own Business
              </h1>

              <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.82, maxWidth: 520, marginBottom: 36 }}>
                Launch, grow, and scale your own recruitment consultancy or HR firm. From legal setup to client acquisition everything you need to succeed as an HR entrepreneur.
              </p>

              {/* Highlight pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 42 }}>
                {[
                  { text: '2-Month Program',      color: '#60A5FA', bg: 'rgba(96,165,250,.09)',   border: 'rgba(96,165,250,.22)'  },
                  { text: 'Online / Offline',      color: '#34D399', bg: 'rgba(52,211,153,.09)',   border: 'rgba(52,211,153,.22)'  },
                  { text: 'Intermediate Level',    color: '#FCD34D', bg: 'rgba(252,211,77,.09)',   border: 'rgba(252,211,77,.22)'  },
                  { text: 'Industry Certificate',  color: '#C4B5FD', bg: 'rgba(196,181,253,.09)',  border: 'rgba(196,181,253,.22)' },
                ].map(({ text, color, bg, border }) => (
                  <span key={text} className="ep-pill" style={{ background: bg, border: `1px solid ${border}`, color }}>
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    {text}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="ep-cta-row" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)} className="ep-cta-primary">
                  Enquire Now <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <Link href="/contact" className="ep-cta-ghost">
                  Request Call Back
                </Link>
              </div>
            </div>

            {/* Right visual card */}
            <div className="ep-hero-right" style={{ position: 'relative' }}>
              {/* Glow ring */}
              <div aria-hidden style={{ position: 'absolute', inset: -20, borderRadius: 32, background: 'linear-gradient(135deg, rgba(30,64,175,.25), rgba(16,185,129,.15), rgba(245,158,11,.1))', filter: 'blur(2px)' }} />

              <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 48px 110px rgba(0,0,0,.65)' }}>
                {/* Main image */}
                <div style={{ position: 'relative', height: 340, background: '#080F1F' }}>
                  <Image
                    src="/assets/images/entreprenuership.png"
                    alt="HR Entrepreneurship Start your own recruitment business"
                    fill priority sizes="480px"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,15,31,.1) 0%, transparent 45%, rgba(6,13,28,.9) 100%)' }} />

                  {/* Badge top left */}
                  <div style={{ position: 'absolute', top: 18, left: 18, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 50, background: 'rgba(245,158,11,.18)', border: '1px solid rgba(245,158,11,.42)', backdropFilter: 'blur(12px)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B', display: 'block' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#FCD34D', letterSpacing: '.12em', textTransform: 'uppercase' }}>Live Batches Open</span>
                  </div>

                  {/* Badge top right */}
                  <div style={{ position: 'absolute', top: 18, right: 18, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 50, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.22)' }}>
                    <Star style={{ width: 12, height: 12, color: '#FBBF24', fill: '#FBBF24' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>500+ Businesses</span>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ background: '#06111F', padding: '22px 26px 24px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: '#34D399', textTransform: 'uppercase', letterSpacing: '.2em', margin: '0 0 16px' }}>Program at a Glance</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { val: '2 Mo',  lbl: 'Duration',   color: '#60A5FA' },
                      { val: '6',     lbl: 'Modules',     color: '#34D399' },
                      { val: '500+',  lbl: 'Launched',    color: '#FCD34D' },
                    ].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, margin: '0 0 4px', letterSpacing: '-.03em' }}>{val}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust strip */}
                <div style={{ background: '#040C18', padding: '14px 26px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #040C18', overflow: 'hidden', marginLeft: i > 1 ? -8 : 0, position: 'relative', flexShrink: 0 }}>
                        <Image src={`/assets/images/team/style${i <= 2 ? 1 : 2}/${i <= 2 ? i : i - 2}.jpg`} alt="" fill sizes="28px" style={{ objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                    Trusted by <strong style={{ color: '#60A5FA' }}>500+ entrepreneurs</strong> across India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div aria-hidden style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 54, background: '#F8FAFC', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          STATS STRIP
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ep-page" style={{ background: '#F8FAFC', paddingTop: 64 }}>
        <div className="container">
          <div className="ep-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {STATS.map(({ value, label, color, bg, border }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', padding: '26px 22px', boxShadow: '0 2px 14px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 'clamp(28px,2.5vw,38px)', fontWeight: 900, color, lineHeight: 1, margin: 0, letterSpacing: '-.03em' }}>{value}</p>
                <div style={{ width: 24, height: 2.5, borderRadius: 2, background: color, opacity: .3, margin: '10px 0 8px' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.12em', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FEATURES GRID Premium redesign
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="syllabus-section" className="ep-page" style={{ background: '#fff', padding: '96px 0 104px', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">

          {/* Split header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 48, alignItems: 'center', marginBottom: 72 }}>
            <div>
              <div className="ep-tag" style={{ background: 'linear-gradient(135deg,rgba(30,64,175,.1),rgba(245,158,11,.08))', border: '1px solid rgba(30,64,175,.25)', color: '#3B82F6', marginBottom: 20, display: 'inline-flex' }}>
                <Lightbulb style={{ width: 11, height: 11 }} />
                What You Will Learn
              </div>
              <h2 style={{ fontSize: 'clamp(30px,3.4vw,50px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.06, letterSpacing: '-.045em', margin: '0 0 20px' }}>
                6 pillars of a{' '}
                <span style={{ background: 'linear-gradient(120deg,#3B82F6 0%,#8B5CF6 45%,#F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  successful recruitment
                </span>
                <br />business
              </h2>
              <p style={{ fontSize: 16, color: '#64748B', lineHeight: 1.85, maxWidth: 500, margin: 0 }}>
                Every module is crafted around real-world scenarios faced by recruitment entrepreneurs across India not theory, pure actionable business playbooks.
              </p>
            </div>

            {/* Right: outcome stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { num: '6',     label: 'Business-building pillars',  color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
                { num: '500+',  label: 'Businesses launched',         color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
                { num: '2 Mo',  label: 'Focused program duration',   color: '#10B981', bg: '#F0FDF4', border: '#BBF7D0' },
                { num: '100%',  label: 'Real-world project work',    color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
              ].map(({ num, label, color, bg, border }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#F8FAFC', border: `1.5px solid ${border}`, borderRadius: 14, padding: '14px 20px', transition: 'transform .2s,box-shadow .2s' }}

>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color, letterSpacing: '-.03em', lineHeight: 1 }}>{num}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6-pillar cards 3-column premium grid */}
          {(() => {
            const PALETTES = [
              { color: '#3B82F6', light: '#EFF6FF', border: '#BFDBFE', glow: 'rgba(59,130,246,.14)',  num: '01', grad: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' },
              { color: '#8B5CF6', light: '#F5F3FF', border: '#DDD6FE', glow: 'rgba(139,92,246,.14)',  num: '02', grad: 'linear-gradient(135deg,#7C3AED,#8B5CF6)' },
              { color: '#10B981', light: '#F0FDF4', border: '#BBF7D0', glow: 'rgba(16,185,129,.14)',  num: '03', grad: 'linear-gradient(135deg,#059669,#10B981)' },
              { color: '#F59E0B', light: '#FFFBEB', border: '#FDE68A', glow: 'rgba(245,158,11,.14)',  num: '04', grad: 'linear-gradient(135deg,#D97706,#F59E0B)' },
              { color: '#EC4899', light: '#FDF2F8', border: '#FBCFE8', glow: 'rgba(236,72,153,.14)',  num: '05', grad: 'linear-gradient(135deg,#BE185D,#EC4899)' },
              { color: '#0EA5E9', light: '#F0F9FF', border: '#BAE6FD', glow: 'rgba(14,165,233,.14)',  num: '06', grad: 'linear-gradient(135deg,#0369A1,#0EA5E9)' },
            ]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                {FEATURES.map(({ icon: Icon, title, desc }, i) => {
                  const p = PALETTES[i % PALETTES.length]
                  return (
                    <div key={title} style={{ position: 'relative', background: '#fff', borderRadius: 22, border: `1.5px solid ${p.border}`, padding: 0, overflow: 'hidden', transition: 'transform .3s,box-shadow .3s', boxShadow: '0 2px 18px rgba(15,23,42,.06)' }}

>
                      {/* Gradient top bar */}
                      <div style={{ height: 4, background: p.grad }} />
                      <div style={{ padding: '30px 28px 28px', position: 'relative' }}>
                        {/* Watermark number */}
                        <div aria-hidden style={{ position: 'absolute', top: 10, right: 20, fontSize: 88, fontWeight: 900, color: p.color, opacity: .045, lineHeight: 1, userSelect: 'none', letterSpacing: '-.04em', pointerEvents: 'none' }}>{p.num}</div>
                        {/* Icon */}
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: p.light, border: `1.5px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, position: 'relative', zIndex: 1, boxShadow: `0 4px 14px ${p.glow}` }}>
                          <Icon style={{ width: 26, height: 26, color: p.color }} />
                        </div>
                        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: p.color, textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: 10, opacity: .75, position: 'relative', zIndex: 1 }}>{p.num}</span>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.26, margin: '0 0 12px', position: 'relative', zIndex: 1 }}>{title}</h3>
                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.84, margin: '0 0 20px', position: 'relative', zIndex: 1 }}>{desc}</p>
                        <button
                          type="button"
                          onClick={openSyllabus}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            position: 'relative',
                            zIndex: 1,
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>Covered in syllabus</span>
                          <ArrowRight style={{ width: 13, height: 13, color: p.color }} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Bottom CTA strip */}
          <div style={{ marginTop: 52, borderRadius: 20, background: 'linear-gradient(135deg,#060D1F,#0D1F40)', border: '1px solid rgba(255,255,255,.07)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: -40, left: -20, width: 220, height: 220, background: 'radial-gradient(circle,rgba(30,64,175,.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div aria-hidden style={{ height: 2, position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6,#F59E0B)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Rocket style={{ width: 24, height: 24, color: '#60A5FA' }} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Ready to launch your own firm?</p>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>500+ graduates have already built profitable recruitment businesses. Your turn starts here.</p>
              </div>
            </div>
            <button onClick={() => setEnquiryOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px 30px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(30,64,175,.38)', whiteSpace: 'nowrap', flexShrink: 0, position: 'relative', zIndex: 1, transition: 'transform .2s,box-shadow .2s' }}

>
              Enrol in This Program <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN CONTENT tabs + sidebar
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ep-page" style={{ background: '#fff', padding: '80px 0 96px', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="ep-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 36, alignItems: 'start' }}>

            {/* â"€â"€ Left column â"€â"€ */}
            <div>
              {/* Tab bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 32, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '6px', width: 'fit-content', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
                {[
                  { id: 'overview',   label: 'Overview',  icon: <BookOpen style={{ width: 14, height: 14 }} /> },
                  { id: 'curriculum', label: 'Syllabus',   icon: <CheckCircle2 style={{ width: 14, height: 14 }} /> },
                  { id: 'faqs',       label: 'FAQs',       icon: <MessageSquare style={{ width: 14, height: 14 }} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`ep-tab${activeTab === tab.id ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* â"€â"€ Overview â"€â"€ */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Who is this for */}
                  <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: 22, padding: '32px 36px', color: '#fff' }}>
                    <div className="ep-tag" style={{ background: 'rgba(96,165,250,.14)', border: '1px solid rgba(96,165,250,.3)', color: '#93C5FD', marginBottom: 20, display: 'inline-flex' }}>
                      <Users style={{ width: 11, height: 11 }} />
                      Who Is This For?
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        'Aspiring entrepreneurs planning to start a recruitment firm',
                        'Experienced recruiters transitioning to business ownership',
                        'Professionals diversifying into HR consulting services',
                        'Students and freshers with an entrepreneurial mindset',
                        'Anyone wanting to build a lean, profitable staffing agency',
                        'HR professionals who want to monetize their expertise',
                      ].map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
                          <CheckCircle2 style={{ width: 14, height: 14, color: '#34D399', flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.55, fontWeight: 500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What's included */}
                  <div style={{ background: '#F8FAFC', borderRadius: 22, border: '1.5px solid #E2E8F0', padding: '32px 36px' }}>
                    <div className="ep-tag" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669', marginBottom: 20, display: 'inline-flex' }}>
                      <GraduationCap style={{ width: 11, height: 11 }} />
                      Course Materials Included
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        'Business plan & financial projection templates',
                        'Client agreement and terms of business contracts',
                        'Cold email & LinkedIn outreach script library',
                        'ATS platform setup and operations guide',
                        'Case studies from real Indian recruitment agencies',
                        'Certificate of completion from Recruitment Institute',
                      ].map((item) => (
                        <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#DCFCE7', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <CheckCircle2 style={{ width: 11, height: 11, color: '#059669' }} />
                          </div>
                          <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* â"€â"€ Curriculum â"€â"€ */}
              {activeTab === 'curriculum' && (
                <div>
                  <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: 22, padding: '24px 28px', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Detailed Course Modules</h3>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{CURRICULUM.length} modules click to expand each topic</p>
                  </div>
                  {CURRICULUM.map((mod, i) => {
                    const isOpen = expandedModule === i
                    return (
                      <div key={i} className={`ep-module${isOpen ? ' open' : ''}`}>
                        <button className="ep-module-btn" onClick={() => setExpandedModule(isOpen ? null : i)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: isOpen ? mod.accent : '#EFF6FF', border: `1.5px solid ${isOpen ? mod.accent : '#BFDBFE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: isOpen ? '#fff' : '#1E40AF' }}>{i + 1}</span>
                            </div>
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 800, color: mod.accent, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 2px' }}>{mod.week}</p>
                              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{mod.title}</p>
                            </div>
                          </div>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: isOpen ? '#EFF6FF' : '#F8FAFC', border: `1px solid ${isOpen ? '#BFDBFE' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isOpen ? <ChevronUp style={{ width: 14, height: 14, color: '#1E40AF' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#94A3B8' }} />}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '0 24px 22px', borderTop: `2px solid ${mod.accent}22` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.1em', margin: '16px 0 12px' }}>Topics covered in this module:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              {mod.details.map((d) => (
                                <div key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.accent, flexShrink: 0, marginTop: 5 }} />
                                  <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.55 }}>{d}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* â"€â"€ FAQs â"€â"€ */}
              {activeTab === 'faqs' && (
                <div>
                  <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: 22, padding: '24px 28px', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Frequently Asked Questions</h3>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Everything you need to know before enrolling</p>
                  </div>
                  {FAQS.map((faq, i) => {
                    const isOpen = expandedFaq === i
                    return (
                      <div key={i} className={`ep-faq${isOpen ? ' open' : ''}`}>
                        <button className="ep-faq-btn" onClick={() => setExpandedFaq(isOpen ? null : i)}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', paddingRight: 16, lineHeight: 1.4 }}>{faq.q}</span>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isOpen ? '#1E40AF' : '#F1F5F9', border: `1px solid ${isOpen ? '#1E40AF' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
                            {isOpen ? <ChevronUp style={{ width: 13, height: 13, color: '#fff' }} /> : <ChevronDown style={{ width: 13, height: 13, color: '#64748B' }} />}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '4px 22px 20px', borderTop: '1px solid #E0EDFF' }}>
                            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.82, margin: '12px 0 0' }}>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* â"€â"€ Sidebar â"€â"€ */}
            <aside className="ep-sidebar">
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', padding: '24px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    🚀
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: 0 }}>HR Entrepreneurship Program</p>
                    <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0' }}>Recruitment Institute Certification</p>
                  </div>
                </div>
              </div>

              {/* Course details */}
              <div>
                {[
                  { label: 'Duration',       value: '2 Months' },
                  { label: 'Learning Mode',  value: 'Online / Offline' },
                  { label: 'Course Level',   value: 'Intermediate' },
                  { label: 'Certification',  value: 'Industry Verified' },
                  { label: 'Support',        value: 'Mock Interviews & JDs' },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ padding: '20px 22px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => setEnquiryOpen(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(30,64,175,.3)', transition: 'transform .2s' }}


                >
                  Enquire About Batches <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
                <a
                  href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#059669,#0D9488)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px', borderRadius: 11, textDecoration: 'none', boxShadow: '0 4px 14px rgba(5,150,105,.25)', transition: 'transform .2s' }}


                >
                  <MessageSquare style={{ width: 15, height: 15 }} />
                  WhatsApp Admissions
                </a>
              </div>

              {/* Trust note */}
              <div style={{ padding: '13px 22px', borderTop: '1px solid #F8FAFC', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <BadgeCheck style={{ width: 15, height: 15, color: '#10B981' }} />
                <p style={{ fontSize: 11, color: '#64748B', fontWeight: 600, margin: 0 }}>100% practical training • Certificate on completion</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CareerSupportSection />
      <PlacementProjectsSection />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          BOTTOM CTA BANNER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ep-page" style={{ background: '#F8FAFC', padding: '0 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius: 24, background: 'linear-gradient(130deg,#060D1F 0%,#0F172A 50%,#0A1628 100%)', border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', position: 'relative' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div aria-hidden style={{ position: 'absolute', top: -60, right: -40, width: 380, height: 380, background: 'radial-gradient(circle,rgba(30,64,175,.2) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div aria-hidden style={{ position: 'absolute', bottom: -40, left: '30%', width: 280, height: 280, background: 'radial-gradient(circle,rgba(16,185,129,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
            <div aria-hidden style={{ height: 2, background: 'linear-gradient(90deg,#1E40AF,#D97706,#14B8A6)' }} />

            <div style={{ padding: '60px 56px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <div className="ep-tag" style={{ background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', color: '#FCD34D', marginBottom: 22, display: 'inline-flex' }}>
                <Zap style={{ width: 11, height: 11 }} />
                Limited Batch Seats
              </div>
              <h2 style={{ fontSize: 'clamp(26px,3vw,44px)', fontWeight: 900, color: '#fff', lineHeight: 1.12, letterSpacing: '-.03em', marginBottom: 18 }}>
                Ready to build your own<br />recruitment empire?
              </h2>
              <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.82, maxWidth: 520, margin: '0 auto 36px' }}>
                Join 500+ entrepreneurs who launched successful recruitment businesses with the Recruitment Institute. Your first batch seat is just one enquiry away.
              </p>

              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                <button onClick={() => setEnquiryOpen(true)} className="ep-cta-primary">
                  Enrol Now <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="ep-cta-ghost">
                  <MessageSquare style={{ width: 15, height: 15 }} /> WhatsApp Us
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, flexWrap: 'wrap' }}>
                {['No hidden fees', 'Industry certificate', 'Mentorship included'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#34D399' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#breadcrumb',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://recruitmentinstitute.in' },
              { '@type': 'ListItem', position: 2, name: 'Courses', item: 'https://recruitmentinstitute.in/courses' },
              { '@type': 'ListItem', position: 3, name: 'HR Entrepreneurship Program', item: 'https://recruitmentinstitute.in/hr-entrepreneurship-program' },
            ],
          },
          {
            '@type': 'Course',
            '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#course',
            name: 'Become a Hiring Master and Start Your Own Business',
            description: 'Learn how to build and scale your own recruitment consultancy. From legal setup to client acquisition, everything you need as an HR entrepreneur.',
            url: 'https://recruitmentinstitute.in/hr-entrepreneurship-program',
            provider: { '@type': 'Organization', name: 'Recruitment Institute', url: 'https://recruitmentinstitute.in' },
            educationalLevel: 'Intermediate',
            timeRequired: 'P2M',
            inLanguage: 'en-IN',
            courseMode: ['online', 'offline'],
            breadcrumb: { '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#breadcrumb' },
            offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
          },
          {
            '@type': 'WebPage',
            '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#webpage',
            url: 'https://recruitmentinstitute.in/hr-entrepreneurship-program',
            name: 'HR Entrepreneurship Program',
            description: 'A practical business-focused HR program for aspiring recruitment entrepreneurs.',
            isPartOf: { '@id': 'https://recruitmentinstitute.in/#website' },
            about: { '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#course' },
            breadcrumb: { '@id': 'https://recruitmentinstitute.in/hr-entrepreneurship-program#breadcrumb' },
          },
        ],
      }) }} />

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}
