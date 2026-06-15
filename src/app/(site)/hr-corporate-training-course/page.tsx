'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Award, BadgeCheck, BarChart3, BookOpen, Briefcase,
  Building2, CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  Globe, MessageSquare, Search, Shield, Sparkles, Star,
  TrendingUp, Users, Zap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import CareerSupportSection from '@/components/home/CareerSupportSection'
import PlacementProjectsSection from '@/components/home/PlacementProjectsSection'

/* â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

const FEATURES = [
  { icon: Search,    title: 'Recruitment Process Audit',      desc: 'Assess your current hiring workflows, identify bottlenecks, and implement best-practice frameworks across all business units.' },
  { icon: Globe,     title: 'Advanced Sourcing Strategies',    desc: 'Master Boolean search, talent mapping, LinkedIn Recruiter, employee referrals, and campus hiring pipelines.' },
  { icon: Users,     title: 'Structured Interviewing Methods', desc: 'Train your managers in competency-based and situational interviewing for consistent, bias-free assessments.' },
  { icon: Building2, title: 'ATS & Recruitment Technology',    desc: 'Maximise ROI on your existing ATS configure workflows, automate follow-ups, and reduce time-to-fill.' },
  { icon: Star,      title: 'Employer Branding & EVP',         desc: 'Develop a compelling employer value proposition, careers page, and social strategy to attract top talent.' },
  { icon: BarChart3, title: 'Hiring Metrics & Analytics',      desc: 'Track quality-of-hire, cost-per-hire, offer acceptance rate, and build dashboards to demonstrate ROI to leadership.' },
]

const CURRICULUM = [
  {
    module: 'Module 1',
    title: 'Recruitment Process Audit & Benchmarking',
    accent: '#2563EB',
    details: [
      'Mapping your existing end-to-end recruitment workflow',
      'Identifying inefficiencies, delays, and compliance gaps',
      'Benchmarking against industry best practices',
      'Creating a recruitment process improvement roadmap',
      'Stakeholder alignment and change management basics',
      'Defining SLAs and service-level agreements for hiring',
    ],
  },
  {
    module: 'Module 2',
    title: 'Advanced Sourcing & Talent Pipeline',
    accent: '#7C3AED',
    details: [
      'Boolean search strings, X-ray techniques, and talent mapping',
      'Maximising LinkedIn Recruiter and sourcing platforms',
      'Building proactive talent pools and talent communities',
      'Campus hiring, employee referral programme design',
      'Diversity and inclusive sourcing strategies',
      'Passive candidate engagement and nurture campaigns',
    ],
  },
  {
    module: 'Module 3',
    title: 'Structured Interviewing & Selection',
    accent: '#0D9488',
    details: [
      'Competency-based and behavioural interview frameworks',
      'Designing structured interview scorecards',
      'Unconscious bias awareness and mitigation',
      'Panel interview coordination and calibration',
      'Assessment centre design for volume hiring',
      'Decision-making and offer recommendation best practices',
    ],
  },
  {
    module: 'Module 4',
    title: 'ATS Optimisation & Recruitment Technology',
    accent: '#D97706',
    details: [
      'ATS configuration: job requisition and workflow setup',
      'Candidate disposition, tagging, and pipeline management',
      'Automating interview scheduling and communication',
      'Integrating job boards, LinkedIn, and careers page',
      'AI sourcing tools: overview and practical use',
      'Data hygiene and candidate privacy compliance (GDPR / DPDP)',
    ],
  },
  {
    module: 'Module 5',
    title: 'Employer Branding & Candidate Experience',
    accent: '#DC2626',
    details: [
      'Defining your Employer Value Proposition (EVP)',
      'Careers page audit and optimisation checklist',
      'Social media employer branding playbook',
      'Glassdoor / AmbitionBox reputation management',
      'Candidate communication templates and feedback loops',
      'Measuring Net Promoter Score (NPS) for candidates',
    ],
  },
  {
    module: 'Module 6',
    title: 'Recruitment Metrics, Analytics & Reporting',
    accent: '#059669',
    details: [
      'Key recruitment KPIs: time-to-fill, cost-per-hire, quality-of-hire',
      'Offer acceptance rate analysis and improvement strategies',
      'Building a recruitment dashboard for leadership reporting',
      'Attrition prediction using early-stage hiring data',
      'ROI calculation for recruitment technology investment',
      'Quarterly business review (QBR) deck for talent acquisition',
    ],
  },
]

const FAQS = [
  { q: 'What is the format of the corporate training?', a: 'Training is delivered in a blended format live instructor-led workshops (on-site or virtual), self-paced content, and post-training coaching calls. We customise the delivery to your organisation\'s schedule and needs.' },
  { q: 'How many participants can attend per batch?', a: 'We typically recommend 8–20 participants per cohort for maximum engagement. For larger teams, we run parallel batches with the same curriculum and dedicated trainers.' },
  { q: 'Can the curriculum be customised for our industry?', a: 'Absolutely. We offer fully bespoke content development aligned to your sector (IT/BFSI/Healthcare/Manufacturing), your specific job roles, and your existing internal processes and ATS.' },
  { q: 'Do you offer post-training support?', a: 'Yes. Every corporate engagement includes 30-day post-training email support, access to our resource library, and an optional monthly coaching call for team leads.' },
  { q: 'What industries have you trained?', a: 'We have delivered corporate recruitment training across IT, BFSI, Pharma, Healthcare, Manufacturing, FMCG, and Consulting sectors, with trainers who have practitioner experience in each domain.' },
  { q: 'Is there a certification for participants?', a: 'Yes. Each participant receives an individual Recruitment Institute Certificate of Completion, which can be shared on LinkedIn and used for internal L&D records.' },
  { q: 'How do we get a proposal?', a: 'Simply fill in the enquiry form or WhatsApp us with your team size, industry, and primary skill gaps. We will respond with a customised proposal within one business day.' },
]

const STATS = [
  { value: 'Flex',    label: 'Duration',           color: '#2563EB' },
  { value: '6',       label: 'Core Modules',        color: '#7C3AED' },
  { value: '20+',     label: 'Industries Served',   color: '#0D9488' },
  { value: '100%',    label: 'Bespoke Training',    color: '#D97706' },
]

const CLIENTS = ['IT & Software', 'BFSI', 'Pharma', 'Healthcare', 'Manufacturing', 'FMCG', 'Consulting', 'E-Commerce']

/* â"€â"€ Component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */

export default function CorporateTrainingPage() {
  const [enquiryOpen, setEnquiryOpen]       = useState(false)
  const [activeTab, setActiveTab]           = useState<'overview' | 'curriculum' | 'faqs'>('overview')
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [expandedFaq, setExpandedFaq]       = useState<number | null>(null)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#breadcrumb',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://recruitmentinstitute.in' },
              { '@type': 'ListItem', position: 2, name: 'Courses', item: 'https://recruitmentinstitute.in/courses' },
              { '@type': 'ListItem', position: 3, name: 'HR Corporate Training Course', item: 'https://recruitmentinstitute.in/hr-corporate-training-course' },
            ],
          },
          {
            '@type': 'Course',
            '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#course',
            name: 'HR Corporate Training Course',
            description: 'Premium bespoke recruitment training programme for HR teams and talent acquisition departments across all major industries.',
            url: 'https://recruitmentinstitute.in/hr-corporate-training-course',
            provider: { '@type': 'Organization', name: 'Recruitment Institute', url: 'https://recruitmentinstitute.in' },
            educationalLevel: 'Professional', inLanguage: 'en-IN',
            courseMode: ['online', 'onsite'],
            audience: { '@type': 'Audience', audienceType: 'HR Professionals, Talent Acquisition Teams, Corporate HR Departments' },
            breadcrumb: { '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#breadcrumb' },
            offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR' },
          },
          {
            '@type': 'WebPage',
            '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#webpage',
            url: 'https://recruitmentinstitute.in/hr-corporate-training-course',
            name: 'HR Corporate Training Course',
            description: 'Tailored recruitment training for corporate HR and talent acquisition teams.',
            isPartOf: { '@id': 'https://recruitmentinstitute.in/#website' },
            about: { '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#course' },
            breadcrumb: { '@id': 'https://recruitmentinstitute.in/hr-corporate-training-course#breadcrumb' },
          },
        ],
      }) }} />

      <style>{`
        .corp { font-family: 'Poppins', sans-serif; }
        .corp-hero {
          background: linear-gradient(135deg, #03071C 0%, #07102A 38%, #0A183A 68%, #040D22 100%);
          position: relative; overflow: hidden; min-height: 640px; display: flex; align-items: center;
        }
        .corp-hero::before { content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px); background-size:32px 32px; }
        .corp-tag { display:inline-flex; align-items:center; gap:7px; padding:6px 16px; border-radius:50px; font-size:11px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
        .corp-pill { display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:50px; font-size:12px; font-weight:600; }
        .corp-cta { display:inline-flex; align-items:center; gap:9px; background:linear-gradient(135deg,#1D4ED8,#2563EB,#3B82F6); color:#fff; font-weight:700; font-size:15px; padding:15px 34px; border-radius:12px; border:none; cursor:pointer; text-decoration:none; box-shadow:0 8px 28px rgba(37,99,235,.45); transition:transform .2s,box-shadow .2s; }
        .corp-cta:hover { transform:translateY(-2px); box-shadow:0 14px 40px rgba(37,99,235,.55); }
        .corp-cta-ghost { display:inline-flex; align-items:center; gap:9px; border:1.5px solid rgba(255,255,255,.18); color:#fff; font-weight:600; font-size:14px; padding:14px 28px; border-radius:12px; text-decoration:none; background:rgba(255,255,255,.06); transition:background .2s,border-color .2s; }
        .corp-cta-ghost:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.3); }
        .corp-feat { background:#fff; border-radius:18px; border:1.5px solid #E2E8F0; padding:28px 24px; transition:transform .28s,box-shadow .28s,border-color .28s; position:relative; overflow:hidden; }
        .corp-feat::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#1D4ED8,#2563EB); opacity:0; transition:opacity .28s; }
        .corp-feat:hover { transform:translateY(-6px); box-shadow:0 22px 50px rgba(15,23,42,.11); border-color:#BFDBFE; }
        .corp-feat:hover::after { opacity:1; }
        .corp-mod { border-radius:16px; overflow:hidden; border:1.5px solid #E2E8F0; background:#fff; transition:border-color .2s,box-shadow .2s; margin-bottom:12px; }
        .corp-mod.open { border-color:#BFDBFE; box-shadow:0 8px 28px rgba(37,99,235,.1); }
        .corp-mod-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background .18s; }
        .corp-mod-btn:hover { background:#EFF6FF; }
        .corp-faq { border-radius:14px; overflow:hidden; border:1.5px solid #E2E8F0; background:#fff; transition:border-color .2s,box-shadow .2s; margin-bottom:10px; }
        .corp-faq.open { border-color:#BFDBFE; box-shadow:0 6px 20px rgba(37,99,235,.08); }
        .corp-faq-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:18px 22px; background:transparent; border:none; cursor:pointer; text-align:left; }
        .corp-tab { display:flex; align-items:center; gap:7px; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:all .2s; }
        .corp-tab.active { background:linear-gradient(135deg,#1D4ED8,#2563EB); color:#fff; box-shadow:0 4px 14px rgba(29,78,216,.3); }
        .corp-tab:not(.active) { background:transparent; color:#64748B; }
        .corp-tab:not(.active):hover { color:#2563EB; background:#EFF6FF; }
        .corp-sidebar { background:#fff; border-radius:22px; border:1.5px solid #E2E8F0; box-shadow:0 20px 60px rgba(15,23,42,.1); overflow:hidden; position:sticky; top:100px; }
        @media(max-width:1100px){.corp-hero-grid{grid-template-columns:1fr !important;}.corp-hero-right{display:none !important;}}
        @media(max-width:1024px){.corp-content-grid{grid-template-columns:1fr !important;}.corp-sidebar{position:static !important;}}
        @media(max-width:860px){.corp-feat-grid,.corp-stats-grid,.corp-clients-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:560px){.corp-feat-grid{grid-template-columns:1fr !important;}.corp-cta-row{flex-direction:column !important;}}
      `}</style>

      {/* â•â• HERO â•â• */}
      <section className="corp corp-hero">
        <div aria-hidden style={{ position:'absolute', top:-120, right:-60, width:700, height:700, background:'radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', bottom:-80, left:'12%', width:480, height:480, background:'radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#2563EB 28%,#7C3AED 72%,transparent)', zIndex:3 }} />

        <div className="container corp" style={{ position:'relative', zIndex:10, padding:'80px 0 96px' }}>
          <div className="corp-hero-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 490px', gap:'72px', alignItems:'center' }}>
            <div>
              <nav style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28 }}>
                <Link href="/" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Home</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <Link href="/courses" style={{ color:'#64748B', textDecoration:'none', fontSize:12, fontWeight:500 }}
>Courses</Link>
                <ChevronRight style={{ width:13, height:13, color:'#475569' }} />
                <span style={{ fontSize:12, fontWeight:600, color:'#93C5FD' }}>HR Corporate Training</span>
              </nav>

              <div className="corp-tag" style={{ background:'rgba(37,99,235,.12)', border:'1px solid rgba(37,99,235,.3)', color:'#93C5FD', marginBottom:24 }}>
                <Briefcase style={{ width:12, height:12 }} />
                Corporate Training Programme
              </div>

              <h1 style={{ fontSize:'clamp(32px,4vw,56px)', fontWeight:900, color:'#fff', lineHeight:1.07, letterSpacing:'-.04em', marginBottom:22 }}>
                Upgrade Your{' '}
                <span style={{ background:'linear-gradient(120deg,#93C5FD 0%,#C4B5FD 55%,#6EE7B7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  Internal Recruitment Team
                </span>
                <br />with Bespoke Training
              </h1>

              <p style={{ fontSize:17, color:'#94A3B8', lineHeight:1.82, maxWidth:520, marginBottom:36 }}>
                Customised, on-site or online corporate recruitment training designed to elevate your talent acquisition function from sourcing and selection to analytics and employer branding.
              </p>

              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:42 }}>
                {[
                  { text:'Flexible Schedule',    color:'#93C5FD', bg:'rgba(147,197,253,.09)', border:'rgba(147,197,253,.22)' },
                  { text:'On-site / Online',     color:'#C4B5FD', bg:'rgba(196,181,253,.09)', border:'rgba(196,181,253,.22)' },
                  { text:'Corporate Level',      color:'#6EE7B7', bg:'rgba(110,231,183,.09)', border:'rgba(110,231,183,.22)' },
                  { text:'Fully Bespoke',        color:'#FCD34D', bg:'rgba(252,211,77,.09)',  border:'rgba(252,211,77,.22)'  },
                ].map(({ text, color, bg, border }) => (
                  <span key={text} className="corp-pill" style={{ background:bg, border:`1px solid ${border}`, color }}>
                    <CheckCircle2 style={{ width:12, height:12 }} />{text}
                  </span>
                ))}
              </div>

              <div className="corp-cta-row" style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <button onClick={() => setEnquiryOpen(true)} className="corp-cta">
                  Request a Proposal <ArrowRight style={{ width:16, height:16 }} />
                </button>
                <Link href="/contact" className="corp-cta-ghost">Schedule a Consultation</Link>
              </div>
            </div>

            <div className="corp-hero-right" style={{ position:'relative' }}>
              <div aria-hidden style={{ position:'absolute', inset:-20, borderRadius:32, background:'linear-gradient(135deg,rgba(37,99,235,.22),rgba(124,58,237,.15),rgba(13,148,136,.1))', filter:'blur(2px)' }} />
              <div style={{ position:'relative', borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,.1)', boxShadow:'0 48px 110px rgba(0,0,0,.65)' }}>
                <div style={{ position:'relative', height:340, background:'#040D22' }}>
                  <Image src="/assets/images/courses/main-home/3.jpg"
                    alt="HR Corporate Training Upgrade your internal recruitment team"
                    fill priority sizes="490px" style={{ objectFit:'cover', objectPosition:'center top' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(4,13,34,.1) 0%,transparent 40%,rgba(3,8,20,.92) 100%)' }} />
                  <div style={{ position:'absolute', top:18, left:18, display:'inline-flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:50, background:'rgba(37,99,235,.18)', border:'1px solid rgba(37,99,235,.42)', backdropFilter:'blur(12px)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#60A5FA', boxShadow:'0 0 8px #60A5FA', display:'block' }} />
                    <span style={{ fontSize:10, fontWeight:800, color:'#93C5FD', letterSpacing:'.12em', textTransform:'uppercase' }}>Corporate Training</span>
                  </div>
                  <div style={{ position:'absolute', top:18, right:18, display:'inline-flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:50, background:'rgba(255,255,255,.14)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.22)' }}>
                    <TrendingUp style={{ width:12, height:12, color:'#6EE7B7' }} />
                    <span style={{ fontSize:12, fontWeight:800, color:'#fff' }}>Bespoke Delivery</span>
                  </div>
                </div>
                <div style={{ background:'#030816', padding:'22px 26px 24px', borderTop:'1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'#60A5FA', textTransform:'uppercase', letterSpacing:'.2em', margin:'0 0 16px' }}>Program Highlights</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                    {[{val:'6',lbl:'Modules',color:'#93C5FD'},{val:'20+',lbl:'Industries',color:'#C4B5FD'},{val:'100%',lbl:'Bespoke',color:'#6EE7B7'}].map(({ val, lbl, color }) => (
                      <div key={lbl} style={{ textAlign:'center' }}>
                        <p style={{ fontSize:22, fontWeight:900, color, lineHeight:1, margin:'0 0 4px', letterSpacing:'-.03em' }}>{val}</p>
                        <p style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', margin:0 }}>{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:'#020710', padding:'14px 26px', borderTop:'1px solid rgba(255,255,255,.05)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #020710', overflow:'hidden', marginLeft:i>1?-8:0, position:'relative', flexShrink:0 }}>
                        <Image src={`/assets/images/team/style${i<=2?1:2}/${i<=2?i:i-2}.jpg`} alt="" fill sizes="28px" style={{ objectFit:'cover' }} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize:12, color:'#64748B', fontWeight:500 }}>Trusted by <strong style={{ color:'#93C5FD' }}>HR leaders</strong> across 20+ industries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:54, background:'#F8FAFC', clipPath:'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* â•â• STATS â•â• */}
      <section className="corp" style={{ background:'#F8FAFC', paddingTop:64 }}>
        <div className="container">
          <div className="corp-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
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

      {/* â•â• INDUSTRY CLIENTS â•â• */}
      <section className="corp" style={{ background:'#F8FAFC', paddingTop:52, paddingBottom:4 }}>
        <div className="container">
          <p style={{ fontSize:11, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.2em', textAlign:'center', marginBottom:18 }}>Industries We Train</p>
          <div className="corp-clients-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:900, margin:'0 auto' }}>
            {CLIENTS.map(c => (
              <div key={c} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px 14px', borderRadius:12, background:'#fff', border:'1.5px solid #E2E8F0', boxShadow:'0 2px 8px rgba(15,23,42,.04)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#2563EB', flexShrink:0 }} />
                <span style={{ fontSize:12, fontWeight:700, color:'#334155' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â• FEATURES â•â• */}
      <section className="corp" style={{ background:'#fff', padding:'96px 0 104px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">

          {/* Split header */}
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 380px', gap:48, alignItems:'center', marginBottom:72 }}>
            <div>
              <div className="corp-tag" style={{ background:'linear-gradient(135deg,rgba(37,99,235,.1),rgba(124,58,237,.08))', border:'1px solid rgba(37,99,235,.25)', color:'#2563EB', marginBottom:20, display:'inline-flex' }}>
                <Sparkles style={{ width:11, height:11 }} />
                Training Modules
              </div>
              <h2 style={{ fontSize:'clamp(30px,3.4vw,50px)', fontWeight:900, color:'#0F172A', lineHeight:1.06, letterSpacing:'-.045em', margin:'0 0 20px' }}>
                6 modules.{' '}
                <span style={{ background:'linear-gradient(120deg,#2563EB 0%,#7C3AED 45%,#0D9488 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                  End-to-end
                </span>
                <br />recruitment excellence.
              </h2>
              <p style={{ fontSize:16, color:'#64748B', lineHeight:1.85, maxWidth:500, margin:0 }}>
                Each module is built from practitioner experience every session includes real-world case studies, role-plays, and take-home toolkits your team can use immediately.
              </p>
            </div>

            {/* Outcome stats */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { num:'6',    label:'Core training modules',        color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE' },
                { num:'20+',  label:'Industries we have trained',   color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE' },
                { num:'100%', label:'Bespoke curriculum per client', color:'#0D9488', bg:'#F0FDFA', border:'#99F6E4' },
                { num:'30d',  label:'Post-training coaching support',color:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
              ].map(({ num, label, color, bg, border }) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:18, background:'#F8FAFC', border:`1.5px solid ${border}`, borderRadius:14, padding:'14px 20px', transition:'transform .2s,box-shadow .2s' }}

>
                  <div style={{ width:52, height:52, borderRadius:12, background:bg, border:`1.5px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:17, fontWeight:900, color, letterSpacing:'-.03em', lineHeight:1 }}>{num}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:'#334155', lineHeight:1.4 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6 module cards */}
          {(() => {
            const PALETTES = [
              { color:'#2563EB', light:'#EFF6FF', border:'#BFDBFE', glow:'rgba(37,99,235,.14)',  num:'01', grad:'linear-gradient(135deg,#1D4ED8,#2563EB)' },
              { color:'#7C3AED', light:'#F5F3FF', border:'#DDD6FE', glow:'rgba(124,58,237,.14)', num:'02', grad:'linear-gradient(135deg,#6D28D9,#7C3AED)' },
              { color:'#0D9488', light:'#F0FDFA', border:'#99F6E4', glow:'rgba(13,148,136,.14)', num:'03', grad:'linear-gradient(135deg,#0F766E,#0D9488)' },
              { color:'#D97706', light:'#FFFBEB', border:'#FDE68A', glow:'rgba(217,119,6,.14)',  num:'04', grad:'linear-gradient(135deg,#B45309,#D97706)' },
              { color:'#DC2626', light:'#FEF2F2', border:'#FECACA', glow:'rgba(220,38,38,.14)',  num:'05', grad:'linear-gradient(135deg,#B91C1C,#DC2626)' },
              { color:'#059669', light:'#F0FDF4', border:'#BBF7D0', glow:'rgba(5,150,105,.14)',  num:'06', grad:'linear-gradient(135deg,#047857,#059669)' },
            ]
            return (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
                {FEATURES.map(({ icon:Icon, title, desc }, i) => {
                  const p = PALETTES[i % PALETTES.length]
                  return (
                    <div key={title} style={{ position:'relative', background:'#fff', borderRadius:22, border:`1.5px solid ${p.border}`, padding:0, overflow:'hidden', transition:'transform .3s,box-shadow .3s', boxShadow:'0 2px 18px rgba(15,23,42,.06)' }}

>
                      <div style={{ height:4, background:p.grad }} />
                      <div style={{ padding:'30px 28px 28px', position:'relative' }}>
                        <div aria-hidden style={{ position:'absolute', top:10, right:20, fontSize:88, fontWeight:900, color:p.color, opacity:.045, lineHeight:1, userSelect:'none', letterSpacing:'-.04em', pointerEvents:'none' }}>{p.num}</div>
                        <div style={{ width:56, height:56, borderRadius:16, background:p.light, border:`1.5px solid ${p.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, position:'relative', zIndex:1, boxShadow:`0 4px 14px ${p.glow}` }}>
                          <Icon style={{ width:26, height:26, color:p.color }} />
                        </div>
                        <span style={{ display:'inline-block', fontSize:10, fontWeight:800, color:p.color, textTransform:'uppercase', letterSpacing:'.22em', marginBottom:10, opacity:.75, position:'relative', zIndex:1 }}>{p.num}</span>
                        <h3 style={{ fontSize:16, fontWeight:800, color:'#0F172A', lineHeight:1.26, margin:'0 0 12px', position:'relative', zIndex:1 }}>{title}</h3>
                        <p style={{ fontSize:13, color:'#64748B', lineHeight:1.84, margin:'0 0 20px', position:'relative', zIndex:1 }}>{desc}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:6, position:'relative', zIndex:1 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:p.color }}>Covered in programme</span>
                          <ArrowRight style={{ width:13, height:13, color:p.color }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Bottom bar */}
          <div style={{ marginTop:52, borderRadius:20, background:'linear-gradient(135deg,#03071C,#07102A)', border:'1px solid rgba(255,255,255,.07)', padding:'32px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
            <div aria-hidden style={{ position:'absolute', top:-40, left:-20, width:220, height:220, background:'radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, position:'absolute', top:0, left:0, right:0, background:'linear-gradient(90deg,#2563EB,#7C3AED,#0D9488)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:18, position:'relative', zIndex:1 }}>
              <div style={{ width:50, height:50, borderRadius:14, background:'rgba(37,99,235,.15)', border:'1px solid rgba(37,99,235,.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Award style={{ width:24, height:24, color:'#60A5FA' }} />
              </div>
              <div>
                <p style={{ fontSize:16, fontWeight:800, color:'#fff', margin:'0 0 4px' }}>Every participant receives an individual certificate</p>
                <p style={{ fontSize:13, color:'#64748B', margin:0 }}>Shareable on LinkedIn and trusted by 200+ hiring companies across India.</p>
              </div>
            </div>
            <button onClick={()=>setEnquiryOpen(true)} style={{ display:'inline-flex', alignItems:'center', gap:9, background:'linear-gradient(135deg,#1D4ED8,#2563EB)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px 30px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(29,78,216,.38)', whiteSpace:'nowrap', flexShrink:0, position:'relative', zIndex:1, transition:'transform .2s,box-shadow .2s' }}

>
              Request a Proposal <ArrowRight style={{ width:15, height:15 }} />
            </button>
          </div>
        </div>
      </section>

      {/* â•â• TABS + SIDEBAR â•â• */}
      <section className="corp" style={{ background:'#fff', padding:'80px 0 96px', borderTop:'1px solid #E2E8F0' }}>
        <div className="container">
          <div className="corp-content-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 360px', gap:36, alignItems:'start' }}>
            <div>
              <div style={{ display:'flex', gap:6, marginBottom:32, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:14, padding:'6px', width:'fit-content', boxShadow:'0 2px 8px rgba(15,23,42,.05)' }}>
                {[{id:'overview',label:'Overview',icon:<BookOpen style={{width:14,height:14}}/>},{id:'curriculum',label:'Syllabus',icon:<CheckCircle2 style={{width:14,height:14}}/>},{id:'faqs',label:'FAQs',icon:<MessageSquare style={{width:14,height:14}}/>}].map(tab=>(
                  <button key={tab.id} className={`corp-tab${activeTab===tab.id?' active':''}`} onClick={()=>setActiveTab(tab.id as typeof activeTab)}>{tab.icon}{tab.label}</button>
                ))}
              </div>

              {activeTab==='overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ background:'linear-gradient(135deg,#0A183A,#152354)', borderRadius:22, padding:'32px 36px' }}>
                    <div className="corp-tag" style={{ background:'rgba(147,197,253,.14)', border:'1px solid rgba(147,197,253,.3)', color:'#93C5FD', marginBottom:20, display:'inline-flex' }}>
                      <Users style={{ width:11, height:11 }} />
                      Who Is This For?
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {['HR managers and talent acquisition leads','Corporate recruiting teams across all industries','HR Business Partners with hiring responsibilities','L&D managers designing internal HR curricula','Staffing and RPO firms upgrading team skills','Business owners building their first HR team'].map(item=>(
                        <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,.05)', borderRadius:12, padding:'14px 16px', border:'1px solid rgba(255,255,255,.08)' }}>
                          <CheckCircle2 style={{ width:14, height:14, color:'#60A5FA', flexShrink:0, marginTop:1 }} />
                          <span style={{ fontSize:13, color:'#CBD5E1', lineHeight:1.55, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:'#EFF6FF', borderRadius:22, border:'1.5px solid #BFDBFE', padding:'28px 32px', display:'flex', alignItems:'flex-start', gap:18 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'#DBEAFE', border:'1.5px solid #BFDBFE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Shield style={{ width:22, height:22, color:'#1D4ED8' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize:15, fontWeight:700, color:'#0F172A', margin:'0 0 8px' }}>Prerequisites & Requirements</h4>
                      <p style={{ fontSize:14, color:'#64748B', lineHeight:1.8, margin:0 }}>Participants should have some exposure to HR or recruitment functions. The training is most effective for mid-level to senior HR professionals looking to sharpen their team's capabilities systematically.</p>
                    </div>
                  </div>
                  <div style={{ background:'#F8FAFC', borderRadius:22, border:'1.5px solid #E2E8F0', padding:'32px 36px' }}>
                    <div className="corp-tag" style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#059669', marginBottom:20, display:'inline-flex' }}>
                      <BadgeCheck style={{ width:11, height:11 }} />
                      Deliverables & Inclusions
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {['Customised training content per your industry','Pre & post-training skill assessment','Take-home toolkit: templates, scorecards & guides','Participant workbooks and reference materials','30-day post-training support & resource access','Individual certificates for all participants'].map(item=>(
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
                  <div style={{ background:'linear-gradient(135deg,#0A183A,#152354)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Detailed Programme Modules</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>{CURRICULUM.length} modules click to expand each topic</p>
                  </div>
                  {CURRICULUM.map((mod, i) => {
                    const isOpen = expandedModule === i
                    return (
                      <div key={i} className={`corp-mod${isOpen?' open':''}`}>
                        <button className="corp-mod-btn" onClick={()=>setExpandedModule(isOpen?null:i)}>
                          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:isOpen?mod.accent:'#EFF6FF', border:`1.5px solid ${isOpen?mod.accent:'#BFDBFE'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                              <span style={{ fontSize:13, fontWeight:800, color:isOpen?'#fff':'#1D4ED8' }}>{i+1}</span>
                            </div>
                            <div>
                              <p style={{ fontSize:10, fontWeight:800, color:mod.accent, textTransform:'uppercase', letterSpacing:'.12em', margin:'0 0 2px' }}>{mod.module}</p>
                              <p style={{ fontSize:14, fontWeight:700, color:'#0F172A', margin:0, lineHeight:1.3 }}>{mod.title}</p>
                            </div>
                          </div>
                          <div style={{ width:28, height:28, borderRadius:8, background:isOpen?'#EFF6FF':'#F8FAFC', border:`1px solid ${isOpen?'#BFDBFE':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {isOpen?<ChevronUp style={{ width:14, height:14, color:'#2563EB' }}/>:<ChevronDown style={{ width:14, height:14, color:'#94A3B8' }}/>}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'0 24px 22px', borderTop:`2px solid ${mod.accent}22` }}>
                            <p style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.1em', margin:'16px 0 12px' }}>Topics covered:</p>
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
                  <div style={{ background:'linear-gradient(135deg,#0A183A,#152354)', borderRadius:22, padding:'24px 28px', marginBottom:20 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>Frequently Asked Questions</h3>
                    <p style={{ fontSize:12, color:'#94A3B8', margin:0 }}>Common questions from HR leaders and L&D teams</p>
                  </div>
                  {FAQS.map((faq, i) => {
                    const isOpen = expandedFaq === i
                    return (
                      <div key={i} className={`corp-faq${isOpen?' open':''}`}>
                        <button className="corp-faq-btn" onClick={()=>setExpandedFaq(isOpen?null:i)}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#0F172A', paddingRight:16, lineHeight:1.4 }}>{faq.q}</span>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:isOpen?'#2563EB':'#F1F5F9', border:`1px solid ${isOpen?'#2563EB':'#E2E8F0'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                            {isOpen?<ChevronUp style={{ width:13, height:13, color:'#fff' }}/>:<ChevronDown style={{ width:13, height:13, color:'#64748B' }}/>}
                          </div>
                        </button>
                        {isOpen && (
                          <div style={{ padding:'4px 22px 20px', borderTop:'1px solid #DBEAFE' }}>
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
            <aside className="corp-sidebar">
              <div style={{ background:'linear-gradient(135deg,#0A183A,#152354)', padding:'24px 24px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🏢</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3, margin:0 }}>HR Corporate Training Course</p>
                    <p style={{ fontSize:11, color:'#64748B', margin:'3px 0 0' }}>Recruitment Institute Bespoke Programme</p>
                  </div>
                </div>
              </div>
              <div>
                {[{label:'Duration',value:'Flexible / Custom'},{label:'Delivery',value:'On-site & Online'},{label:'Level',value:'Corporate / Professional'},{label:'Team Size',value:'8–20 per Batch'},{label:'Post Support',value:'30-Day Coaching'}].map(({label,value},i,arr)=>(
                  <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 22px', borderBottom:i<arr.length-1?'1px solid #F1F5F9':'none' }}>
                    <span style={{ fontSize:12, color:'#94A3B8', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'20px 22px', borderTop:'1px solid #F1F5F9', display:'flex', flexDirection:'column', gap:10 }}>
                <button onClick={()=>setEnquiryOpen(true)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#1D4ED8,#2563EB)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, border:'none', cursor:'pointer', boxShadow:'0 8px 20px rgba(29,78,216,.3)', transition:'transform .2s' }}>
                  Request a Proposal <ArrowRight style={{ width:15, height:15 }} />
                </button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#059669,#0D9488)', color:'#fff', fontWeight:700, fontSize:14, padding:'14px', borderRadius:11, textDecoration:'none', boxShadow:'0 4px 14px rgba(5,150,105,.25)', transition:'transform .2s' }}>
                  <MessageSquare style={{ width:15, height:15 }} />WhatsApp Our Team
                </a>
              </div>
              <div style={{ padding:'13px 22px', borderTop:'1px solid #F8FAFC', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <BadgeCheck style={{ width:15, height:15, color:'#10B981' }} />
                <p style={{ fontSize:11, color:'#64748B', fontWeight:600, margin:0 }}>Bespoke content • Individual certificates</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CareerSupportSection />
      <PlacementProjectsSection />

      {/* â•â• CTA BANNER â•â• */}
      <section className="corp" style={{ background:'#F8FAFC', padding:'0 0 88px' }}>
        <div className="container">
          <div style={{ borderRadius:24, background:'linear-gradient(130deg,#03071C 0%,#07102A 50%,#040D22 100%)', border:'1px solid rgba(255,255,255,.07)', overflow:'hidden', position:'relative' }}>
            <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize:'26px 26px' }} />
            <div aria-hidden style={{ position:'absolute', top:-60, right:-40, width:400, height:400, background:'radial-gradient(circle,rgba(37,99,235,.22) 0%,transparent 65%)', pointerEvents:'none' }} />
            <div aria-hidden style={{ height:2, background:'linear-gradient(90deg,#2563EB,#7C3AED,#0D9488)' }} />
            <div style={{ padding:'60px 56px', position:'relative', zIndex:10, textAlign:'center' }}>
              <div className="corp-tag" style={{ background:'rgba(37,99,235,.12)', border:'1px solid rgba(37,99,235,.28)', color:'#93C5FD', marginBottom:22, display:'inline-flex' }}>
                <Zap style={{ width:11, height:11 }} />
                Transform Your Hiring Function
              </div>
              <h2 style={{ fontSize:'clamp(26px,3vw,44px)', fontWeight:900, color:'#fff', lineHeight:1.12, letterSpacing:'-.03em', marginBottom:18 }}>
                Ready to build a world-class<br />internal recruitment team?
              </h2>
              <p style={{ fontSize:16, color:'#94A3B8', lineHeight:1.82, maxWidth:520, margin:'0 auto 36px' }}>
                Let us design a bespoke training programme for your organisation. From sourcing and selection to analytics and employer branding we cover it all.
              </p>
              <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
                <button onClick={()=>setEnquiryOpen(true)} className="corp-cta">Request a Proposal <ArrowRight style={{ width:16, height:16 }} /></button>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="corp-cta-ghost"><MessageSquare style={{ width:15, height:15 }} /> WhatsApp Us</a>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:22, flexWrap:'wrap' }}>
                {['Fully bespoke curriculum','On-site & online delivery','Individual certificates for all participants'].map(t=>(
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CheckCircle2 style={{ width:13, height:13, color:'#60A5FA' }} />
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
