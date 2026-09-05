'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Cpu,
  Bot,
  Zap,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shield,
  Award,
  Users,
  Layers,
  Clock,
  Star,
  MessageSquare,
  Phone,
  ExternalLink,
  FileText,
  Check,
  Search,
  Share2,
  GraduationCap,
  Calendar,
  TrendingUp,
  BookOpen,
  Briefcase,
  SlidersHorizontal,
  Compass,
  Laptop,
  Building2,
  CheckCheck,
  Flame,
  HelpCircle,
} from 'lucide-react'
import type { DynamicCourseData } from '@/lib/services/courseDataService'

interface Props {
  course: DynamicCourseData
}

export default function AiForRecruitmentLandingClient({ course }: Props) {
  // Pricing toggle: 'online' | 'offline'
  const [pricingMode, setPricingMode] = useState<'online' | 'offline'>('online')

  // Curriculum accordion state (open module indexes)
  const [openModules, setOpenModules] = useState<number[]>([0, 1])

  // FAQ accordion state
  const [openFaqs, setOpenFaqs] = useState<number[]>([0, 1])

  // Selected lifecycle stage in pipeline
  const [activeStage, setActiveStage] = useState<number>(0)

  // Quick enroll modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '1-3 years',
    preferredMode: 'online',
  })
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  function toggleModule(idx: number) {
    setOpenModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  function toggleAllModules() {
    if (openModules.length === course.curriculum.length) {
      setOpenModules([])
    } else {
      setOpenModules(course.curriculum.map((_, i) => i))
    }
  }

  function toggleFaq(idx: number) {
    setOpenFaqs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnrollSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enrollForm.name,
          email: enrollForm.email,
          phone: enrollForm.phone,
          courseInterest: `AI for Recruitment (${pricingMode.toUpperCase()})`,
          notes: `Experience: ${enrollForm.experience}, Preferred Mode: ${pricingMode}`,
        }),
      })
      if (res.ok) {
        setEnrollSuccess(true)
      } else {
        window.location.href = `/contact?course=AI%20for%20Recruitment&mode=${pricingMode}&name=${encodeURIComponent(enrollForm.name)}&email=${encodeURIComponent(enrollForm.email)}`
      }
    } catch {
      setEnrollSuccess(true)
    } finally {
      setEnrollSubmitting(false)
    }
  }

  // Pricing calculations
  const onlineBase = course.pricing.online?.baseFee || 9999
  const onlineFinal = course.pricing.online?.finalFee || 4999
  const onlineDiscount = course.pricing.online?.discountPercent || 50
  const onlineEmi = Math.round(onlineFinal / 3)

  const offlineBase = course.pricing.offline?.baseFee || 12999
  const offlineFinal = course.pricing.offline?.finalFee || 9999
  const offlineDiscount = course.pricing.offline?.discountPercent || 23
  const offlineEmi = Math.round(offlineFinal / 3)

  const currentFinalPrice = pricingMode === 'online' ? onlineFinal : offlineFinal
  const currentBasePrice = pricingMode === 'online' ? onlineBase : offlineBase
  const currentDiscount = pricingMode === 'online' ? onlineDiscount : offlineDiscount
  const currentEmi = pricingMode === 'online' ? onlineEmi : offlineEmi

  // 7-Stage Recruitment Lifecycle Pipeline
  const PIPELINE_STAGES = [
    {
      step: '01',
      title: 'JD & Intake Formulation',
      subtitle: 'From Client Brief to Ironclad Persona',
      description:
        'Deconstruct unstructured hiring manager briefs into comprehensive Candidate Personas, Competency Matrices, and high-converting, bias-free Job Descriptions in under 90 seconds.',
      tools: ['ChatGPT-4o', 'Claude 3.5 Sonnet', 'Intake Prompt Chaining'],
      output: 'Full JD + Competency Rubric + Qualifying Pre-Screening Questions',
      metric: '85% Faster Requisition Intake',
    },
    {
      step: '02',
      title: 'Boolean & X-Ray Sourcing',
      subtitle: 'Uncover Passive High-Caliber Talent',
      description:
        'Generate multi-layered Boolean strings, Google X-Ray scripts, and synonym taxonomies across LinkedIn, GitHub, Behance, and conference rosters to find top 5% passive candidates before competitors.',
      tools: ['Google X-Ray Engine', 'Boolean AI Generator', 'LinkedIn AI Search'],
      output: '10 Custom Boolean Strings + Alternative Skill Taxonomy',
      metric: '4x Greater Sourcing Reach',
    },
    {
      step: '03',
      title: 'Resume Screening & Scoring',
      subtitle: 'Objective Skill-Gap & Match Matrix',
      description:
        'Run deep resume vs JD compatibility audits, calculate weighted skill-match percentages, flag career trajectory inconsistencies, and build executive candidate submission memos with human oversight.',
      tools: ['AI Resume Rankers', 'Skill-Gap Audit Models', 'Human-in-the-Loop Safeguards'],
      output: 'Shortlist Evaluation Scorecards & Rejection Justifications',
      metric: '60% Reduction in Screening Hours',
    },
    {
      step: '04',
      title: 'Hyper-Personalized Outreach',
      subtitle: 'Multichannel Messaging that Converts',
      description:
        'Craft hyper-personalized 5-stage outreach sequences tailored to each candidate’s career background across LinkedIn InMail, Cold Email, and WhatsApp that skyrocket response rates.',
      tools: ['LinkedIn InMail AI Copilot', 'Multi-Touch Drip Sequences', 'WhatsApp Workflows'],
      output: 'Complete 5-Stage Candidate Communication Matrix',
      metric: '3x Higher Candidate Reply Rate',
    },
    {
      step: '05',
      title: 'Competency & STAR Interviews',
      subtitle: 'Structured Evaluation with Zero Bias',
      description:
        'Generate calibrated STAR (Situation, Task, Action, Result) behavioral questions, scenario drills, and weighted 1–5 scoring rubrics to help hiring managers make confident, standardized hiring decisions.',
      tools: ['STAR Behavioral Framework', 'Calibration Rubrics', 'Take-Home Prompts'],
      output: '30 Tailored Interview Questions + Panel Scorecards',
      metric: 'Zero-Bias Standardized Feedback',
    },
    {
      step: '06',
      title: 'MIS & Daily Ops Automation',
      subtitle: 'Turn Chores into Auto-Piloted Systems',
      description:
        'Automate recruitment MIS spreadsheets, generate instant meeting summaries, create SOPs, and build a personalized Daily Recruiter Operating System powered by no-code AI webhooks.',
      tools: ['Zapier / Make.com', 'Google Sheets AI', 'Voice-to-Text Meeting Summaries'],
      output: 'Executive C-Suite Dashboard & Daily Automated Agenda',
      metric: '10+ Hours Saved Every Week',
    },
    {
      step: '07',
      title: 'Capstone AI Playbook',
      subtitle: 'End-to-End Operational Mastery',
      description:
        'Synthesize all modules into your personal 14-deliverable AI Recruitment Playbook for a live difficult mandate, reviewed and endorsed by industry veteran talent leaders.',
      tools: ['14-Deliverable Framework', 'Mentor Review Board', 'QR-Verified Credential'],
      output: 'Verified Industry Credential & Live Operational Playbook',
      metric: '100% Industry Recognized',
    },
  ]

  return (
    <div
      style={{
        background: '#FFFFFF',
        color: '#0F172A',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .ri-primary-btn {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
          transition: all 0.2s ease;
        }
        .ri-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
        }
        .ri-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }
        .ri-card:hover {
          border-color: #BFDBFE;
          box-shadow: 0 12px 32px rgba(37, 99, 235, 0.08);
          transform: translateY(-2px);
        }
        .ri-hero-mesh {
          background-color: #FFFFFF;
          background-image: 
            radial-gradient(at 15% 15%, rgba(219, 234, 254, 0.6) 0px, transparent 50%),
            radial-gradient(at 85% 20%, rgba(238, 242, 255, 0.7) 0px, transparent 50%),
            radial-gradient(at 50% 80%, rgba(240, 253, 250, 0.5) 0px, transparent 50%);
        }
      `}</style>

      {/* ── 1. HERO SECTION ── */}
      <section
        className="ri-hero-mesh"
        style={{
          position: 'relative',
          padding: '80px 20px 70px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', textAlign: 'center' }}>
          {/* Top Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 100, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24 }}>
            <Sparkles style={{ width: 14, height: 14, color: '#2563EB' }} />
            <span>Become the Top 1% AI-Powered Recruiter · Next Cohort Enrolling</span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0F172A',
              maxWidth: 1040,
              margin: '0 auto 20px',
            }}
          >
            From Job Description to Joining:{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Master AI-Powered Recruitment
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 18.5px)',
              color: '#475569',
              maxWidth: 820,
              margin: '0 auto 32px',
              lineHeight: 1.65,
            }}
          >
            Don&apos;t let AI replace you — let AI upgrade you into the <strong>top 1%</strong> of high-speed recruiters.
            Learn prompt engineering, Boolean & X-Ray AI sourcing, automated resume screening,
            and no-code recruitment pipelines in 4 practical weeks.
          </p>

          {/* Trust Badges Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(10px, 2.5vw, 24px)',
              flexWrap: 'wrap',
              marginBottom: 36,
            }}
          >
            {[
              { icon: Star, text: '4.9/5 Rating (2,400+ Alumni)', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
              { icon: Clock, text: '4 Weeks | 8 Live Masterclasses', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
              { icon: Award, text: 'Verifiable AI Certification', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
              { icon: Building2, text: 'Live Online + Pune Classroom', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1E293B',
                  background: item.bg,
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: `1px solid ${item.border}`,
                }}
              >
                <item.icon style={{ width: 14, height: 14, color: item.color }} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginBottom: 44,
            }}
          >
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="ri-primary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 34px',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: 15.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>Enroll Now — Save {currentDiscount}%</span>
              <ArrowRight style={{ width: 17, height: 17 }} />
            </button>

            <a
              href={`https://wa.me/917385204165?text=${encodeURIComponent(
                'Hi Recruitment Institute, I want to learn more about the AI for Recruitment course & upcoming batch details.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 26px',
                borderRadius: 12,
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#15803D',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <MessageSquare style={{ width: 17, height: 17, color: '#16A34A' }} />
              <span>Talk to Mentor on WhatsApp</span>
            </a>
          </div>

          {/* 4 Feature stats strip */}
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: '18px 24px',
              borderRadius: 18,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {[
              { label: 'Comprehensive Syllabus', val: '14 Deep-Dive Modules' },
              { label: 'Curated Resource Kit', val: '50+ Recruiter Prompts' },
              { label: 'Real Sourcing Labs', val: '100% Practical & No-Code' },
              { label: 'Hands-On Deliverable', val: 'Complete Capstone Playbook' },
            ].map((stat, i) => (
              <div key={i} style={{ borderRight: i < 3 ? '1px solid #F1F5F9' : 'none' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.08em', margin: 0 }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', marginTop: 4, margin: 0 }}>
                  {stat.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. DYNAMIC PRICING TOGGLE SECTION ── */}
      <section
        id="pricing"
        style={{
          padding: '80px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Zap style={{ width: 13, height: 13 }} />
              Flexible Training Modes
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              Choose Your Learning Experience
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 640, margin: '0 auto' }}>
              Select between Live Virtual Masterclasses or Hands-on In-Person Classroom Training at our Pune campus.
            </p>

            {/* Mode Switcher */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#FFFFFF',
                padding: 6,
                borderRadius: 16,
                border: '1px solid #CBD5E1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                marginTop: 24,
                gap: 8,
              }}
            >
              <button
                onClick={() => setPricingMode('online')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  background: pricingMode === 'online' ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'transparent',
                  color: pricingMode === 'online' ? '#fff' : '#64748B',
                  boxShadow: pricingMode === 'online' ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Laptop style={{ width: 15, height: 15 }} />
                <span>Live Online (50% OFF)</span>
              </button>
              <button
                onClick={() => setPricingMode('offline')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  background: pricingMode === 'offline' ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'transparent',
                  color: pricingMode === 'offline' ? '#fff' : '#64748B',
                  boxShadow: pricingMode === 'offline' ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Building2 style={{ width: 15, height: 15 }} />
                <span>Classroom Pune (FC Road)</span>
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div
            style={{
              maxWidth: 820,
              margin: '0 auto',
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #BFDBFE',
              boxShadow: '0 12px 40px rgba(37, 99, 235, 0.08)',
              padding: 'clamp(24px, 4vw, 40px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 22,
                borderBottom: '1px solid #F1F5F9',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#D97706', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  <Flame style={{ width: 14, height: 14, color: '#EA580C' }} />
                  {pricingMode === 'online' ? 'Limited Early Bird Cohort Offer' : 'Intensive In-Person Lab Batch'}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {pricingMode === 'online' ? 'Live Interactive Virtual Masterclass' : 'Classroom Masterclass · Pune Campus'}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 15, color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{currentBasePrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#1E40AF', letterSpacing: '-0.02em' }}>
                    ₹{currentFinalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#059669', fontWeight: 700, margin: '2px 0 0' }}>
                  Save ₹{(currentBasePrice - currentFinalPrice).toLocaleString('en-IN')} ({currentDiscount}% Instant Discount)
                </p>
                <p style={{ fontSize: 11, color: '#64748B', marginTop: 2, margin: 0 }}>
                  or ₹{currentEmi.toLocaleString('en-IN')} / month (No-Cost 3-Mo EMI)
                </p>
              </div>
            </div>

            {/* Inclusions */}
            <div style={{ padding: '24px 0', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.08em', marginBottom: 14 }}>
                Everything Included In This Program:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {(pricingMode === 'online'
                  ? [
                      '8 Live Interactive Masterclasses (Zoom evenings, 16+ Hours)',
                      'Lifetime access to recordings, updates, and LMS modules',
                      'Full 50+ Recruiter Prompt Library & Cheat Sheets repository',
                      '14 Capstone Playbook Deliverables with mentor evaluation',
                      'Verifiable Certified AI Recruitment Professional credential',
                      'Direct WhatsApp Mastermind access with faculty & peers',
                    ]
                  : [
                      'In-Person Classroom Masterclasses at Pune (FC Road / Shivaji Nagar)',
                      'Direct live lab guidance & personalized prompt engineering drills',
                      '1-on-1 resume, career strategy & agency launch consultation',
                      'Physical printed toolkit binder + hardcopy embossed certificate',
                      'Complete online LMS recordings & digital prompt library access',
                      'Networking high tea sessions with corporate HR leaders & founders',
                    ]
                ).map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle2 style={{ width: 17, height: 17, color: '#2563EB', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>
                  Next Live Batch: <strong style={{ color: '#0F172A' }}>Starting Next Saturday</strong> · Weekday & Weekend Slots
                </p>
                <p style={{ fontSize: 11.5, color: '#DC2626', fontWeight: 700, marginTop: 3, margin: 0 }}>
                  ⚠️ Only 6 Seats Remaining in this Cohort
                </p>
              </div>

              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="ri-primary-btn"
                style={{
                  padding: '13px 26px',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 14.5,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Enroll Now · ₹{currentFinalPrice.toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHAT YOU WILL MASTER (7-STAGE PIPELINE) ── */}
      <section
        style={{
          padding: '80px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Compass style={{ width: 13, height: 13 }} />
              End-to-End Recruitment Lifecycle
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              What You Will Master: The 7-Stage AI Pipeline
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
              From the instant a job requisition arrives to the final joining day — master every milestone with AI.
            </p>
          </div>

          {/* Stage Selector Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 32,
            }}
          >
            {PIPELINE_STAGES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStage(idx)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  border: '1px solid',
                  borderColor: activeStage === idx ? '#2563EB' : '#E2E8F0',
                  background: activeStage === idx ? '#EFF6FF' : '#FFFFFF',
                  color: activeStage === idx ? '#1D4ED8' : '#64748B',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 11, color: activeStage === idx ? '#2563EB' : '#94A3B8', fontWeight: 800 }}>
                  {s.step}
                </span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Stage Detailed Spotlight Panel */}
          {(() => {
            const cur = PIPELINE_STAGES[activeStage]
            return (
              <div
                style={{
                  borderRadius: 24,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: 'clamp(24px, 4vw, 40px)',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: 32,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#2563EB', fontSize: 12.5, fontWeight: 800, marginBottom: 10 }}>
                    <span>STAGE {cur.step} OF 07</span>
                    <span>·</span>
                    <span style={{ color: '#64748B' }}>{cur.subtitle}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>
                    {cur.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.65, marginBottom: 20 }}>
                    {cur.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Bot style={{ width: 16, height: 16, color: '#2563EB' }} />
                      <span style={{ fontSize: 13, color: '#64748B' }}>
                        Tools Practiced: <strong style={{ color: '#0F172A' }}>{cur.tools.join(', ')}</strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText style={{ width: 16, height: 16, color: '#059669' }} />
                      <span style={{ fontSize: 13, color: '#64748B' }}>
                        Hands-On Output: <strong style={{ color: '#0F172A' }}>{cur.output}</strong>
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '7px 14px',
                      borderRadius: 8,
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#047857',
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    <TrendingUp style={{ width: 14, height: 14 }} />
                    <span>Real-World Benchmark: {cur.metric}</span>
                  </div>
                </div>

                {/* Right Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 18,
                    padding: 24,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      PRACTICAL RECRUITMENT DELIVERABLE
                    </span>
                    <span style={{ fontSize: 10, background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      PLAYBOOK
                    </span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                    {cur.output}
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.55, marginBottom: 16 }}>
                    Students produce this exact deliverable during live drills, receiving individualized feedback and grading from mentors.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Included in Capstone</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>Stage {cur.step} of 07 →</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ── 4. FULL 14-MODULE CURRICULUM ACCORDION ── */}
      <section
        id="curriculum"
        style={{
          padding: '80px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <BookOpen style={{ width: 13, height: 13 }} />
              Structured 14-Module Syllabus
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              The Complete Curriculum
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 680, margin: '0 auto 18px' }}>
              14 modules engineered from foundational prompt frameworks to autonomous no-code recruitment automation.
            </p>

            <button
              onClick={toggleAllModules}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                padding: '7px 16px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {openModules.length === course.curriculum.length ? 'Collapse All Modules' : 'Expand All 14 Modules'}
            </button>
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {course.curriculum.map((mod, idx) => {
              const isOpen = openModules.includes(idx)
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid',
                    borderColor: isOpen ? '#BFDBFE' : '#E2E8F0',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 4px 18px rgba(37,99,235,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isOpen ? '#2563EB' : '#F1F5F9',
                          color: isOpen ? '#fff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {mod.duration || `Module ${idx + 1}`}
                        </span>
                        <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                      {isOpen ? (
                        <ChevronUp style={{ width: 17, height: 17, color: '#2563EB' }} />
                      ) : (
                        <ChevronDown style={{ width: 17, height: 17, color: '#94A3B8' }} />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 22px 22px',
                        borderTop: '1px solid #F1F5F9',
                        marginTop: 2,
                      }}
                    >
                      {mod.description && (
                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '12px 0 14px' }}>
                          {mod.description}
                        </p>
                      )}

                      <p style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Topics & Frameworks Explored:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {mod.details.map((detail, dIdx) => (
                          <li key={dIdx} style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {mod.practicalActivity && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: '#F0F9FF',
                            border: '1px solid #BAE6FD',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                          }}
                        >
                          <Zap style={{ width: 15, height: 15, color: '#0284C7', marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#0369A1', letterSpacing: '0.06em' }}>
                              Hands-On Practical Lab
                            </span>
                            <p style={{ fontSize: 13, color: '#0C4A6E', margin: '2px 0 0', lineHeight: 1.4 }}>
                              {mod.practicalActivity}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. WHO SHOULD JOIN (6 PERSONAS) ── */}
      <section
        style={{
          padding: '80px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                color: '#7C3AED',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Users style={{ width: 13, height: 13 }} />
              Target Demographics
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              Who Should Join This Program?
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
              Designed for professionals across the talent ecosystem who want practical, battle-tested AI capabilities.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 18,
            }}
          >
            {course.whoShouldEnroll.map((item, idx) => (
              <div
                key={idx}
                className="ri-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 13.5,
                    }}
                  >
                    0{idx + 1}
                  </div>
                  <h4 style={{ fontSize: 16.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {item.role}
                  </h4>
                </div>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AI RECRUITER TOOLKIT & PLATFORMS COVERED ── */}
      <section
        style={{
          padding: '80px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Cpu style={{ width: 13, height: 13 }} />
              2026 Tech Stack
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              AI Recruiter Toolkit & Platforms Covered
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
              Learn to navigate leading foundation models and purpose-built recruitment copilots.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
            }}
          >
            {course.toolsCovered.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  border: '1px solid #E2E8F0',
                  padding: 22,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                }}
              >
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  {cat.category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.tools.map((tool, tIdx) => (
                    <div
                      key={tIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      <Check style={{ width: 13, height: 13, color: '#059669' }} />
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. MEASURABLE LEARNING OUTCOMES ── */}
      <section
        style={{
          padding: '80px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#B45309',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <Award style={{ width: 13, height: 13 }} />
              Guaranteed ROI
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              Measurable Learning Outcomes
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', maxWidth: 680, margin: '0 auto' }}>
              Concrete, quantifiable skills you will deploy immediately in your daily workflow.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {course.learningOutcomes.map((outcome, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  ✓
                </div>
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. VERIFIABLE CERTIFICATION SHOWCASE ── */}
      <section
        style={{
          padding: '80px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
              padding: 'clamp(26px, 4vw, 44px)',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: 32,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#B45309',
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                <Award style={{ width: 14, height: 14 }} />
                Accredited Credential
              </div>

              <h3 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.25, marginBottom: 14 }}>
                Certified AI Recruitment Professional (CAIRP)
              </h3>
              <p style={{ fontSize: 14.5, color: '#64748B', lineHeight: 1.6, marginBottom: 18 }}>
                Every graduate earns a verifiable credential recognized by hiring organizations, staffing firms, and executive search teams.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {course.certificationDetails.bullets.map((b, bIdx) => (
                  <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>{b}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="ri-primary-btn"
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Enroll to Claim Your Certificate
              </button>
            </div>

            {/* Certificate Visual Mockup */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 18,
                padding: '26px 22px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '3px solid #E2E8F0',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: 10, marginBottom: 14 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                    RECRUITMENT INSTITUTE
                  </h4>
                  <p style={{ fontSize: 9.5, color: '#64748B', margin: '2px 0 0' }}>Centre for Talent Acquisition Excellence</p>
                </div>
                <Award style={{ width: 26, height: 26, color: '#B45309' }} />
              </div>

              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748B' }}>
                  Certificate of Achievement
                </span>
                <p style={{ fontSize: 11.5, color: '#475569', margin: '4px 0 2px' }}>This is to certify that</p>
                <h5 style={{ fontSize: 17, fontWeight: 900, color: '#1E3A8A', margin: '4px 0 6px', fontFamily: 'Georgia, serif' }}>
                  YOUR NAME HERE
                </h5>
                <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.4, margin: '0 auto 10px', maxWidth: 300 }}>
                  has demonstrated rigorous mastery of Generative AI, Sourcing Automations, and Prompt Engineering in the flagship program
                </p>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', display: 'block' }}>
                  Certified AI Recruitment Professional
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E2E8F0', marginTop: 10 }}>
                <div>
                  <span style={{ fontSize: 8.5, color: '#94A3B8', display: 'block' }}>VERIFICATION ID</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#0F172A' }}>RI-AI-2026-CERT</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: 6, color: '#059669', fontSize: 9.5, fontWeight: 800 }}>
                  <span>✓ QR VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. INTERACTIVE FAQS ── */}
      <section
        id="faqs"
        style={{
          padding: '80px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              <HelpCircle style={{ width: 13, height: 13 }} />
              Got Questions?
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', margin: '0 0 10px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
              Everything you need to know about the curriculum, schedule, tools, and certification.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {course.faqs.map((faq, idx) => {
              const isOpen = openFaqs.includes(idx)
              return (
                <div
                  key={idx}
                  style={{
                    background: isOpen ? '#F8FAFC' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: isOpen ? '#BFDBFE' : '#E2E8F0',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', paddingRight: 14 }}>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp style={{ width: 17, height: 17, color: '#2563EB', flexShrink: 0 }} />
                    ) : (
                      <ChevronDown style={{ width: 17, height: 17, color: '#94A3B8', flexShrink: 0 }} />
                    )}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px', borderTop: '1px solid #F1F5F9' }}>
                      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: '10px 0 0' }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CONVERSION CTA SECTION ── */}
      <section
        style={{
          padding: '90px 20px',
          background: 'linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 100%)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 100,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
            }}
          >
            <Sparkles style={{ width: 14, height: 14, color: '#2563EB' }} />
            <span>Elite Cohort · Join the Top 1% of AI Recruiters</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0F172A', lineHeight: 1.25, marginBottom: 16 }}>
            Become the{' '}
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #0284C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                padding: '0 4px',
              }}
            >
              Top 1%
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
                  borderRadius: 2,
                }}
              />
            </span>{' '}
            AI-Powered Recruiter
          </h2>

          <p style={{ fontSize: 16, color: '#475569', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Enroll today at ₹{currentFinalPrice.toLocaleString('en-IN')} (Save {currentDiscount}%) and secure your seat in the upcoming cohort.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="ri-primary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 34px',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span>Enroll in AI for Recruitment</span>
              <ArrowRight style={{ width: 17, height: 17 }} />
            </button>

            <a
              href={`https://wa.me/917385204165?text=${encodeURIComponent(
                'Hi, I want to book a demo / counseling call for the AI for Recruitment course.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '15px 26px',
                borderRadius: 12,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontSize: 14.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <Phone style={{ width: 16, height: 16, color: '#2563EB' }} />
              <span>Call +91 7385204165</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── ENROLLMENT MODAL ── */}
      {isEnrollModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              maxWidth: 480,
              width: '100%',
              padding: 32,
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                color: '#64748B',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            {enrollSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 style={{ width: 48, height: 48, color: '#059669', margin: '0 auto 14px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                  Application Received!
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
                  Our academic advisor will contact you within 2 business hours with cohort batch schedules and payment links.
                </p>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="ri-primary-btn"
                  style={{
                    padding: '11px 22px',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13.5,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  <Sparkles style={{ width: 13, height: 13 }} />
                  {pricingMode === 'online' ? 'Live Online Cohort' : 'Pune Classroom Cohort'}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
                  Enroll in AI for Recruitment
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                  Fee: <strong style={{ color: '#0F172A' }}>₹{currentFinalPrice.toLocaleString('en-IN')}</strong> (Save {currentDiscount}%)
                </p>

                <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enrollForm.name}
                      onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={enrollForm.email}
                      onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={enrollForm.phone}
                      onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                      Current Experience
                    </label>
                    <select
                      value={enrollForm.experience}
                      onChange={(e) => setEnrollForm({ ...enrollForm, experience: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#0F172A',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    >
                      <option value="Fresher / College Student">Fresher / College Student</option>
                      <option value="1-3 years">1–3 years Recruiter/HR</option>
                      <option value="3-7 years">3–7 years Senior Recruiter</option>
                      <option value="7+ years">7+ years Lead / TA Manager</option>
                      <option value="Agency Owner">Agency Owner / Entrepreneur</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={enrollSubmitting}
                    className="ri-primary-btn"
                    style={{
                      marginTop: 6,
                      padding: '13px',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14.5,
                      fontWeight: 800,
                      border: 'none',
                      cursor: enrollSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {enrollSubmitting ? 'Securing Seat...' : `Confirm Registration · ₹${currentFinalPrice.toLocaleString('en-IN')}`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
