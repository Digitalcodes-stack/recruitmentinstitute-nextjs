'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, BadgeCheck, BookOpen, CheckCircle2, ChevronDown,
  ChevronRight, ChevronUp, GraduationCap, MessageSquare, Shield,
  Sparkles, Star, Users, Zap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import CareerSupportSection from '@/components/home/CareerSupportSection'
import PlacementProjectsSection from '@/components/home/PlacementProjectsSection'

/* â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

const FEATURES = [
  { title: 'Fundamental Recruitment Concepts',    desc: 'Understand the full hiring lifecycle, key terminology, and the role of a recruiter from day one.' },
  { title: 'Sourcing & Attracting Candidates',    desc: 'Learn where and how to find quality candidates using job boards, LinkedIn, and social media.' },
  { title: 'Screening & Interviewing Methods',    desc: 'Master initial resume screening, telephonic checks, and structured interview techniques.' },
  { title: 'Job Offers & Onboarding',             desc: 'Draft compelling offers, handle negotiations, and onboard new hires into company culture smoothly.' },
  { title: 'HR Tools & ATS Basics',               desc: 'Get hands-on with Applicant Tracking Systems, Excel trackers, and candidate database management.' },
  { title: 'Career Guidance & Placement Support', desc: 'Resume prep, mock interview practice, and direct placement registration with our partner network.' },
]

const CURRICULUM = [
  {
    week: 'Module 1',
    title: 'Introduction to Recruitment',
    accent: '#0EA5E9',
    details: [
      'Definition and purpose of recruitment',
      'The role of recruitment in organisational success',
      'Overview of the end-to-end recruitment process',
      'Common recruitment terms, jargon, and job specifications',
      'Differentiating between recruitment and selection',
      'Current trends and challenges in hiring',
    ],
  },
  {
    week: 'Module 2',
    title: 'Sourcing Candidates',
    accent: '#8B5CF6',
    details: [
      'Identifying where to find potential candidates',
      'Strategies for attracting quality candidates',
      'Importance of a strong employer brand',
      'Using job boards (Naukri, Indeed) effectively',
      'Leveraging LinkedIn, Facebook, and Twitter for hiring',
      'Tips for engaging with candidates online',
    ],
  },
  {
    week: 'Module 3',
    title: 'Screening and Interviewing',
    accent: '#059669',
    details: [
      'Methods for initial resume and application screening',
      'Identifying key qualifications and red flags',
      'Tools and software for efficient screening',
      'Preparing for and structuring interviews',
      'Different types of interview questions and their purposes',
      'Techniques for evaluating candidates\' responses',
    ],
  },
  {
    week: 'Module 4',
    title: 'Job Offers and Onboarding',
    accent: '#D97706',
    details: [
      'Components of a job offer salary, benefits, start date',
      'Communicating job offers effectively',
      'Handling negotiations and counteroffers',
      'Importance of a structured onboarding process',
      'Steps to successfully onboard new hires',
      'Integrating new employees into company culture',
    ],
  },
]

const FAQS = [
  { q: 'Do I need any prior knowledge to take this course?', a: 'No prior recruitment experience is required. This course is specifically designed for complete beginners and starts from the absolute basics of the recruitment process.' },
  { q: 'How long will it take to complete the course?', a: 'The course is a 4-week program with flexible online learning options so you can study at your own pace alongside your existing schedule.' },
  { q: 'Will I receive a certificate upon completion?', a: 'Yes, you will receive an industry-recognised certificate of completion from Recruitment Institute upon successfully completing all modules and assignments.' },
  { q: 'Is this course available online?', a: 'Yes, the course is entirely online with flexible learning options video lectures, reading materials, and practical assignments accessible anytime.' },
  { q: 'What resources are provided?', a: 'Detailed course materials, lecture notes, templates for job descriptions, interview questions, and offer letters, plus access to recruitment tools and interactive webinar sessions with experienced recruiters.' },
  { q: 'Are there interactive elements?', a: 'Yes, the course includes live Q&A sessions and discussion forums where you can interact with instructors and fellow learners.' },
  { q: 'Can I get a job in recruitment after this course?', a: 'Absolutely. The course provides a solid foundation for entry-level recruitment positions. We offer placement support including resume review and mock interviews to help you land your first role.' },
]

const STATS = [
  { value: '4 Wk',  label: 'Program Duration',  color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD' },
  { value: '4',     label: 'Core Modules',       color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  { value: '0',     label: 'Prerequisites',      color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  { value: '100%',  label: 'Online & Flexible',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
]

/* â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

export default function HRBeginnerPage() {
  const [enquiryOpen, setEnquiryOpen]       = useState(false)
  const [activeTab, setActiveTab]           = useState<'overview' | 'curriculum' | 'faqs'>('overview')
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [expandedFaq, setExpandedFaq]       = useState<number | null>(null)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'Learning Recruitment for Beginners',
        description: 'An introductory 4-week online course providing newcomers to recruitment with a solid foundation in sourcing, screening, interviewing, and onboarding.',
        url: 'https://recruitmentinstitute.in/hr-courses-for-beginners',
        provider: { '@type': 'Organization', name: 'Recruitment Institute', url: 'https://recruitmentinstitute.in' },
        educationalLevel: 'Beginner', timeRequired: 'P4W', inLanguage: 'en-IN',
        courseMode: ['online'],
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
      }) }} />

      <style>{`
        .beg { font-family: 'Poppins', sans-serif; }
        .beg-hero {
          background: linear-gradient(135deg, #06101E 0%, #0A1828 38%, #0C1F35 68%, #071320 100%);
          position: relative; overflow: hidden; min-height: 640px; display: flex; align-items: center;
        }
        .beg-hero::before { content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,.027) 1px,transparent 1px); background-size:30px 30px; }
        .beg-tag { display:inline-flex; align-items:center; gap:7px; padding:6px 16px; border-radius:50px; font-size:11px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
        .beg-pill { display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:50px; font-size:12px; font-weight:600; }
        .beg-cta { display:inline-flex; align-items:center; gap:9px; background:linear-gradient(135deg,#0369A1,#0EA5E9); color:#fff; font-weight:700; font-size:15px; padding:15px 34px; border-radius:12px; border:none; cursor:pointer; text-decoration:none; box-shadow:0 8px 28px rgba(3,105,161,.45); transition:transform .2s,box-shadow .2s; }
        .beg-cta:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(3,105,161,.55); }
        .beg-cta-ghost { display:inline-flex; align-items:center; gap:9px; border:1.5px solid rgba(255,255,255,.18); color:#fff; font-weight:600; font-size:14px; padding:14px 28px; border-radius:12px; text-decoration:none; background:rgba(255,255,255,.06); transition:background .2s,border-color .2s; }
        .beg-cta-ghost:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.3); }
        .beg-feat { background:#fff; border-radius:18px; border:1.5px solid #E2E8F0; padding:28px 24px; transition:transform .28s,box-shadow .28s,border-color .28s; position:relative; overflow:hidden; }
        .beg-feat::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#0369A1,#0EA5E9); opacity:0; transition:opacity .28s; }
        .beg-feat:hover { transform:translateY(-6px); box-shadow:0 22px 50px rgba(15,23,42,.11); border-color:#BAE6FD; }
        .beg-feat:hover::after { opacity:1; }
        .beg-mod { border-radius:16px; overflow:hidden; border:1.5px solid #E2E8F0; background:#fff; transition:border-color .2s,box-shadow .2s; margin-bottom:12px; }
        .beg-mod.open { border-color:#BAE6FD; box-shadow:0 8px 28px rgba(14,165,233,.1); }
        .beg-mod-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background .18s; }
        .beg-mod-btn:hover { background:#F0F9FF; }
        .beg-faq { border-radius:14px; overflow:hidden; border:1.5px solid #E2E8F0; background:#fff; transition:border-color .2s,box-shadow .2s; margin-bottom:10px; }
        .beg-faq.open { border-color:#BAE6FD; box-shadow:0 6px 20px rgba(14,165,233,.08); }
        .beg-faq-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:18px 22px; background:transparent; border:none; cursor:pointer; text-align:left; }
        .beg-tab { display:flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:all .2s; }
        .beg-tab.active { background:linear-gradient(135deg,#0369A1,#0EA5E9); color:#fff; box-shadow:0 4px 14px rgba(3,105,161,.3); }
        .beg-tab:not(.active) { background:transparent; color:#64748B; }
        .beg-tab:not(.active):hover { color:#0EA5E9; background:#F0F9FF; }
        .beg-sidebar { background:#fff; border-radius:22px; border:1.5px solid #E2E8F0; box-shadow:0 20px 60px rgba(15,23,42,.1); overflow:hidden; position:sticky; top:100px; }
        @media(max-width:1100px){.beg-hero-grid{grid-template-columns:1fr !important;}.beg-hero-right{display:none !important;}}
        @media(max-width:1024px){.beg-content-grid{grid-template-columns:1fr !important;}.beg-sidebar{position:static !important;}}
        @media(max-width:860px){.beg-feat-grid,.beg-stats-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:560px){.beg-feat-grid{grid-template-columns:1fr !important;}.beg-cta-row{flex-direction:column !important;}}
      `}</style>

      {/* â•â• HERO â•â• */}
      <section className="beg beg-hero">
        <div aria-hidden style={{ position:'absolute', top:-160, left:-80, width:640, height:640, background:'radial-gradient(circle,rgba(14,165,233,.18) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', bottom:-60, right:'18%', width:440, height:440, background:'radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#0EA5E9 28%,#8B5CF6 72%,transparent)', zIndex:3 }} />

        <div className="container beg" style={{ position:'relative', zIndex:10, padding:'80px 0 96px' }}>
          <div className="beg-hero-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 490px', gap:'72px', alignItems:'center' }}>
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28 }}>
                <Link href="/" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Home</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <Link href="/courses" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Courses</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <span style={{ fontSize:12, fontWeight:600, color:'#7DD3FC' }}>HR Courses for Beginners</span>
              </nav>

              <div className="beg-tag" style={{ background:'rgba(14,165,233,.12)', border:'1px solid rgba(14,165,233,.3)', color:'#7DD3FC', marginBottom:24 }}>
                <GraduationCap style={{ width:12, height:12 }} />
                HR Courses for Beginners
              </div>

              <h1 style={{ fontSize:'clamp(32px,4vw,58px)', fontWeight:900, color:'#fff', lineHeight:1.07, letterSpacing:'-.04em', marginBottom:22 }}>
                Become A{' '}
                <span style={{ background:'linear-gradient(120deg,#7DD3FC 0%,#A78BFA 55%,#6EE7B7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Recruitment Expert
                </span>
                <br />"" Starting from Zero
              </h1>

              <p style={{ fontSize:17, color:'#94A3B8', lineHeight:1.82, maxWidth:520, marginBottom:36 }}>
                An introductory course designed to give newcomers a solid foundation in recruitment. No experience needed just the drive to build a career in HR.
              </p>

              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:42 }}>
                {[
                  { text:'4-Week Program',      color:'#7DD3FC', bg:'rgba(125,211,252,.09)', border:'rgba(125,211,252,.22)' },
                  { text:'100% Online',         color:'#A78BFA', bg:'rgba(167,139,250,.09)', border:'rgba(167,139,250,.22)' },
                  { text:'Beginner Level',      color:'#6EE7B7', bg:'rgba(110,231,183,.09)', border:'rgba(110,231,183,.22)' },
                  { text:'No Prerequisites',    color:'#FCD34D', bg:'rgba(252,211,77,.09)',  border:'rgba(252,211,77,.22)'  },
                ].map(({ text, color, bg, border }) => (
                  <span key={text} className="beg-pill" style={{ background:bg, border:`1px solid ${border}`, color }}>
                    <CheckCircle2 style={{ width:12, height:12 }} />{text}
                  </span>
                ))}
              </div>

              <div className="beg-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)} className="beg-cta">
                  Enquire Now <ArrowRight style={{ width:16, height:16 }} />
                </button>
                <Link href="/contact" className="beg-cta-ghost">Request Call Back</Link>
              </div>
            </div>

            <div className="beg-hero-right" style={{ position:'relative' }}>
              <div aria-hidden style={{ position:'absolute', inset:-20, borderRadius:32, background:'linear-gradient(135deg,rgba(14,165,233,.22),rgba(139,92,246,.15),rgba(16,185,129,.1))', filter:'blur(2px)' }} />
              <div style={{ position:'relative', borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,.1)', boxShadow:'0 48px 110px rgba(0,0,0,.65)' }}>
                <div style={{ position:'relative', height:340, background:'#060F1C' }}>
                  <Image src="/assets/images/courses/main-home/2.jpg"
                    alt="HR Courses for Beginners Learn recruitment from scratch"
                    fill priority sizes="490px" style={{ objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(6,15,28,.1) 0%,transparent 40%,rgba(4,10,20,.92) 100%)' }} />
                  <div style={{ position:'absolute', top:18, left:18, display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:50, background:'rgba(14,165,233,.18)', border:'1px solid rgba(14,165,233,.42)', backdropFilter:'blur(12px)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#38BDF8', boxShadow:'0 0 8px #38BDF8', display:'block' }} />
                    <span style={{ fontSize:10, fontWeight:800, color:'#7DD3FC', letterSpacing:'.12em', textTransform:'uppercase' }}>Beginner Friendly</span>
                  </div>
                  <div style={{ position:'absolute', top:18, right:18, display:'inline-flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:50, background:'rgba(255,255,255,.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.22)' }}>
                    <Star style={{ width:12, height:12, color:'#FBBF24', fill:'#FBBF24' }} />
                    <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>4-Week Cert</span>
                  </div>
                </div>
                <div style={{ background:'#060D1C', padding:'22px 26px 24px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'#38BDF8', textTransform:'uppercase', letterSpacing:'.2em', margin:'0 0 16px' }}>Program at a Glance</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {[{val:'4 Wk',lbl:'Duration',color:'#7DD3FC'},{val:'4',lbl:'Modules',color:'#A78BFA'},{val:'0',lbl:'Prereqs',color:'#6EE7B7'}].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22, fontWeight:900, color, lineHeight:1, margin:'0 0 4px', letterSpacing:'-.03em' }}>{val}</p>
                        <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', margin:0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:'#040B17', padding:'14px 26px', borderTop:'1px solid rgba(255,255,255,.05)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #040B17', overflow:'hidden', marginLeft:i>1?-8:0, position:'relative', flexShrink:0 }}>
                        <Image src={`/assets/images/team/style${i<=2?1:2}/${i<=2?i:i-2}.jpg`} alt="" fill sizes="28px" style={{ objectFit:'cover' }} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize:12, color:'#64748B', fontWeight:500 }}>Perfect starting point for <strong style={{ color:'#7DD3FC' }}>freshers & career switchers</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:54, background:'#F8FAFC', clipPath:'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* â•â• STATS â•â• */}
      <section className="beg" style={{ background:'#F8FAFC', paddingTop:64 }}>
        <div className="container">
          <div className="beg-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
            {STATS.map(({ value, label, color, bg, border }) => (
              <div key={label} style={{ background:'#fff', borderRadius:16, border:'1.5px solid #E2E8F0', padding:'26px 22px', boxShadow:'0 2px 14px rgba(15,23,42,.06)', display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
                <p style={{ fontSize:'clamp(28px,2.5vw,38px)', fontWeight:900, color, lineHeight:1, margin:0, letterSpacing:'-.03em' }}>{value}</p>
                <div style={{ width:24, height:2.5, borderRadius:2, background:color, opacity:.3, margin:'10px 0 8px' }} />
                <p style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.12em', margin:0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â• FEATURES â•â• */}
      <section className="beg" style={{ background:'#fff', padding:'88px 0 96px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">
          {/* Section header */}
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', alignItems:'flex-end', gap:24, marginBottom:60 }}>
            <div>
              <div className="beg-tag" style={{ background:'linear-gradient(135deg,rgba(14,165,233,.1),rgba(139,92,246,.1))', border:'1px solid rgba(14,165,233,.25)', color:'#0EA5E9', marginBottom:20, display:'inline-flex' }}>
                <Sparkles style={{ width:11, height:11 }} />
                What You Will Learn
              </div>
              <h2 style={{ fontSize:'clamp(28px,3.2vw,46px)', fontWeight:900, color:'#0F172A', lineHeight:1.08, letterSpacing:'-.04em', margin:'0 0 18px' }}>
                4 weeks.{' '}
                <span style={{ background:'linear-gradient(120deg,#0EA5E9 0%,#8B5CF6 55%,#06B6D4 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  All the fundamentals.
                </span>
                <br />Zero fluff.
              </h2>
              <p style={{ fontSize:16, color:'#64748B', lineHeight:1.82, maxWidth:540, margin:0 }}>
                Built specifically for beginners practical, structured, and career-ready from week one. Every topic maps directly to real-world hiring tasks.
              </p>
            </div>
            <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:10, alignItems:'flex-end' }}>
              {[{val:'6',lbl:'Skills covered'},{val:'4',lbl:'Core modules'},{val:'100%',lbl:'Job-ready content'}].map(({val,lbl})=>(
                <div key={lbl} style={{ display:'flex', alignItems:'center', gap:12, background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:12, padding:'10px 18px', minWidth:200 }}>
                  <span style={{ fontSize:22, fontWeight:900, color:'#0EA5E9', letterSpacing:'-.03em', lineHeight:1 }}>{val}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'.1em' }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards alternating accent colours */}
          {(() => {
            const FEAT_ACCENTS = [
              { color:'#0EA5E9', light:'#F0F9FF', border:'#BAE6FD', glow:'rgba(14,165,233,.15)', num:'01' },
              { color:'#8B5CF6', light:'#F5F3FF', border:'#DDD6FE', glow:'rgba(139,92,246,.15)', num:'02' },
              { color:'#059669', light:'#F0FDF4', border:'#BBF7D0', glow:'rgba(5,150,105,.15)',   num:'03' },
              { color:'#D97706', light:'#FFFBEB', border:'#FDE68A', glow:'rgba(217,119,6,.15)',   num:'04' },
              { color:'#DC2626', light:'#FEF2F2', border:'#FECACA', glow:'rgba(220,38,38,.15)',   num:'05' },
              { color:'#0D9488', light:'#F0FDFA', border:'#99F6E4', glow:'rgba(13,148,136,.15)',  num:'06' },
            ]
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
                {FEATURES.map(({ title, desc }, i) => {
                  const a = FEAT_ACCENTS[i % FEAT_ACCENTS.length]
                  return (
                    <div key={title} style={{ position:'relative', background:'#fff', borderRadius:20, border:`1.5px solid ${a.border}`, padding:'32px 28px 28px', overflow:'hidden', transition:'transform .28s,box-shadow .28s', boxShadow:'0 2px 16px rgba(15,23,42,.06)' }}

>
                      {/* Background number watermark */}
                      <div aria-hidden style={{ position:'absolute', top:-10, right:16, fontSize:96, fontWeight:900, color:a.color, opacity:.045, lineHeight:1, userSelect:'none', letterSpacing:'-.04em' }}>{a.num}</div>
                      {/* Top accent bar */}
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${a.color},${a.color}88)` }} />
                      {/* Icon circle */}
                      <div style={{ width:48, height:48, borderRadius:14, background:a.light, border:`1.5px solid ${a.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, position:'relative', zIndex:1 }}>
                        <CheckCircle2 style={{ width:22, height:22, color:a.color }} />
                      </div>
                      {/* Number label */}
                      <span style={{ display:'inline-block', fontSize:10, fontWeight:800, color:a.color, textTransform:'uppercase', letterSpacing:'.2em', marginBottom:10, opacity:.7, position:'relative', zIndex:1 }}>{a.num}</span>
                      <h3 style={{ fontSize:15, fontWeight:800, color:'#0F172A', lineHeight:1.28, margin:'0 0 12px', position:'relative', zIndex:1 }}>{title}</h3>
                      <p style={{ fontSize:13, color:'#64748B', lineHeight:1.82, margin:0, position:'relative', zIndex:1 }}>{desc}</p>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Bottom CTA strip */}
          <div style={{ marginTop:48, borderRadius:18, background:'linear-gradient(135deg,#06101E,#0A1828)', border:'1px solid rgba(255,255,255,.07)', padding:'28px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(14,165,233,.15)', border:'1px solid rgba(14,165,233,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <GraduationCap style={{ width:22, height:22, color:'#38BDF8' }} />
              </div>
              <div>
                <p style={{ fontSize:15, fontWeight:800, color:'#fff', margin:'0 0 3px' }}>Ready to start learning?</p>
                <p style={{ fontSize:13, color:'#64748B', margin:0 }}>Join 500+ beginners who launched their recruitment career with this course.</p>
              </div>
            </div>
            <button onClick={() => setEnquiryOpen(true)} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#0369A1,#0EA5E9)', color:'#fff', fontWeight:700, fontSize:14, padding:'13px 28px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(3,105,161,.35)', whiteSpace:'nowrap', flexShrink:0 }}>
              Enrol Now <ArrowRight style={{ width:15, height:15 }} />
            </button>
          </div>
        </div>
      </section>

      {/* â•â• TABS + SIDEBAR â•â• */}
      <section className="beg" style={{ background:'#fff', padding:'80px 0 96px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">
          <div className="beg-content-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 360px', gap:36, alignItems:'start' }}>
            <div>
              <div style={{ display:'flex', gap:6, marginBottom:32, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:14, padding:'6px', width:'fit-content', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
                {[{id:'overview',label:'Overview',icon:<BookOpen style={{width:14,height:14}}/>},{id:'curriculum',label:'Syllabus',icon:<CheckCircle2 style={{width:14,height:14}}/>},{id:'faqs',label:'FAQs',icon:<MessageSquare style={{width:14,height:14}}/>}].map(tab=>(
                  <button key={tab.id} className={`beg-tab${activeTab===tab.id?' active':''}`} onClick={()=>setActiveTab(tab.id as typeof activeTab)}>{tab.icon}{tab.label}</button>
                ))}
              </div>

              {activeTab==='overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'32px 36px' }}>
                    <div className="beg-tag" style={{ background:'rgba(125,211,252,.14)', border:'1px solid rgba(125,211,252,.3)', color:'#7DD3FC', marginBottom:20, display:'inline-flex' }}>
                      <Users style={{ width:11, height:11 }} />
                      Who Is This For?
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {['Individuals new to the recruitment field','HR professionals learning basic recruitment skills','Students and recent graduates entering HR','Anyone wanting to understand hiring fundamentals','Career switchers moving into talent acquisition','Complete beginners with zero HR background'].map(item=>(
                        <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,.05)', borderRadius:12, padding:'14px 16px', border:'1px solid rgba(255,255,255,.08)' }}>
                          <CheckCircle2 style={{ width:14, height:14, color:'#38BDF8', flexShrink:0, marginTop:1 }} />
                          <span style={{ fontSize:13, color:'#CBD5E1', lineHeight:1.55, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:'#F0F9FF', borderRadius:22, border:'1.5px solid #BAE6FD', padding:'28px 32px', display:'flex', alignItems:'flex-start', gap:18 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#E0F2FE', border:'1.5px solid #BAE6FD', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Shield style={{ width:22, height:22, color:'#0369A1' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize:15, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>Prerequisites & Requirements</h4>
                      <p style={{ fontSize:14, color:'#64748B', lineHeight:1.8, margin:0 }}>No prior recruitment experience required. All you need is access to a computer and the internet, and a willingness to engage in learning activities and discussions.</p>
                    </div>
                  </div>
                  <div style={{ background:'#F8FAFC', borderRadius:22, border:'1.5px solid #E2E8F0', padding:'32px 36px' }}>
                    <div className="beg-tag" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#059669', marginBottom:20, display:'inline-flex' }}>
                      <GraduationCap style={{ width:11, height:11 }} />
                      What's Included
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {['Detailed course materials and lecture notes','Templates for JDs, interview questions & offers','Access to recruitment tools and resources','Case studies and practical hiring examples','Interactive webinars with experienced recruiters','Certificate of completion from Recruitment Institute'].map(item=>(
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

              {activeTab==='curriculum' && (
                <div>
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Detailed Course Modules</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>{CURRICULUM.length} modules click to expand each topic</p>
                  </div>
                  {CURRICULUM.map((mod, i) => {
                    const isOpen = expandedModule === i
                    return (
                      <div key={i} className={`beg-mod${isOpen?' open':''}`}>
                        <button className="beg-mod-btn" onClick={()=>setExpandedModule(isOpen?null:i)}>
                          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:isOpen?mod.accent:'#F0F9FF', border:`1.5px solid ${isOpen?mod.accent:'#BAE6FD'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                              <span style={{ fontSize:13, fontWeight:800, color:isOpen?'#fff':'#0369A1' }}>{i+1}</span>
                            </div>
                            <div>
                              <p style={{ fontSize:10, fontWeight:800, color:mod.accent, textTransform:'uppercase', letterSpacing:'.12em', margin:'0 0 2px' }}>{mod.week}</p>
                              <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0, lineHeight:1.3 }}>{mod.title}</p>
                            </div>
                          </div>
                          <div style={{ width:28, height:28, borderRadius:8, background:isOpen?'#F0F9FF':'#F8FAFC', border:`1px solid ${isOpen?'#BAE6FD':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {isOpen?<ChevronUp style={{ width:14, height:14, color:'#0EA5E9' }}/>:<ChevronDown style={{ width:14, height:14, color:'#94A3B8' }}/>}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'0 24px 22px', borderTop:`2px solid ${mod.accent}22` }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', margin:'16px 0 12px' }}>Topics covered in this module:</p>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                              {mod.details.map(d=>(
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

              {activeTab==='faqs' && (
                <div>
                  <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Frequently Asked Questions</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>Everything you need to know before enrolling</p>
                  </div>
                  {FAQS.map((faq, i) => {
                    const isOpen = expandedFaq === i
                    return (
                      <div key={i} className={`beg-faq${isOpen?' open':''}`}>
                        <button className="beg-faq-btn" onClick={()=>setExpandedFaq(isOpen?null:i)}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#0F172A', paddingRight:16, lineHeight:1.4 }}>{faq.q}</span>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:isOpen?'#0EA5E9':'#F1F5F9', border:`1px solid ${isOpen?'#0EA5E9':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                            {isOpen?<ChevronUp style={{ width:13, height:13, color:'#fff' }}/>:<ChevronDown style={{ width:13, height:13, color:'#64748B' }}/>}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'4px 22px 20px', borderTop:'1px solid #E0F2FE' }}>
                            <p style={{ fontSize:14, color:'#64748B', lineHeight:1.82, margin:'12px 0 0' }}>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="beg-sidebar">
              <div style={{ background:'linear-gradient(135deg,#0F172A,#1E293B)', padding:'24px 24px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📚</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3, margin:0 }}>HR Courses for Beginners</p>
                    <p style={{ fontSize:11, color:'#64748B', margin:'3px 0 0' }}>Recruitment Institute Certification</p>
                  </div>
                </div>
              </div>
              <div>
                {[{label:'Duration',value:'4 Weeks'},{label:'Learning Mode',value:'Online'},{label:'Course Level',value:'Beginner'},{label:'Certification',value:'Industry Verified'},{label:'Support',value:'Placement & Mentoring'}].map(({label,value},i,arr)=>(
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderBottom:i<arr.length-1?'1px solid #F1F5F9':'none' }}>
                    <span style={{ fontSize:12, color:'#94A3B8', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'20px 22px', borderTop:'1px solid #F1F5F9', display:'flex', flexDirection:'column', gap:10 }}>
                <button onClick={()=>setEnquiryOpen(true)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#0369A1,#0EA5E9)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 8px 20px rgba(3,105,161,.3)', transition:'transform .2s' }}>
                  Enquire About Batches <ArrowRight style={{ width:15, height:15 }} />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#059669,#0D9488)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, textDecoration:'none', boxShadow:'0 4px 14px rgba(5,150,105,.25)', transition:'transform .2s' }}>
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

      {/* â•â• CTA BANNER â•â• */}
      <section className="beg" style={{ background:'#F8FAFC', padding:'0 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius:24, background:'linear-gradient(130deg,#06101E 0%,#0A1828 50%,#071320 100%)', border:'1px solid rgba(255,255,255,.07)', overflow:'hidden', position:'relative' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'24px 24px' }} />
            <div aria-hidden style={{ position:'absolute', top:-60, right:-40, width:380, height:380, background:'radial-gradient(circle,rgba(14,165,233,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, background:'linear-gradient(90deg,#0EA5E9,#8B5CF6,#6EE7B7)' }} />
            <div style={{ padding:'60px 56px', position:'relative', zIndex:10, textAlign:'center' }}>
              <div className="beg-tag" style={{ background:'rgba(14,165,233,.12)', border:'1px solid rgba(14,165,233,.28)', color:'#7DD3FC', marginBottom:22, display:'inline-flex' }}>
                <Zap style={{ width:11, height:11 }} />
                Start Your HR Journey Today
              </div>
              <h2 style={{ fontSize:'clamp(26px,3vw,44px)', fontWeight:900, color:'#fff', lineHeight:1.12, letterSpacing:'-.03em', marginBottom:18 }}>
                Ready to take your first step<br />into a recruitment career?
              </h2>
              <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.82, maxWidth:500, margin:'0 auto 36px' }}>
                Enrol today in "Learning Recruitment for Beginners" and build the foundation for a rewarding HR career no experience needed.
              </p>
              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
                <button onClick={()=>setEnquiryOpen(true)} className="beg-cta">Enrol Now <ArrowRight style={{ width:16, height:16 }} /></button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="beg-cta-ghost"><MessageSquare style={{ width:15, height:15 }} /> WhatsApp Us</a>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:22, flexWrap:'wrap' }}>
                {['No prior experience needed','Online & flexible schedule','Industry certificate'].map(t=>(
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CheckCircle2 style={{ width:13, height:13, color:'#38BDF8' }} />
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
