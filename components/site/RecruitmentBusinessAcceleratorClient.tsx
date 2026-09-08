'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Award,
  Users,
  Clock,
  Star,
  Phone,
  FileText,
  Check,
  TrendingUp,
  Briefcase,
  Building2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  Target,
  Layers,
  DollarSign,
  Flame,
  Laptop,
  CheckCheck,
  GraduationCap,
} from 'lucide-react'
import EnquiryModal from '@/components/home/EnquiryModal'
import type { DynamicCourseData } from '@/lib/services/courseDataService'

interface Props {
  course: DynamicCourseData
}

export default function RecruitmentBusinessAcceleratorClient({ course }: Props) {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<string>(
    'Plan 2 — Accelerator (₹75,000 – ₹99,000 | Recommended)'
  )

  // Accordion states
  const [openPhase, setOpenPhase] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Interactive ROI Calculator State
  const [monthlyPlacements, setMonthlyPlacements] = useState<number>(3)
  const [averageCtc, setAverageCtc] = useState<number>(1000000) // ₹10 Lakhs
  const [commissionRate, setCommissionRate] = useState<number>(8.33) // 8.33% (1 month gross CTC)

  // Calculations
  const feePerPlacement = Math.round((averageCtc * commissionRate) / 100)
  const monthlyRevenue = feePerPlacement * monthlyPlacements
  const annualRevenue = monthlyRevenue * 12

  const openEnrollModal = (planName: string) => {
    setSelectedPlanForModal(planName)
    setIsModalOpen(true)
  }

  // 3-Tier Pricing Configuration with Price Ranges (No Fixed Prices)
  const plans = [
    {
      id: 'launch',
      name: 'Plan 1 — Launch',
      badge: '🟢 FOUNDATION TIER',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagline: 'Start your recruitment consultancy from scratch with proven legal & operational foundations',
      duration: '8 Weeks Intensive',
      priceRange: '₹29,999 – ₹39,999',
      priceSubtitle: 'Range based on cohort batch & mentorship track',
      bestFor: 'Aspiring recruiters & professionals ready to launch a compliant recruitment agency',
      isHero: false,
      ctaText: 'Apply for Plan 1 (Launch)',
      ctaStyle: 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400',
      features: [
        'Business model selection (Contingency vs Retainer)',
        'Recruitment industry orientation & standards',
        'Profitable niche selection (IT, BFSI, Healthcare)',
        'Company / LLP / Proprietorship setup guidance',
        'GST & MSME registration guidance',
        'Website & business email setup guidance',
        'Recruitment agreement & MOU contract templates',
        'Fee & commercial structure (8.33% to 15%)',
        'Candidate sourcing methodology',
        'Job portal strategy & cost-effective access',
        'LinkedIn candidate sourcing strategy',
        'Client database creation & management',
        'B2B client acquisition frameworks',
        'Cold calling scripts for HR heads & Founders',
        'Cold email outreach campaigns (40%+ open rate)',
        'LinkedIn B2B outreach & connection workflows',
        'Structured candidate screening & submission process',
        'Candidate replacement policy terms',
        'Invoice & payment collection process',
        'Basic ATS / CRM configuration',
        'First-client acquisition strategy',
        'Weekly live group mentoring sessions',
      ],
      note: 'Note: Actual government / legal filing fees are separate.',
    },
    {
      id: 'accelerator',
      name: 'Plan 2 — Accelerator',
      badge: '⭐ HERO • MOST POPULAR & RECOMMENDED',
      badgeBg: 'bg-amber-400 text-slate-950 font-black shadow-sm',
      tagline: 'The complete 6-month hands-on incubator to close clients and scale agency revenue',
      duration: '6 Months Active Incubation',
      priceRange: '₹75,000 – ₹99,000',
      priceSubtitle: 'Range based on 1-to-1 deal review depth & delivery support',
      bestFor: 'Founders who want active deal guidance, proposal reviews & full operational handholding',
      isHero: true,
      ctaText: 'Apply for Plan 2 (Accelerator) →',
      ctaStyle: 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/30 transform hover:-translate-y-0.5',
      features: [
        'Everything included in Plan 1 (Launch) PLUS:',
        'Weekly business review & pipeline audit',
        '1-to-1 dedicated founder mentoring',
        'Active client acquisition monitoring',
        'Sales pipeline & deal review',
        'Client proposal & pitch deck review',
        'Commercial fee negotiation support',
        'Client follow-up & closing strategy',
        'Recruitment delivery & fulfillment support',
        'Candidate database architecture & scaling',
        'Recruiter hiring & screening frameworks',
        'Recruiter productivity & KPI scorecards',
        'Full ATS implementation & workflow setup',
        'Standard Operating Procedures (SOP) development',
        'Live agency revenue & receivables dashboard',
        'Collections & DSO management protocols',
        'Monthly business revenue targets & reviews',
        'Multi-client scaling & growth strategy',
        'Hands-on handholding until independent operation',
      ],
      note: 'Guaranteed hands-on handholding until you can independently operate your recruitment firm.',
    },
    {
      id: 'mastery',
      name: 'Plan 3 — Business Mastery',
      badge: '🔴 ENTERPRISE & ADVISORY',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      tagline: 'Deep 1-to-1 consulting for serious entrepreneurs scaling past ₹1 Cr+ ARR',
      duration: '12 Months (1 Full Year)',
      priceRange: '₹1.50L – ₹2.50L / year',
      priceSubtitle: 'Annual bespoke 1-to-1 founder advisory & P&L consulting',
      bestFor: 'Serious entrepreneurs building multi-recruiter enterprise staffing firms',
      isHero: false,
      ctaText: 'Apply for Plan 3 (Mastery)',
      ctaStyle: 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400',
      features: [
        'Everything in Plan 2 (Accelerator) PLUS:',
        'Weekly 1-to-1 private founder strategy call',
        'Bespoke enterprise sales strategy',
        'Large corporate client acquisition support',
        'Recruitment operations optimization',
        'Recruiter team building & leadership hiring',
        'Custom executive business MIS dashboard',
        'Pricing & commercial rate card optimization',
        'Client retention & annual account expansion',
        'RPO (Recruitment Process Outsourcing) model setup',
        'Retainer client contract structures',
        'Expanding into multiple industry verticals',
        'Process automation & AI copilot integration',
        'Monthly P&L financial review & audit',
        'Customized 12-month agency growth blueprint',
        'Direct WhatsApp founder hotline support',
        'Business crisis & rapid problem-solving support',
      ],
      note: 'Elite VIP tier limited to 5 high-growth agency founders per quarter.',
    },
  ]

  // Comparison Matrix Rows
  const comparisonCategories = [
    {
      name: '1. Foundation & Legal Setup',
      features: [
        { label: 'Agency Business Model & Niche Selection', launch: true, acc: true, mastery: true },
        { label: 'Sole Prop / LLP / Pvt Ltd Setup Guidance', launch: true, acc: true, mastery: true },
        { label: 'GST, MSME & Compliance Blueprints', launch: true, acc: true, mastery: true },
        { label: 'Master Services Agreement (MSA) Templates', launch: true, acc: true, mastery: true },
        { label: 'Candidate Replacement Clause & Policy', launch: true, acc: true, mastery: true },
        { label: 'Brand, Website & Professional Email Setup', launch: true, acc: true, mastery: true },
      ],
    },
    {
      name: '2. Client Acquisition & Sales Engine',
      features: [
        { label: 'LinkedIn B2B Outbound System', launch: true, acc: true, mastery: true },
        { label: 'Cold Email & Cold Calling Scripts', launch: true, acc: true, mastery: true },
        { label: 'Client Lead Database Strategy', launch: true, acc: true, mastery: true },
        { label: 'Weekly Sales Pipeline & Deal Review', launch: false, acc: true, mastery: true },
        { label: 'Proposal & Commercial Pitch Deck Review', launch: false, acc: true, mastery: true },
        { label: 'Commercial Fee Negotiation Support', launch: false, acc: true, mastery: true },
        { label: 'RPO & Retainer Contract Structuring', launch: false, acc: false, mastery: true },
      ],
    },
    {
      name: '3. Recruitment Delivery & Tech Stack',
      features: [
        { label: 'Candidate Sourcing & Job Portal Strategy', launch: true, acc: true, mastery: true },
        { label: 'ATS / CRM Setup & Pipeline Setup', launch: 'Basic', acc: 'Full Implementation', mastery: 'Enterprise Workflow' },
        { label: 'Recruitment Fulfillment & Delivery Support', launch: false, acc: true, mastery: true },
        { label: 'Agency Standard Operating Procedures (SOPs)', launch: false, acc: true, mastery: true },
        { label: 'Process Automation & AI Copilot Integration', launch: false, acc: false, mastery: true },
      ],
    },
    {
      name: '4. Recruiter Hiring & Team Scaling',
      features: [
        { label: 'Recruiter Hiring & Screening Frameworks', launch: false, acc: true, mastery: true },
        { label: 'Commission & Incentive Scorecards', launch: false, acc: true, mastery: true },
        { label: 'Leadership & Team Lead Hiring', launch: false, acc: false, mastery: true },
        { label: 'Expansion into Multiple Verticals', launch: false, acc: false, mastery: true },
      ],
    },
    {
      name: '5. Mentorship & Founder Handholding',
      features: [
        { label: 'Program Duration', launch: '8 Weeks', acc: '6 Months', mastery: '12 Months' },
        { label: 'Price Range', launch: '₹29,999 – ₹39,999', acc: '₹75,000 – ₹99,000', mastery: '₹1.50L – ₹2.50L / yr' },
        { label: 'Mentoring Format', launch: 'Weekly Live Group', acc: 'Weekly Business Review + 1-on-1', mastery: 'Weekly Private 1-on-1 Founder Call' },
        { label: 'Monthly P&L & Revenue Dashboard Review', launch: false, acc: 'Revenue Dashboard', mastery: 'Full P&L Review' },
        { label: 'Handholding Till Independent Operation', launch: false, acc: true, mastery: true },
        { label: 'Direct WhatsApp Founder Hotline', launch: false, acc: false, mastery: true },
        { label: 'Business Crisis & Rapid Problem Solving', launch: false, acc: false, mastery: true },
      ],
    },
  ]

  // Curriculum Roadmap
  const roadmapPhases = [
    {
      phase: 'Phase 1',
      title: 'Business Architecture, Niche Selection & Legal Entity',
      duration: 'Weeks 1–2',
      badge: 'Build Foundation',
      summary:
        'Select your high-margin recruitment domain, structure profitable commercial models, incorporate your legal entity, and set up rock-solid contracts.',
      highlights: [
        'Evaluating high-billing sectors: IT, BFSI, Healthcare, Executive Search, and Remote Global Staffing.',
        'Entity incorporation: Sole Proprietorship vs LLP vs Private Limited for recruitment consultancies.',
        'GST, MSME (Udyam), current bank accounts, and invoice tax accounting.',
        'Drafting ironclad Master Services Agreements (MSAs), fee schedules, and candidate replacement clauses.',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Tech Infrastructure, ATS Setup & Database Architecture',
      duration: 'Weeks 3–4',
      badge: 'Deploy Tech',
      summary:
        'Deploy modern agency technology stacks, configure an enterprise ATS, set up recruiter email domains, and build your candidate sourcing engine.',
      highlights: [
        'Configuring Zoho Recruit, Recruit CRM, or Ceipal for candidate pipelines and client tracking.',
        'Setting up Google Workspace, professional domain emails, and high-deliverability DNS records.',
        'Cost-effective job portal subscriptions & shared CV database strategies.',
        'Standard Operating Procedures (SOPs) for candidate intake, screening, and submission profiles.',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'B2B Client Acquisition & Automated Outbound Sales Engine',
      duration: 'Weeks 5–8',
      badge: 'Acquire Clients',
      summary:
        'Build a predictable pipeline of corporate clients using LinkedIn Sales Navigator, automated cold email sequences, and high-converting phone discovery calls.',
      highlights: [
        'Mapping corporate CHROs, VP HRs, and Talent Acquisition Heads on LinkedIn.',
        'Writing 3-touch cold email sequences that deliver 40%+ open rates and 12%+ reply rates.',
        'Cold calling scripts and objection handling for corporate gatekeepers and HR leaders.',
        'Running client discovery meetings and positioning your agency as a high-value specialist.',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Commercial Negotiations, Deal Closings & High-Velocity Delivery',
      duration: 'Weeks 9–14',
      badge: 'Deliver & Collect',
      summary:
        'Negotiate favorable recruitment commercials (8.33% to 15%+), sign client MSAs, deliver shortlisted candidates in 48 hours, and collect invoices rapidly.',
      highlights: [
        'Commercial negotiation tactics: Securing 8.33%–15% fees and 30-day payment credit terms.',
        'Winning upfront retainer mandates and exclusive recruitment searches.',
        'Executing high-velocity 48-hour candidate delivery with personalized candidate pitch briefs.',
        'Managing post-offer engagement to prevent counter-offers, dropouts, and delayed joinings.',
        'Automated invoice dispatch, receivables follow-ups, and Day Sales Outstanding (DSO) management.',
      ],
    },
    {
      phase: 'Phase 5',
      title: 'Hiring Recruiters, Scaling Operations & Crossing ₹1 Crore ARR',
      duration: 'Weeks 15–24+',
      badge: 'Scale to ₹1 Cr+',
      summary:
        'Transition from a solo founder to an agency leader. Hire freelance and full-time recruiters, implement commission scorecards, and scale to multiple verticals.',
      highlights: [
        'Hiring freelance vs full-time recruiters: Sourcing, testing, and interview rubrics.',
        'Designing aggressive commission structures and weekly recruiter KPI scorecards.',
        'Building executive recruitment MIS dashboards in Excel and Looker Studio.',
        'Expanding into high-margin verticals, retained executive search, and annual RPO accounts.',
        'Managing cash flow, working capital, and executing the 12-month ₹1 Crore ARR roadmap.',
      ],
    },
  ]

  // FAQs
  const faqs = [
    {
      q: 'Which plan should I choose: Launch, Accelerator, or Mastery?',
      a: 'Plan 2 (Accelerator, ₹75,000 – ₹99,000) is our flagship and most recommended program for over 80% of founders. It provides 6 months of weekly business reviews, 1-to-1 mentoring, deal negotiation support, ATS implementation, and hands-on handholding until you can run your recruitment agency autonomously. If you only need initial 8-week setup guidance, Plan 1 (Launch, ₹29,999 – ₹39,999) is ideal. For high-growth founders seeking deep 1-to-1 consulting, P&L audits, and direct WhatsApp founder hotline access, choose Plan 3 (Mastery, ₹1.50L – ₹2.50L / yr).',
    },
    {
      q: 'Why are prices shown in ranges rather than fixed amounts?',
      a: 'Because every founder has different requirements: some require full Private Limited incorporation support, others already have an LLP or Proprietorship; some need intensive 1-on-1 candidate sourcing reviews, while others focus purely on enterprise B2B client acquisition. During your discovery call, our senior mentors customize the exact mentoring scope and match the right tier.',
    },
    {
      q: 'Can I start a recruitment agency alongside my current corporate job?',
      a: 'Yes, absolutely. Over 40% of founders in our cohorts begin as solo part-time consultants during evenings and weekends. Once you secure your first 2–3 paying corporate clients and build consistent monthly cash flow, you can safely transition to full-time agency operations.',
    },
    {
      q: 'Are government company incorporation and registration fees included in the program range?',
      a: 'No. Government incorporation and statutory filing fees (such as MCA, Stamp Duty, GST, Trademark, or MSME official fees) are paid directly to government portals or your CA and are separate. We provide complete step-by-step guidance and template documentation.',
    },
    {
      q: 'What contracts and legal templates are provided in the accelerator?',
      a: 'You receive our complete, battle-tested legal repository: Master Services Agreements (MSAs), commercial rate cards (8.33% to 20%), candidate replacement policy clauses, non-disclosure agreements (NDAs), consultant engagement agreements, and corporate invoice templates.',
    },
    {
      q: 'How long does it typically take to acquire the first paying corporate client?',
      a: 'Founders who diligently implement our LinkedIn B2B outbound workflows and cold email sequences typically secure their first discovery meetings within Weeks 3–4 and close their first signed client agreement within 6–8 weeks.',
    },
    {
      q: 'How does the commercial negotiation support work in Plan 2 (Accelerator)?',
      a: 'When an enterprise client requests your commercial terms, our senior mentors personally review your proposal, advise on fee percentages (8.33% to 15%), review payment credit terms, and join pre-negotiation prep calls so you never undercharge or sign unfavorable terms.',
    },
    {
      q: 'Do I need a large capital investment or an office to start?',
      a: 'No! A recruitment consultancy is one of the highest margin, lowest capex businesses you can launch. You only need a laptop, phone, professional email, and an internet connection. Most founders operate 100% remotely with near-zero overhead.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* ── Enquiry / Enrollment Modal ── */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCourse={`Recruitment Business Accelerator [${selectedPlanForModal}]`}
        defaultMode="online"
      />

      {/* ── Top Announcement & Urgency Bar ── */}
      <div className="bg-slate-900 text-white font-medium text-xs sm:text-sm py-2.5 px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-center gap-2.5 flex-wrap">
          <span className="bg-amber-400 text-slate-950 text-[11px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
            Upcoming Cohort
          </span>
          <span className="text-slate-200">
            Applications Open • Limited to 15 Agency Founders per Cohort
          </span>
          <button
            onClick={() => openEnrollModal('Plan 2 — Accelerator (₹75,000 – ₹99,000)')}
            className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer transition-colors"
          >
            Apply for Accelerator (Plan 2) →
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          1. REFINED LUXURY HERO SECTION
      ══════════════════════════════════════════════ */}
      <header className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border-b border-slate-200">
        {/* Soft elegant warm ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-amber-400/10 via-blue-500/5 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-400/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
            {/* Top Prestige Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs md:text-sm font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>THE VENTURE-GRADE RECRUITMENT AGENCY ACCELERATOR</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
              Recruitment Business{' '}
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                Accelerator
              </span>
            </h1>

            {/* Bold Tagline */}
            <div className="flex items-center justify-center flex-wrap gap-2 text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              <span>Build.</span>
              <span className="text-amber-500">•</span>
              <span>Launch.</span>
              <span className="text-amber-500">•</span>
              <span>Acquire Clients.</span>
              <span className="text-amber-500">•</span>
              <span>Deliver.</span>
              <span className="text-amber-500">•</span>
              <span className="text-amber-600 font-black">Scale.</span>
            </div>

            {/* Sub-headline */}
            <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl font-normal">
              From Zero to a Profitable Recruitment Agency — The comprehensive blueprint, ironclad legal frameworks, 
              predictable B2B corporate client acquisition engines, and hands-on founder mentoring to scale past ₹1 Crore ARR.
            </p>

            {/* Proof Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-3xl pt-2">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
                <div className="text-lg sm:text-2xl font-black text-slate-900">8.33%–15%</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Commercial Fee Rate</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
                <div className="text-lg sm:text-2xl font-black text-amber-600">₹80K – ₹1.5L</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Avg Single Placement</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
                <div className="text-lg sm:text-2xl font-black text-slate-900">6 Months</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Hero Incubation Tier</div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm text-center">
                <div className="text-lg sm:text-2xl font-black text-emerald-600">1-to-1</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Founder Deal Reviews</div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <a
                href="#pricing-tiers"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base tracking-wide shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>View 3-Tier Pricing Plans</span>
                <ArrowRight className="w-5 h-5 text-amber-400" />
              </a>

              <button
                onClick={() => openEnrollModal('Recruitment Business Accelerator (Hero Consultation)')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-500" />
                <span>Request Founder Consultation</span>
              </button>
            </div>

            {/* Trust Micro-Points */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real Agency Blueprints
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready-to-Use Client Contracts
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-on-1 Commercial Negotiation Support
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          2. THE RECRUITMENT CONSULTANCY ADVANTAGE
      ══════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
              Why Launch a Recruitment Consultancy?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Recruitment is one of the highest margin, lowest capital businesses in existence. 
              You monetize specialized domain knowledge, recruitment frameworks, and executive networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">High-Ticket Commercials</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standard recruitment fees range from <strong>8.33% to 15%+</strong> of candidate annual CTC. 
                Closing just 2 mid-level positions (₹12 Lakh CTC) yields ₹2 Lakhs in gross billing.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Near-Zero Capital Expenditure</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No physical inventory or expensive commercial leases. 
                Start with your laptop, phone, professional email, and an ATS pipeline. Operate 100% remotely.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Compounding Scalability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scale from a solo founder to an agency with commission-based recruiters. 
                Add high-margin RPO contracts, executive headhunting, and expand into global cross-border hiring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. REFINED 3-TIER PRICING (WITH PRICE RANGES)
      ══════════════════════════════════════════════ */}
      <section id="pricing-tiers" className="py-20 md:py-28 bg-[#F8FAFC] relative scroll-mt-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
              Select Your Accelerator Track
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight mb-4">
              Professional 3-Tier Investment Plans
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Transparent investment ranges tailored to your growth stage. 
              <strong> Plan 2 (Accelerator)</strong> is the highly recommended choice for founders aiming for full operational independence.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
            {plans.map((plan) => {
              const isHero = plan.isHero

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-3xl transition-all relative ${
                    isHero
                      ? 'bg-slate-900 text-white border-2 border-amber-400 shadow-2xl shadow-slate-900/30 lg:-translate-y-4 ring-4 ring-amber-400/20'
                      : 'bg-white text-slate-900 border border-slate-200 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Hero Most Popular Ribbon */}
                  {isHero && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider py-1 px-4 sm:px-6 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                      <Flame className="w-3.5 h-3.5 fill-slate-950" />
                      <span>RECOMMENDED • HERO CHOICE</span>
                    </div>
                  )}

                  {/* Header Area */}
                  <div
                    className={`p-5 sm:p-8 border-b flex flex-col gap-4 ${
                      isHero ? 'border-slate-800' : 'border-slate-100'
                    }`}
                  >
                    {/* Badge & Duration */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase px-2.5 sm:px-3 py-1 rounded-full border ${plan.badgeBg}`}>
                        {plan.badge}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          isHero ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {plan.duration}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-black ${isHero ? 'text-white' : 'text-slate-950'}`}>
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm mt-1.5 min-h-[36px] ${
                          isHero ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price Range Display */}
                    <div className="pt-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Investment Range:
                      </div>
                      <div className={`text-2xl sm:text-4xl font-black tracking-tight ${isHero ? 'text-amber-400' : 'text-slate-900'}`}>
                        {plan.priceRange}
                      </div>
                      <div
                        className={`text-xs mt-1.5 font-medium ${
                          isHero ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {plan.priceSubtitle}
                      </div>
                    </div>

                    {/* Best For Box */}
                    <div
                      className={`rounded-xl p-3 text-xs leading-relaxed border ${
                        isHero
                          ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold">Best for: </span>
                      {plan.bestFor}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => openEnrollModal(`${plan.name} (${plan.priceRange})`)}
                      className={`w-full min-h-[46px] py-3 sm:py-3.5 rounded-xl font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${plan.ctaStyle}`}
                    >
                      <span>{plan.ctaText}</span>
                    </button>
                  </div>

                  {/* Feature Deliverables List */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div
                        className={`text-xs font-bold tracking-wider uppercase mb-4 ${
                          isHero ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Program Inclusions ({plan.features.length} Deliverables):
                      </div>

                      <ul className="space-y-2.5">
                        {plan.features.map((feat, idx) => {
                          const isHeader = feat.startsWith('Everything')
                          return (
                            <li
                              key={idx}
                              className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                                isHeader
                                  ? isHero
                                    ? 'font-bold text-amber-300 pt-1 pb-1 border-b border-slate-800'
                                    : 'font-bold text-slate-900 pt-1 pb-1 border-b border-slate-200'
                                  : isHero
                                  ? 'text-slate-300'
                                  : 'text-slate-700'
                              }`}
                            >
                              <CheckCircle2
                                className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  isHero ? 'text-amber-400' : 'text-emerald-600'
                                }`}
                              />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    {/* Footer Note */}
                    <div
                      className={`mt-6 pt-4 border-t text-[11px] italic ${
                        isHero ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      {plan.note}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Consultation Ribbon below pricing */}
          <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 max-w-4xl mx-auto shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Need guidance on the exact plan & price range?</h4>
                <p className="text-xs text-slate-600">
                  Speak directly with our senior agency advisors to evaluate your current domain and customize your roadmap.
                </p>
              </div>
            </div>
            <button
              onClick={() => openEnrollModal('Recruitment Business Accelerator [Advisor Consultation]')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              Book 1-on-1 Guidance Call
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. SIDE-BY-SIDE PLAN COMPARISON MATRIX
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              Feature-by-Feature Matrix
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">
              Detailed Plan Comparison
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A transparent breakdown of capabilities, deliverables, and mentoring intensity across all 3 accelerator tiers.
            </p>
          </div>

          {/* Mobile swipe helper */}
          <div className="md:hidden flex items-center justify-center gap-1.5 mb-3 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mx-auto w-max">
            <span>← Scroll sideways to compare all plans →</span>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-4 text-sm font-bold text-slate-800 w-2/5">Capabilities & Deliverables</th>
                  <th className="py-4 px-4 text-center text-sm font-bold text-emerald-800 w-1/5 bg-slate-100/60">
                    Plan 1: Launch
                    <div className="text-[11px] font-medium text-slate-500">8 Wks • ₹29,999 – ₹39,999</div>
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-bold text-slate-950 w-1/5 bg-amber-50 border-x-2 border-amber-400">
                    Plan 2: Accelerator
                    <div className="text-[11px] font-black text-amber-700">Recommended • ₹75,000 – ₹99,000</div>
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-bold text-rose-800 w-1/5 bg-slate-100/60">
                    Plan 3: Mastery
                    <div className="text-[11px] font-medium text-slate-500">12 Mo • ₹1.50L – ₹2.50L / yr</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {comparisonCategories.map((category, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-slate-100/80">
                      <td
                        colSpan={4}
                        className="py-3 px-4 font-black text-slate-800 tracking-wider uppercase text-xs"
                      >
                        {category.name}
                      </td>
                    </tr>
                    {category.features.map((item, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          {item.label}
                        </td>
                        
                        {/* Plan 1 */}
                        <td className="py-3.5 px-4 text-center bg-slate-50/40">
                          {typeof item.launch === 'boolean' ? (
                            item.launch ? (
                              <Check className="w-5 h-5 text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )
                          ) : (
                            <span className="font-semibold text-slate-700">{item.launch}</span>
                          )}
                        </td>

                        {/* Plan 2 (Hero) */}
                        <td className="py-3.5 px-4 text-center bg-amber-50/60 border-x-2 border-amber-300">
                          {typeof item.acc === 'boolean' ? (
                            item.acc ? (
                              <Check className="w-5 h-5 text-amber-600 font-black mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )
                          ) : (
                            <span className="font-extrabold text-slate-900">{item.acc}</span>
                          )}
                        </td>

                        {/* Plan 3 */}
                        <td className="py-3.5 px-4 text-center bg-slate-50/40">
                          {typeof item.mastery === 'boolean' ? (
                            item.mastery ? (
                              <Check className="w-5 h-5 text-rose-600 mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )
                          ) : (
                            <span className="font-semibold text-slate-700">{item.mastery}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => openEnrollModal('Plan 2 — Accelerator (₹75,000 – ₹99,000)')}
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
            >
              Get Started with Plan 2 (Accelerator)
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. FIVE-PHASE BUSINESS ROADMAP (CURRICULUM)
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              Action-Oriented Curriculum
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">
              The 5-Phase Agency Scaling Roadmap
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A chronological operational framework built on real-world agency workflows — not academic theory.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {roadmapPhases.map((phase, idx) => {
              const isOpen = openPhase === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenPhase(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            {phase.phase} • {phase.duration}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {phase.badge}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-950">
                          {phase.title}
                        </h3>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm bg-slate-50/50">
                      <p className="text-slate-700 mb-4 leading-relaxed">
                        {phase.summary}
                      </p>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                          Key Execution Deliverables:
                        </h4>
                        <ul className="space-y-2">
                          {phase.highlights.map((item, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          6. INTERACTIVE ROI & UNIT ECONOMICS CALCULATOR
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
                <Calculator className="w-3.5 h-3.5" />
                Unit Economics Model
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">
                Recruitment Agency Revenue Calculator
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                See how just <strong>1 to 2 closed candidate placements</strong> can recoup your entire accelerator investment.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Sliders Input */}
                <div className="space-y-6">
                  {/* Slider 1: Average CTC */}
                  <div>
                    <div className="flex justify-between items-center text-sm font-semibold mb-2">
                      <span className="text-slate-700">Average Candidate CTC:</span>
                      <span className="text-slate-950 font-bold">₹{(averageCtc / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <input
                      type="range"
                      min={400000}
                      max={3000000}
                      step={100000}
                      value={averageCtc}
                      onChange={(e) => setAverageCtc(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>₹4L (Junior)</span>
                      <span>₹15L (Mid)</span>
                      <span>₹30L (Senior)</span>
                    </div>
                  </div>

                  {/* Slider 2: Commission Percentage */}
                  <div>
                    <div className="flex justify-between items-center text-sm font-semibold mb-2">
                      <span className="text-slate-700">Commercial Fee Percentage:</span>
                      <span className="text-slate-950 font-bold">{commissionRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={8.33}
                      max={15}
                      step={0.5}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>8.33% (1 Month Gross)</span>
                      <span>10% (Specialized)</span>
                      <span>15% (Leadership)</span>
                    </div>
                  </div>

                  {/* Slider 3: Monthly Placements */}
                  <div>
                    <div className="flex justify-between items-center text-sm font-semibold mb-2">
                      <span className="text-slate-700">Monthly Placements:</span>
                      <span className="text-slate-950 font-bold">{monthlyPlacements} Hires / Month</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={1}
                      value={monthlyPlacements}
                      onChange={(e) => setMonthlyPlacements(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>1 (Solo Starter)</span>
                      <span>5 (Active Agency)</span>
                      <span>15 (Small Team)</span>
                    </div>
                  </div>
                </div>

                {/* Output Cards */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="text-xs text-slate-500 font-medium">Single Placement Revenue:</div>
                    <div className="text-2xl font-bold text-slate-950 mt-1">
                      ₹{feePerPlacement.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      1 placement completely covers the Plan 2 (Accelerator) fee range!
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-4">
                    <div className="text-xs text-slate-500 font-medium">Monthly Gross Billing:</div>
                    <div className="text-3xl font-extrabold text-amber-600 mt-1">
                      ₹{monthlyRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Based on {monthlyPlacements} hires at {commissionRate}% commission
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-medium">Annualized Projected Revenue (ARR):</div>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                      ₹{(annualRevenue / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Target: Cross ₹1 Crore ARR by scaling recruiter capacity to 8–10 closures/month.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. AGENCY TOOLKIT DELIVERABLES INCLUDED
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              Assets & Intellectual Property
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">
              The Complete Agency IP Toolkit
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Every founder receives our proprietary repository of commercial contracts, cold pitch scripts, and ATS blueprints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Legal Contracts & MSAs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Battle-tested Master Services Agreements, 90-day replacement clauses, commercial rate cards, and NDAs.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">B2B Cold Pitch Playbook</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                40+ battle-tested cold email and LinkedIn message templates with proven 40%+ open rates and objection-handling scripts.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">ATS Setup Blueprints</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plug-and-play candidate submission formats, recruiter workflow stages, and email trigger automations.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Recruiter Hiring Kits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiter interview assessment rubrics, commission structure calculators, and daily activity scorecards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          8. FOUNDER MENTORSHIP & GOVERNANCE
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                  Hands-On Founder Incubation
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  Learn Directly From Leaders Who Scaled Multi-Crore Agencies
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  We don't leave you with generic recorded videos. In <strong>Plan 2 (Accelerator)</strong>, our mentors 
                  join your deal prep sessions, review your corporate client proposals, analyze your candidate pipelines, 
                  and guide you until you can independently manage operations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => openEnrollModal('Recruitment Business Accelerator [Hero Consultation]')}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm transition-colors cursor-pointer"
                  >
                    Schedule Founder Discovery Call →
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="text-xl font-bold text-amber-400">Weekly Reviews</div>
                  <div className="text-xs text-slate-300 mt-1">Live deal audits & pipeline problem solving</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="text-xl font-bold text-white">Proposal Reviews</div>
                  <div className="text-xs text-slate-300 mt-1">Ensure high commercial fee structures (8.33%–15%)</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                  <div className="text-xl font-bold text-emerald-400">WhatsApp Hotline</div>
                  <div className="text-xs text-slate-300 mt-1">Direct rapid crisis guidance for active deals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          9. FREQUENTLY ASKED QUESTIONS (FAQ)
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F8FAFC] border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              Clarifications & Details
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Everything you need to know about program structure, pricing ranges, legal compliance, and commercial guidance.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-900">
                      {faq.q}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          10. FINAL CALL TO ACTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-200 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 mb-4">
            Ready to Build Your Own Profitable Recruitment Firm?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
            Join the upcoming cohort of recruitment entrepreneurs. Secure your spot in the 
            <strong> Recruitment Business Accelerator</strong> today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openEnrollModal('Plan 2 — Accelerator (₹75,000 – ₹99,000)')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base tracking-wide shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              Apply for Plan 2 (Accelerator) →
            </button>
            <a
              href="#pricing-tiers"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-base border-2 border-slate-300 hover:border-slate-400 transition-colors"
            >
              Compare All 3 Plans
            </a>
          </div>

          <div className="text-xs text-slate-500 mt-6">
            Applications evaluated on domain background and founder commitment.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          11. STICKY ENROLLMENT FOOTER BAR (MOBILE & DESKTOP)
      ══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 px-4 shadow-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Hero Recommendation
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Plan 2 — Accelerator (6 Months)
              </div>
            </div>
            <div className="sm:hidden">
              <div className="text-xs font-bold text-slate-900">Plan 2 — Accelerator</div>
              <div className="text-xs font-black text-amber-600">₹75,000 – ₹99,000</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-base font-black text-slate-950">₹75,000 – ₹99,000</div>
              <div className="text-[10px] text-slate-500 font-medium">6 Months Handholding</div>
            </div>

            <button
              onClick={() => openEnrollModal('Plan 2 — Accelerator (₹75,000 – ₹99,000 | Sticky Bar)')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              Apply for Accelerator →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
