'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, BadgeCheck, BarChart3, BookOpen,
  CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  GraduationCap, Layers, MessageSquare, Search,
  Shield, Sparkles, Star, Target, TrendingUp, Users, Zap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import CareerSupportSection from '@/components/home/CareerSupportSection'
import PlacementProjectsSection from '@/components/home/PlacementProjectsSection'

/* â"€â"€ Static Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

const FEATURES = [
  { icon: Search,      title: 'Job Analysis & Sourcing',          desc: 'Master active/passive sourcing, Boolean search, LinkedIn recruiting, and talent pool development.' },
  { icon: Layers,      title: 'Resume Screening & Selection',      desc: 'Screen at scale using automation tools, competency frameworks, and structured decision criteria.' },
  { icon: MessageSquare, title: 'Interview Design & Execution',    desc: 'Build behavioral, situational, and technical interview blueprints for every role type.' },
  { icon: Target,      title: 'Domain-Specific Recruitment',       desc: 'Deep-dive into IT, BFSI, Pharma, Healthcare, Manufacturing, and FMCG hiring workflows.' },
  { icon: TrendingUp,  title: 'Employer Branding & Marketing',     desc: 'Craft job descriptions, run email campaigns, and leverage SEO to attract top talent.' },
  { icon: BarChart3,   title: 'Metrics, ATS & Career Planning',    desc: 'Track KPIs, master modern ATS tools, and prepare your placement profile for the market.' },
]

const CURRICULUM = [
  {
    week: 'Week 1–2',
    title: 'Recruitment Fundamentals & Job Analysis',
    accent: '#DC2626',
    details: [
      'Job analysis & role intake meetings',
      'Writing clear and compelling job profiles',
      'Understanding the end-to-end hiring lifecycle',
      'Key recruitment terminology and frameworks',
      'Navigating multiple applicant sourcing channels',
      'Recruiter roles, skills, and daily responsibilities',
    ],
  },
  {
    week: 'Week 3–4',
    title: 'Sourcing Strategies & Boolean Search',
    accent: '#EA580C',
    details: [
      'Google X-ray and advanced Boolean search strings',
      'Advanced LinkedIn Recruiter filters and InMail',
      'Targeting and engaging passive candidates',
      'Job board strategies (Naukri, Indeed, LinkedIn)',
      'Building and maintaining talent pipelines',
      'Social media sourcing Facebook, Twitter, GitHub',
    ],
  },
  {
    week: 'Week 5–6',
    title: 'Screening, Interviews & Candidate Assessment',
    accent: '#D97706',
    details: [
      'Competency-based and behavioural interview techniques',
      'Vetting resumes at scale with automated tools',
      'Phone, video, and in-person interview structures',
      'Conducting initial screening calls professionally',
      'Decision-making and candidate evaluation frameworks',
      'Candidate communication and workflow management',
    ],
  },
  {
    week: 'Week 7–8',
    title: 'Domain Specialisation (IT / Non-IT)',
    accent: '#16A34A',
    details: [
      'IT sourcing terminology and technical assessment',
      'BFSI sector staffing models and role structures',
      'Pharma / Healthcare credential verification',
      'Manufacturing & FMCG role requirements',
      'Finance certifications and competitive strategies',
      'Domain-specific talent attraction techniques',
    ],
  },
  {
    week: 'Week 9–10',
    title: 'Offer Management, Onboarding & Branding',
    accent: '#2563EB',
    details: [
      'Drafting and structuring competitive job offers',
      'Counter-offer negotiation techniques',
      'Candidate onboarding checklists and workflows',
      'Building a strong employer brand',
      'Job description optimisation and content marketing',
      'Legal and ethical recruitment considerations',
    ],
  },
  {
    week: 'Week 11–12',
    title: 'Metrics, Tools, Practical Project & Placement Prep',
    accent: '#7C3AED',
    details: [
      'Modern ATS platform overview and operations',
      'KPI trackers, dashboards, and hiring metrics',
      'Complete end-to-end recruitment plan development',
      'Live candidate sourcing and screening project',
      'Mock interviews and final hiring rationale',
      'Resume optimisation and placement registration',
    ],
  },
]

const FAQS = [
  { q: 'Who is this course suitable for?', a: 'This program is ideal for HR professionals, active recruiters, recent graduates, and working professionals transitioning into the recruitment field. No prior experience is required a basic understanding of HR concepts is beneficial but not mandatory.' },
  { q: 'How long does the program take?', a: 'The program is a 3-month intensive covering 12 weeks of structured content, live sessions, and practical assignments designed for working professionals.' },
  { q: 'Is the course available online?', a: 'Yes. The course is available both online and in-person. Live sessions, recorded materials, and a dedicated support team ensure you get full value regardless of your location.' },
  { q: 'Does it cover all industry domains?', a: 'Absolutely. The program includes dedicated modules for IT, BFSI, Pharma, Healthcare, Manufacturing, FMCG, and Finance recruitment giving you the breadth to work across any sector.' },
  { q: 'Will I get placement support?', a: 'Yes. Placement support includes resume review sessions, mock interviews, access to our hiring partner network, and registration with our placement team upon completion.' },
  { q: 'What certificate will I receive?', a: 'You will receive an industry-recognised certificate of completion from Recruitment Institute that is trusted by 200+ hiring companies across India and shareable on LinkedIn.' },
  { q: 'Is this suitable for working professionals?', a: 'Yes. The schedule is designed to accommodate working professionals with flexible timing, recorded sessions for missed classes, and weekend batch options.' },
]

const STATS = [
  { value: '3 Mo',  label: 'Program Duration',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { value: '12',    label: 'Weekly Modules',      color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  { value: '5K+',   label: 'Trained Recruiters',  color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { value: '100%',  label: 'Practical Training',  color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
]

const DOMAINS = [
  { label: 'IT & Technology',     color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { label: 'BFSI',                color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Pharma',              color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { label: 'Healthcare',          color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { label: 'Manufacturing',       color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'FMCG',               color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  { label: 'Finance',             color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  { label: 'All Domains',         color: '#6D28D9', bg: '#F5F3FF', border: '#C4B5FD' },
]

/* â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

export default function EndToEndRecruitmentPage() {
  const [enquiryOpen, setEnquiryOpen]     = useState(false)
  const [activeTab, setActiveTab]         = useState<'overview' | 'curriculum' | 'faqs'>('overview')
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [expandedFaq, setExpandedFaq]     = useState<number | null>(null)

  const openSyllabus = () => {
    setActiveTab('curriculum')
    requestAnimationFrame(() => {
      document.getElementById('syllabus-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const ldJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: 'End-to-End Recruitment Training with All Domains',
        description: 'Master the complete recruitment lifecycle across all domains IT, BFSI, Pharma, Manufacturing. 3-month program covering sourcing, screening, interviewing, and onboarding.',
        url: 'https://recruitmentinstitute.in/end-to-end-recruitment-training',
        provider: { '@type': 'Organization', name: 'Recruitment Institute', url: 'https://recruitmentinstitute.in' },
        educationalLevel: 'All Levels', timeRequired: 'P3M', inLanguage: 'en-IN',
        courseMode: ['online', 'offline'],
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://recruitmentinstitute.in' },
          { '@type': 'ListItem', position: 2, name: 'Courses', item: 'https://recruitmentinstitute.in/courses' },
          { '@type': 'ListItem', position: 3, name: 'End-to-End Recruitment Training', item: 'https://recruitmentinstitute.in/end-to-end-recruitment-training' },
        ],
      },
    ],
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />

      <style>{`
        .e2e { font-family: 'Poppins', sans-serif; }

        /* Hero */
        .e2e-hero {
          background: linear-gradient(135deg, #0A0612 0%, #120818 35%, #1A0A20 65%, #0D0615 100%);
          position: relative; overflow: hidden; min-height: 660px;
          display: flex; align-items: center;
        }
        .e2e-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,.028) 1px, transparent 1px);
          background-size: 30px 30px;
        }

        /* Shared utility */
        .e2e-tag {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 50px;
          font-size: 11px; font-weight: 800;
          letter-spacing: .18em; text-transform: uppercase;
        }
        .e2e-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 15px; border-radius: 50px; font-size: 12px; font-weight: 600;
        }

        /* CTAs */
        .e2e-cta {
          display: inline-flex; align-items: center; gap: 9px;
          background: linear-gradient(135deg, #B91C1C, #DC2626);
          color: #fff; font-weight: 700; font-size: 15px;
          padding: 15px 34px; border-radius: 12px; border: none;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 8px 28px rgba(185,28,28,.45);
          transition: transform .2s, box-shadow .2s;
        }
        .e2e-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(185,28,28,.55); }
        .e2e-cta-ghost {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1.5px solid rgba(255,255,255,.18); color: #fff;
          font-weight: 600; font-size: 14px; padding: 14px 28px;
          border-radius: 12px; text-decoration: none;
          background: rgba(255,255,255,.06);
          transition: background .2s, border-color .2s;
        }
        .e2e-cta-ghost:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.3); }

        /* Feature cards */
        .e2e-feat {
          background: #fff; border-radius: 18px; border: 1.5px solid #E2E8F0;
          padding: 28px 24px; transition: transform .28s, box-shadow .28s, border-color .28s;
          position: relative; overflow: hidden;
        }
        .e2e-feat::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #B91C1C, #DC2626); opacity: 0; transition: opacity .28s;
        }
        .e2e-feat:hover { transform: translateY(-6px); box-shadow: 0 22px 50px rgba(15,23,42,.11); border-color: #FECACA; }
        .e2e-feat:hover::after { opacity: 1; }

        /* Accordion */
        .e2e-mod {
          border-radius: 16px; overflow: hidden;
          border: 1.5px solid #E2E8F0; background: #fff;
          transition: border-color .2s, box-shadow .2s; margin-bottom: 12px;
        }
        .e2e-mod.open { border-color: #FECACA; box-shadow: 0 8px 28px rgba(220,38,38,.1); }
        .e2e-mod-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; background: transparent; border: none; cursor: pointer;
          text-align: left; transition: background .18s;
        }
        .e2e-mod-btn:hover { background: #FFF8F8; }

        .e2e-faq {
          border-radius: 14px; overflow: hidden;
          border: 1.5px solid #E2E8F0; background: #fff;
          transition: border-color .2s, box-shadow .2s; margin-bottom: 10px;
        }
        .e2e-faq.open { border-color: #FECACA; box-shadow: 0 6px 20px rgba(220,38,38,.08); }
        .e2e-faq-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; background: transparent; border: none; cursor: pointer; text-align: left;
        }

        /* Tab */
        .e2e-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 22px; border-radius: 10px;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: all .2s;
        }
        .e2e-tab.active { background: linear-gradient(135deg, #B91C1C, #DC2626); color: #fff; box-shadow: 0 4px 14px rgba(185,28,28,.3); }
        .e2e-tab:not(.active) { background: transparent; color: #64748B; }
        .e2e-tab:not(.active):hover { color: #DC2626; background: #FEF2F2; }

        /* Sidebar */
        .e2e-sidebar {
          background: #fff; border-radius: 22px; border: 1.5px solid #E2E8F0;
          box-shadow: 0 20px 60px rgba(15,23,42,.1);
          overflow: hidden; position: sticky; top: 100px;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .e2e-hero-grid { grid-template-columns: 1fr !important; }
          .e2e-hero-right { display: none !important; }
        }
        @media (max-width: 1024px) {
          .e2e-content-grid { grid-template-columns: 1fr !important; }
          .e2e-sidebar { position: static !important; }
        }
        @media (max-width: 860px) {
          .e2e-feat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .e2e-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .e2e-domain-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 560px) {
          .e2e-feat-grid, .e2e-domain-grid { grid-template-columns: repeat(2,1fr) !important; }
          .e2e-cta-row { flex-direction: column !important; }
        }
      `}</style>

      {/* â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="e2e e2e-hero">
        {/* Glows */}
        <div aria-hidden style={{ position:'absolute', top:-180, left:-100, width:680, height:680, background:'radial-gradient(circle,rgba(220,38,38,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', bottom:-60, right:'15%', width:480, height:480, background:'radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', top:'30%', right:'8%', width:300, height:300, background:'radial-gradient(circle,rgba(234,88,12,.07) 0%,transparent 65%)', pointerEvents:'none' }} />
        {/* Accent line */}
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#DC2626 28%,#EA580C 72%,transparent)', zIndex:3 }} />

        <div className="container e2e" style={{ position:'relative', zIndex:10, padding:'80px 0 96px' }}>
          <div className="e2e-hero-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 490px', gap:'72px', alignItems:'center' }}>

            {/* Left */}
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28 }}>
                <Link href="/" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Home</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <Link href="/courses" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Courses</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <span style={{ fontSize:12, fontWeight:600, color:'#FCA5A5' }}>End-to-End Recruitment</span>
              </nav>

              <div className="e2e-tag" style={{ background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.3)', color:'#FCA5A5', marginBottom:24 }}>
                <Target style={{ width:12, height:12 }} />
                Complete Recruitment Mastery
              </div>

              <h1 style={{ fontSize:'clamp(32px,4vw,58px)', fontWeight:900, color:'#fff', lineHeight:1.07, letterSpacing:'-.04em', marginBottom:22 }}>
                Master{' '}
                <span style={{ background:'linear-gradient(120deg,#FCA5A5 0%,#FB923C 50%,#FCD34D 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  End-to-End
                </span>
                <br />Recruitment All Domains
              </h1>

              <p style={{ fontSize:17, color:'#94A3B8', lineHeight:1.82, maxWidth:520, marginBottom:36 }}>
                The most comprehensive recruitment training program in India. From job analysis to final hire covering IT, BFSI, Pharma, Manufacturing, and every major domain.
              </p>

              {/* Pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:42 }}>
                {[
                  { text:'3-Month Program',     color:'#FCA5A5', bg:'rgba(252,165,165,.09)', border:'rgba(252,165,165,.22)' },
                  { text:'Online / Offline',    color:'#6EE7B7', bg:'rgba(110,231,183,.09)', border:'rgba(110,231,183,.22)' },
                  { text:'All Levels',          color:'#FCD34D', bg:'rgba(252,211,77,.09)',  border:'rgba(252,211,77,.22)'  },
                  { text:'8 Industry Domains',  color:'#93C5FD', bg:'rgba(147,197,253,.09)', border:'rgba(147,197,253,.22)' },
                ].map(({ text, color, bg, border }) => (
                  <span key={text} className="e2e-pill" style={{ background:bg, border:`1px solid ${border}`, color }}>
                    <CheckCircle2 style={{ width:12, height:12 }} />{text}
                  </span>
                ))}
              </div>

              <div className="e2e-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)} className="e2e-cta">
                  Enquire Now <ArrowRight style={{ width:16, height:16 }} />
                </button>
                <Link href="/contact" className="e2e-cta-ghost">Request Call Back</Link>
              </div>
            </div>

            {/* Right */}
            <div className="e2e-hero-right" style={{ position:'relative' }}>
              <div aria-hidden style={{ position:'absolute', inset:-20, borderRadius:32, background:'linear-gradient(135deg,rgba(220,38,38,.22),rgba(234,88,12,.14),rgba(37,99,235,.1))', filter:'blur(2px)' }} />
              <div style={{ position:'relative', borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,.1)', boxShadow:'0 48px 110px rgba(0,0,0,.65)' }}>

                {/* Main image */}
                <div style={{ position:'relative', height:340, background:'#0A0612' }}>
                  <Image src="/assets/images/courses/main-home/1.jpg"
                    alt="End-to-End Recruitment Training all domains"
                    fill priority sizes="490px"
                    style={{ objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(10,6,18,.1) 0%,transparent 40%,rgba(6,4,12,.9) 100%)' }} />

                  {/* Badges */}
                  <div style={{ position:'absolute', top:18, left:18, display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:50, background:'rgba(220,38,38,.18)', border:'1px solid rgba(220,38,38,.42)', backdropFilter:'blur(12px)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#F87171', boxShadow:'0 0 8px #F87171', display:'block' }} />
                    <span style={{ fontSize:10, fontWeight:800, color:'#FCA5A5', letterSpacing:'.12em', textTransform:'uppercase' }}>Enrolments Open</span>
                  </div>
                  <div style={{ position:'absolute', top:18, right:18, display:'inline-flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:50, background:'rgba(255,255,255,.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.22)' }}>
                    <Star style={{ width:12, height:12, color:'#FBBF24', fill:'#FBBF24' }} />
                    <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>5,000+ Trained</span>
                  </div>

                  {/* Domain pills overlay */}
                  <div style={{ position:'absolute', bottom:18, left:18, right:18, display:'flex', flexWrap:'wrap', gap:6 }}>
                    {['IT','BFSI','Pharma','Healthcare','Manufacturing'].map(d => (
                      <span key={d} style={{ fontSize:10, fontWeight:700, color:'#fff', background:'rgba(0,0,0,.55)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.18)', padding:'4px 10px', borderRadius:50 }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ background:'#0A0612', padding:'22px 26px 24px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'#F87171', textTransform:'uppercase', letterSpacing:'.2em', margin:'0 0 16px' }}>Program at a Glance</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {[
                      { val:'3 Mo', lbl:'Duration', color:'#FCA5A5' },
                      { val:'12',   lbl:'Modules',  color:'#6EE7B7' },
                      { val:'5K+',  lbl:'Trained',  color:'#FCD34D' },
                    ].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22, fontWeight:900, color, lineHeight:1, margin:'0 0 4px', letterSpacing:'-.03em' }}>{val}</p>
                        <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', margin:0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust strip */}
                <div style={{ background:'#07040F', padding:'14px 26px', borderTop:'1px solid rgba(255,255,255,.05)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #07040F', overflow:'hidden', marginLeft:i>1?-8:0, position:'relative', flexShrink:0 }}>
                        <Image src={`/assets/images/team/style${i<=2?1:2}/${i<=2?i:i-2}.jpg`} alt="" fill sizes="28px" style={{ objectFit:'cover' }} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize:12, color:'#64748B', fontWeight:500 }}>
                    <strong style={{ color:'#FCA5A5' }}>5,000+</strong> professionals trained across India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:54, background:'#F8FAFC', clipPath:'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* â•â• STATS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="e2e" style={{ background:'#F8FAFC', paddingTop:64 }}>
        <div className="container">
          <div className="e2e-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {STATS.map(({ value, label, color }) => (
              <div key={label} style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', padding:'26px 22px', boxShadow:'0 2px 14px rgba(15,23,42,.06)', display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                <p style={{ fontSize:'clamp(28px,2.5vw,38px)', fontWeight:900, color, lineHeight:1, margin:0, letterSpacing:'-.03em' }}>{value}</p>
                <div style={{ width:24, height:2.5, borderRadius:2, background:color, opacity:.3, margin:'10px 0 8px' }} />
                <p style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.12em', margin:0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â• DOMAIN BADGES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="e2e" style={{ background:'#F8FAFC', paddingTop:48, paddingBottom:0 }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <p style={{ fontSize:11, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.2em', margin:0 }}>Domains Covered in This Program</p>
          </div>
          <div className="e2e-domain-grid" style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:12 }}>
            {DOMAINS.map(({ label, color, bg, border }) => (
              <div key={label} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <span style={{ fontSize:12, fontWeight:700, color }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â• FEATURES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="e2e" style={{ background:'#fff', padding:'96px 0 104px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">

          {/* Section header split layout */}
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 400px', gap:48, alignItems:'center', marginBottom:72 }}>
            <div>
              <div className="e2e-tag" style={{ background:'linear-gradient(135deg,rgba(220,38,38,.1),rgba(234,88,12,.08))', border:'1px solid rgba(220,38,38,.25)', color:'#DC2626', marginBottom:20, display:'inline-flex' }}>
                <Sparkles style={{ width:11, height:11 }} />
                What You Will Learn
              </div>
              <h2 style={{ fontSize:'clamp(30px,3.4vw,50px)', fontWeight:900, color:'#0F172A', lineHeight:1.06, letterSpacing:'-.045em', margin:'0 0 20px' }}>
                12 weeks.{' '}
                <span style={{ background:'linear-gradient(120deg,#DC2626 0%,#EA580C 45%,#D97706 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Every skill.
                </span>
                <br />Every domain.
              </h2>
              <p style={{ fontSize:16, color:'#64748B', lineHeight:1.85, maxWidth:500, margin:0 }}>
                Built around the actual workflows of top recruitment professionals in India&apos;s biggest companies not theory, but live hiring practice from day one.
              </p>
            </div>
            {/* Right: outcome stats */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { num:'12',    label:'Structured weekly modules',    color:'#DC2626', bg:'#FEF2F2', border:'#FECACA' },
                { num:'8',     label:'Industry domains covered',     color:'#EA580C', bg:'#FFF7ED', border:'#FED7AA' },
                { num:'5K+',   label:'Professionals trained',        color:'#16A34A', bg:'#F0FDF4', border:'#BBF7D0' },
                { num:'100%',  label:'Practical project-based work', color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE' },
              ].map(({ num, label, color, bg, border }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:18, background:'#F8FAFC', border:`1.5px solid ${border}`, borderRadius:14, padding:'14px 20px', transition:'transform .2s,box-shadow .2s' }}

>
                  <div style={{ width:52, height:52, borderRadius:12, background:bg, border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:18, fontWeight:900, color, letterSpacing:'-.03em', lineHeight:1 }}>{num}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'#334155', lineHeight:1.4 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards 3-column premium grid */}
          {(() => {
            const FEAT_PALETTE = [
              { color:'#DC2626', light:'#FEF2F2', border:'#FECACA', glow:'rgba(220,38,38,.14)', num:'01', grad:'linear-gradient(135deg,#DC2626,#EF4444)' },
              { color:'#EA580C', light:'#FFF7ED', border:'#FED7AA', glow:'rgba(234,88,12,.14)',  num:'02', grad:'linear-gradient(135deg,#EA580C,#F97316)' },
              { color:'#D97706', light:'#FFFBEB', border:'#FDE68A', glow:'rgba(217,119,6,.14)',  num:'03', grad:'linear-gradient(135deg,#D97706,#F59E0B)' },
              { color:'#16A34A', light:'#F0FDF4', border:'#BBF7D0', glow:'rgba(22,163,74,.14)',  num:'04', grad:'linear-gradient(135deg,#16A34A,#22C55E)' },
              { color:'#2563EB', light:'#EFF6FF', border:'#BFDBFE', glow:'rgba(37,99,235,.14)',  num:'05', grad:'linear-gradient(135deg,#2563EB,#3B82F6)' },
              { color:'#7C3AED', light:'#F5F3FF', border:'#DDD6FE', glow:'rgba(124,58,237,.14)', num:'06', grad:'linear-gradient(135deg,#7C3AED,#8B5CF6)' },
            ]
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
                {FEATURES.map(({ icon: Icon, title, desc }, i) => {
                  const p = FEAT_PALETTE[i % FEAT_PALETTE.length]
                  return (
                    <div key={title} style={{ position:'relative', background:'#fff', borderRadius:22, border:`1.5px solid ${p.border}`, padding:'0', overflow:'hidden', transition:'transform .3s,box-shadow .3s', boxShadow:'0 2px 18px rgba(15,23,42,.06)' }}

>
                      {/* Gradient top strip */}
                      <div style={{ height:4, background:p.grad }} />
                      <div style={{ padding:'30px 28px 28px', position:'relative' }}>
                        {/* Large watermark number */}
                        <div aria-hidden style={{ position:'absolute', top:10, right:20, fontSize:88, fontWeight:900, color:p.color, opacity:.045, lineHeight:1, userSelect:'none', letterSpacing:'-.04em', pointerEvents:'none' }}>{p.num}</div>
                        {/* Icon container */}
                        <div style={{ width:56, height:56, borderRadius:16, background:p.light, border:`1.5px solid ${p.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, position:'relative', zIndex:1, boxShadow:`0 4px 14px ${p.glow}` }}>
                          <Icon style={{ width:26, height:26, color:p.color }} />
                        </div>
                        {/* Number tag */}
                        <span style={{ display:'inline-block', fontSize:10, fontWeight:800, color:p.color, textTransform:'uppercase', letterSpacing:'.22em', marginBottom:10, opacity:.75, position:'relative', zIndex:1 }}>{p.num}</span>
                        <h3 style={{ fontSize:16, fontWeight:800, color:'#0F172A', lineHeight:1.26, margin:'0 0 12px', position:'relative', zIndex:1 }}>{title}</h3>
                        <p style={{ fontSize:13, color:'#64748B', lineHeight:1.84, margin:'0 0 20px', position:'relative', zIndex:1 }}>{desc}</p>
                        {/* Bottom learn-more link */}
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
                          <span style={{ fontSize:12, fontWeight:700, color:p.color }}>Covered in syllabus</span>
                          <ArrowRight style={{ width:13, height:13, color:p.color }} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Bottom highlight bar */}
          <div style={{ marginTop:52, borderRadius:20, background:'linear-gradient(135deg,#0A0612,#12081A)', border:'1px solid rgba(255,255,255,.07)', padding:'32px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
            <div aria-hidden style={{ position:'absolute', top:-40, left:-20, width:220, height:220, background:'radial-gradient(circle,rgba(220,38,38,.18) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, position:'absolute', top:0, left:0, right:0, background:'linear-gradient(90deg,#DC2626,#EA580C,#D97706)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:18, position:'relative', zIndex:1 }}>
              <div style={{ width:50, height:50, borderRadius:14, background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Award style={{ width:24, height:24, color:'#F87171' }} />
              </div>
              <div>
                <p style={{ fontSize:16, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>Industry-Recognised on Completion</p>
                <p style={{ fontSize:13, color:'#64748B', margin:0 }}>Your certificate is trusted by 200+ hiring companies across India shareable on LinkedIn instantly.</p>
              </div>
            </div>
            <button onClick={() => setEnquiryOpen(true)} style={{ display:'inline-flex', alignItems:'center', gap:9, background:'linear-gradient(135deg,#B91C1C,#DC2626)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px 30px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(185,28,28,.38)', whiteSpace:'nowrap', flexShrink:0, position:'relative', zIndex:1, transition:'transform .2s,box-shadow .2s' }}

>
              Enrol in This Program <ArrowRight style={{ width:15, height:15 }} />
            </button>
          </div>
        </div>
      </section>

      {/* â•â• TABS + SIDEBAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="syllabus-section" className="e2e" style={{ background:'#fff', padding:'80px 0 96px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">
          <div className="e2e-content-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 360px', gap:36, alignItems:'start' }}>

            {/* Left */}
            <div>
              {/* Tab bar */}
              <div style={{ display:'flex', gap:6, marginBottom:32, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:14, padding:'6px', width:'fit-content', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
                {[
                  { id:'overview',   label:'Overview',  icon:<BookOpen style={{ width:14, height:14 }} /> },
                  { id:'curriculum', label:'Syllabus',   icon:<CheckCircle2 style={{ width:14, height:14 }} /> },
                  { id:'faqs',       label:'FAQs',       icon:<MessageSquare style={{ width:14, height:14 }} /> },
                ].map(tab => (
                  <button key={tab.id} className={`e2e-tab${activeTab===tab.id?' active':''}`} onClick={() => setActiveTab(tab.id as typeof activeTab)}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* â"€â"€ Overview â"€â"€ */}
              {activeTab==='overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  {/* Target audience */}
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'32px 36px' }}>
                    <div className="e2e-tag" style={{ background:'rgba(252,165,165,.14)', border:'1px solid rgba(252,165,165,.3)', color:'#FCA5A5', marginBottom:20, display:'inline-flex' }}>
                      <Users style={{ width:11, height:11 }} />
                      Who Is This For?
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {[
                        'HR professionals enhancing recruitment expertise',
                        'Active recruiters seeking advanced knowledge',
                        'Recent graduates entering the hiring field',
                        'Working professionals switching to recruitment',
                        'Talent acquisition specialists across all sectors',
                        'Anyone aiming to master full-cycle recruiting',
                      ].map(item => (
                        <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,.05)', borderRadius:12, padding:'14px 16px', border:'1px solid rgba(255,255,255,.08)' }}>
                          <CheckCircle2 style={{ width:14, height:14, color:'#F87171', flexShrink:0, marginTop:1 }} />
                          <span style={{ fontSize:13, color:'#CBD5E1', lineHeight:1.55, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div style={{ background:'#FFF8F8', borderRadius:22, border:'1.5px solid #FECACA', padding:'28px 32px', display:'flex', alignItems:'flex-start', gap:18 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#FEF2F2', border:'1.5px solid #FECACA', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Shield style={{ width:22, height:22, color:'#DC2626' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize:15, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>Prerequisites & Requirements</h4>
                      <p style={{ fontSize:14, color:'#64748B', lineHeight:1.8, margin:0 }}>No prior recruitment experience is required. A basic understanding of HR concepts is beneficial but not mandatory. You need access to a computer and the internet, and a willingness to engage in practical projects and live sessions.</p>
                    </div>
                  </div>

                  {/* What's included */}
                  <div style={{ background:'#F8FAFC', borderRadius:22, border:'1.5px solid #E2E8F0', padding:'32px 36px' }}>
                    <div className="e2e-tag" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#059669', marginBottom:20, display:'inline-flex' }}>
                      <GraduationCap style={{ width:11, height:11 }} />
                      Course Materials Included
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {[
                        'Comprehensive lecture notes and course resources',
                        'Resume, JD, and interview question templates',
                        'Access to recruitment tools and ATS software',
                        'Case studies and real-world hiring examples',
                        'Interactive webinars with industry experts',
                        'Industry-recognised certificate of completion',
                      ].map(item => (
                        <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                          <div style={{ width:20, height:20, borderRadius:'50%', background:'#DCFCE7', border:'1.5px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                            <CheckCircle2 style={{ width:11, height:11, color:'#059669' }} />
                          </div>
                          <span style={{ fontSize:13, color:'#334155', lineHeight:1.6, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* â"€â"€ Curriculum â"€â"€ */}
              {activeTab==='curriculum' && (
                <div>
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Detailed Course Modules</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>{CURRICULUM.length} modules click to expand each topic</p>
                  </div>
                  {CURRICULUM.map((mod, i) => {
                    const isOpen = expandedModule === i
                    return (
                      <div key={i} className={`e2e-mod${isOpen?' open':''}`}>
                        <button className="e2e-mod-btn" onClick={() => setExpandedModule(isOpen ? null : i)}>
                          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:isOpen ? mod.accent : '#FEF2F2', border:`1.5px solid ${isOpen ? mod.accent : '#FECACA'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                              <span style={{ fontSize:13, fontWeight:800, color:isOpen?'#fff':'#DC2626' }}>{i+1}</span>
                            </div>
                            <div>
                              <p style={{ fontSize:10, fontWeight:800, color:mod.accent, textTransform:'uppercase', letterSpacing:'.12em', margin:'0 0 2px' }}>{mod.week}</p>
                              <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0, lineHeight:1.3 }}>{mod.title}</p>
                            </div>
                          </div>
                          <div style={{ width:28, height:28, borderRadius:8, background:isOpen?'#FEF2F2':'#F8FAFC', border:`1px solid ${isOpen?'#FECACA':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {isOpen ? <ChevronUp style={{ width:14, height:14, color:'#DC2626' }} /> : <ChevronDown style={{ width:14, height:14, color:'#94A3B8' }} />}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'0 24px 22px', borderTop:`2px solid ${mod.accent}22` }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', margin:'16px 0 12px' }}>Topics covered in this module:</p>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                              {mod.details.map(d => (
                                <div key={d} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                                  <div style={{ width:6, height:6, borderRadius:'50%', background:mod.accent, flexShrink:0, marginTop:5 }} />
                                  <span style={{ fontSize:13, color:'#475569', lineHeight:1.55 }}>{d}</span>
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
              {activeTab==='faqs' && (
                <div>
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Frequently Asked Questions</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>Everything you need to know before enrolling</p>
                  </div>
                  {FAQS.map((faq, i) => {
                    const isOpen = expandedFaq === i
                    return (
                      <div key={i} className={`e2e-faq${isOpen?' open':''}`}>
                        <button className="e2e-faq-btn" onClick={() => setExpandedFaq(isOpen ? null : i)}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#0F172A', paddingRight:16, lineHeight:1.4 }}>{faq.q}</span>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:isOpen?'#DC2626':'#F1F5F9', border:`1px solid ${isOpen?'#DC2626':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                            {isOpen ? <ChevronUp style={{ width:13, height:13, color:'#fff' }} /> : <ChevronDown style={{ width:13, height:13, color:'#64748B' }} />}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'4px 22px 20px', borderTop:'1px solid #FEE2E2' }}>
                            <p style={{ fontSize:14, color:'#64748B', lineHeight:1.82, margin:'12px 0 0' }}>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* â"€â"€ Sidebar â"€â"€ */}
            <aside className="e2e-sidebar">
              <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', padding:'24px 24px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:4 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🎯</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3, margin:0 }}>Complete Recruitment Mastery</p>
                    <p style={{ fontSize:11, color:'#64748B', margin:'3px 0 0' }}>Recruitment Institute Certification</p>
                  </div>
                </div>
              </div>

              <div>
                {[
                  { label:'Duration',      value:'3 Months' },
                  { label:'Learning Mode', value:'Online / Offline' },
                  { label:'Course Level',  value:'All Levels' },
                  { label:'Certification', value:'Industry Verified' },
                  { label:'Support',       value:'Mock Interviews & JDs' },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderBottom:i<arr.length-1?'1px solid #F1F5F9':'none' }}>
                    <span style={{ fontSize:12, color:'#94A3B8', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding:'20px 22px', borderTop:'1px solid #F1F5F9', display:'flex', flexDirection:'column', gap:10 }}>
                <button onClick={() => setEnquiryOpen(true)}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#B91C1C,#DC2626)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 8px 20px rgba(185,28,28,.3)', transition:'transform .2s' }}

>
                  Enquire About Batches <ArrowRight style={{ width:15, height:15 }} />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer"
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#059669,#0D9488)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, textDecoration:'none', boxShadow:'0 4px 14px rgba(5,150,105,.25)', transition:'transform .2s' }}

>
                  <MessageSquare style={{ width:15, height:15 }} />WhatsApp Admissions
                </a>
              </div>

              <div style={{ padding:'13px 22px', borderTop:'1px solid #F8FAFC', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <BadgeCheck style={{ width:15, height:15, color:'#10B981' }} />
                <p style={{ fontSize:11, color:'#64748B', fontWeight:600, margin:0 }}>100% practical training • Certificate on completion</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CareerSupportSection />
      <PlacementProjectsSection />

      {/* â•â• BOTTOM CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="e2e" style={{ background:'#F8FAFC', padding:'0 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius:24, background:'linear-gradient(130deg,#0A0612 0%,#120818 50%,#0D0615 100%)', border:'1px solid rgba(255,255,255,.07)', overflow:'hidden', position:'relative' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
            <div aria-hidden style={{ position:'absolute', top:-60, right:-40, width:380, height:380, background:'radial-gradient(circle,rgba(220,38,38,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ position:'absolute', bottom:-40, left:'30%', width:280, height:280, background:'radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, background:'linear-gradient(90deg,#DC2626,#EA580C,#D97706)' }} />
            <div style={{ padding:'60px 56px', position:'relative', zIndex:10, textAlign:'center' }}>
              <div className="e2e-tag" style={{ background:'rgba(220,38,38,.12)', border:'1px solid rgba(220,38,38,.28)', color:'#FCA5A5', marginBottom:22, display:'inline-flex' }}>
                <Zap style={{ width:11, height:11 }} />
                New Batch Forming
              </div>
              <h2 style={{ fontSize:'clamp(26px,3vw,44px)', fontWeight:900, color:'#fff', lineHeight:1.12, letterSpacing:'-.03em', marginBottom:18 }}>
                Ready to become a<br />full-cycle recruitment expert?
              </h2>
              <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.82, maxWidth:520, margin:'0 auto 36px' }}>
                Join 5,000+ trained professionals across IT, BFSI, Pharma, and every major industry. One program. All domains. Career-ready outcomes.
              </p>
              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
                <button onClick={() => setEnquiryOpen(true)} className="e2e-cta">
                  Enrol Now <ArrowRight style={{ width:16, height:16 }} />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="e2e-cta-ghost">
                  <MessageSquare style={{ width:15, height:15 }} /> WhatsApp Us
                </a>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:22, flexWrap:'wrap' }}>
                {['No prior experience needed','Industry certificate','Placement support'].map(t => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CheckCircle2 style={{ width:13, height:13, color:'#F87171' }} />
                    <span style={{ fontSize:12, fontWeight:600, color:'#64748B' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}
