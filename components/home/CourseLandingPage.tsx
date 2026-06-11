'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Clock, Monitor, BarChart,
  ChevronDown, ChevronUp, MessageSquare,
  AlertCircle, ChevronRight, ArrowRight,
  BadgeCheck, Star, Users, BookOpen,
} from 'lucide-react'
import EnquiryModal from './EnquiryModal'

interface Props {
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  duration: string
  mode: string
  level: string
  features: string[]
  curriculum: Array<{ week: string; topic: string; details?: string[] }>
  slug: string
  dbFaqs?: Array<{ id: number; question: string; answer: string }>
}

export default function CourseLandingPage({
  title, subtitle, description, icon,
  duration, mode, level, features, curriculum, dbFaqs = [],
  color: _color, slug: _slug,
}: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'faqs'>('overview')
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const fallbackFaqs = [
    {
      id: 1,
      question: 'Who is this course suitable for?',
      answer: 'This program is ideal for college graduates, career transitioners, early-stage HR professionals, and anyone aiming to master corporate recruiting pipelines.',
    },
    {
      id: 2,
      question: 'Will I get practical exposure or only theoretical concepts?',
      answer: 'Our training is 100% practical. You will construct actual Boolean search strings, navigate mock Applicant Tracking Systems (ATS), and practice active LinkedIn sourcing.',
    },
    {
      id: 3,
      question: 'Is placement support provided upon completion?',
      answer: 'Yes, we provide resume review sessions, mock interviews, and share your profile with partner agencies and corporate recruitment teams across major industries.',
    },
    {
      id: 4,
      question: 'Do you offer a completion certificate?',
      answer: 'Absolutely. Upon successfully completing the course project and modules, you will receive an industry-recognized certificate from the Recruitment Institute.',
    },
  ]

  const faqsList = dbFaqs.length > 0 ? dbFaqs : fallbackFaqs

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'curriculum', label: 'Syllabus', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'faqs', label: 'FAQs', icon: <AlertCircle className="w-4 h-4" /> },
  ]

  const metaItems = [
    { icon: <Clock className="w-4 h-4" />, label: 'Duration', value: duration },
    { icon: <Monitor className="w-4 h-4" />, label: 'Format', value: mode },
    { icon: <BarChart className="w-4 h-4" />, label: 'Level', value: level },
  ]

  const sidebarDetails = [
    { label: 'Duration', value: duration },
    { label: 'Learning Mode', value: mode },
    { label: 'Course Level', value: level },
    { label: 'Certification', value: 'Industry Verified' },
    { label: 'Support', value: 'Mock Interviews & JDs' },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 55%, #1E3A8A 100%)',
          paddingTop: '72px',
          paddingBottom: '80px',
        }}
      >
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* glow orbs */}
        <div className="absolute top-0 right-0 pointer-events-none rounded-full"
          style={{ width: 500, height: 500, background: 'rgba(37,99,235,0.15)', filter: 'blur(100px)', transform: 'translate(20%,-20%)' }} />
        <div className="absolute bottom-0 left-0 pointer-events-none rounded-full"
          style={{ width: 300, height: 300, background: 'rgba(30,64,175,0.12)', filter: 'blur(80px)', transform: 'translate(-20%,20%)' }} />

        <div className="container relative z-10">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 mb-8" style={{ fontSize: '12px', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93C5FD' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748B' }}>
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/courses" style={{ color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#93C5FD' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#64748B' }}>
              Courses
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: '#94A3B8' }}>{subtitle}</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-8">
              {/* badge */}
              <div className="inline-flex items-center gap-2 mb-6"
                style={{
                  padding: '6px 16px', borderRadius: '50px',
                  background: 'rgba(30,64,175,0.25)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#93C5FD', fontSize: '11px', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                }}>
                <span>{icon}</span>
                {subtitle}
              </div>

              <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
                {title}
              </h1>
              <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '680px', marginBottom: '32px' }}>
                {description}
              </p>

              {/* meta pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                {metaItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2"
                    style={{
                      padding: '8px 16px', borderRadius: '50px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '13px', color: '#CBD5E1',
                    }}>
                    <span style={{ color: '#60A5FA' }}>{item.icon}</span>
                    <span style={{ fontWeight: 600 }}>{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="inline-flex items-center gap-2 font-bold text-white rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                    padding: '14px 32px', fontSize: '14px',
                    boxShadow: '0 8px 24px rgba(30,64,175,0.4)',
                    border: 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                >
                  Enquire Now
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 font-bold rounded-xl transition-all duration-200"
                  style={{
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    color: 'white', padding: '14px 32px', fontSize: '14px',
                    background: 'rgba(255,255,255,0.06)', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)' }}
                >
                  Request Call Back
                </Link>
              </div>
            </div>

            {/* Right — trust signals */}
            <div className="lg:col-span-4 hidden lg:flex flex-col gap-4">
              {[
                { icon: <BadgeCheck className="w-5 h-5" />, title: 'Industry Certificate', sub: 'Verified & recognized', color: '#1E40AF', bg: 'rgba(30,64,175,0.2)' },
                { icon: <Users className="w-5 h-5" />, title: '5,000+ Trained', sub: 'Working professionals', color: '#059669', bg: 'rgba(5,150,105,0.2)' },
                { icon: <Star className="w-5 h-5" />, title: 'Placement Support', sub: 'Resume + mock interviews', color: '#EA580C', bg: 'rgba(234,88,12,0.2)' },
              ].map((card) => (
                <div key={card.title}
                  className="flex items-center gap-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 20px', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ background: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{card.title}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0 bg-white"
          style={{ height: '52px', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Main Content ── */}
      <section style={{ background: '#F8FAFC', padding: '72px 0' }}>
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-10 items-start">

            {/* ── Left: Tabs ── */}
            <div className="lg:col-span-2">

              {/* Tab bar */}
              <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5"
                style={{ border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', width: 'fit-content' }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'curriculum' | 'faqs')}
                    className="flex items-center gap-2 font-bold rounded-xl cursor-pointer transition-all duration-200"
                    style={
                      activeTab === tab.id
                        ? { background: 'linear-gradient(135deg, #1E40AF, #2563EB)', color: 'white', padding: '10px 20px', fontSize: '13px', border: 'none', boxShadow: '0 4px 12px rgba(30,64,175,0.25)' }
                        : { background: 'transparent', color: '#64748B', padding: '10px 20px', fontSize: '13px', border: 'none' }
                    }
                    onMouseEnter={e => { if (activeTab !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = '#1E40AF' }}
                    onMouseLeave={e => { if (activeTab !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = '#64748B' }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Overview ── */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  {/* What you'll learn */}
                  <div className="bg-white rounded-3xl overflow-hidden"
                    style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '24px 28px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>What You Will Learn</h3>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Skills and knowledge covered in this program</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3" style={{ padding: '24px' }}>
                      {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl"
                          style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', padding: '14px' }}>
                          <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                            style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', lineHeight: 1.55 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="bg-white rounded-3xl"
                    style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '24px 28px' }}>
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                        style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                          Prerequisites & Target Audience
                        </h4>
                        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.8 }}>
                          No prior HR background or technical programming experience is required. This course begins with the absolute basics of hiring lifecycle models before advancing into live ATS sourcing and enterprise recruitment workflows.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Curriculum ── */}
              {activeTab === 'curriculum' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-3xl overflow-hidden"
                    style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '24px 28px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>Detailed Course Modules</h3>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                        {curriculum.length} modules — click to expand each topic
                      </p>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {curriculum.map((item, i) => {
                        const isExpanded = expandedWeek === i
                        return (
                          <div key={i} className="rounded-2xl overflow-hidden mb-3 last:mb-0"
                            style={{ border: `1px solid ${isExpanded ? '#BFDBFE' : '#E2E8F0'}`, background: isExpanded ? '#F8FAFC' : 'white', transition: 'all 0.2s' }}>
                            <button
                              onClick={() => setExpandedWeek(isExpanded ? null : i)}
                              className="w-full flex items-center justify-between text-left cursor-pointer"
                              style={{ padding: '18px 20px', background: 'transparent', border: 'none' }}
                              onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
                              onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 font-bold"
                                  style={{ background: isExpanded ? '#1E40AF' : '#EFF6FF', color: isExpanded ? 'white' : '#1E40AF', fontSize: '13px' }}>
                                  {i + 1}
                                </div>
                                <div>
                                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                                    {item.week}
                                  </p>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{item.topic}</p>
                                </div>
                              </div>
                              <div style={{ color: '#94A3B8', flexShrink: 0 }}>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div style={{ padding: '4px 20px 20px', borderTop: '1px solid #E0EDFF' }}>
                                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '12px 0 10px', fontWeight: 600 }}>
                                  Topics covered in this module:
                                </p>
                                {item.details && item.details.length > 0 ? (
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {item.details.map((detail, dIdx) => (
                                      <div key={dIdx} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#1E40AF' }} />
                                        <span style={{ fontSize: '13px', color: '#475569' }}>{detail}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {['Core theory and terminology review', 'Hands-on assignments & case studies', 'Practical recruiter simulation workflows', 'Review quiz and mentor feedback session'].map((d) => (
                                      <div key={d} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#1E40AF' }} />
                                        <span style={{ fontSize: '13px', color: '#475569' }}>{d}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── FAQs ── */}
              {activeTab === 'faqs' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-3xl overflow-hidden"
                    style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '24px 28px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>Frequently Asked Questions</h3>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Everything you need to know before enrolling</p>
                    </div>
                    <div style={{ padding: '16px' }}>
                      {faqsList.map((faq, idx) => {
                        const isExpanded = expandedFaq === idx
                        return (
                          <div key={faq.id} className="rounded-2xl overflow-hidden mb-3 last:mb-0"
                            style={{ border: `1px solid ${isExpanded ? '#BFDBFE' : '#E2E8F0'}`, background: isExpanded ? '#F8FAFC' : 'white', transition: 'all 0.2s' }}>
                            <button
                              onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                              className="w-full flex items-center justify-between text-left cursor-pointer"
                              style={{ padding: '18px 20px', background: 'transparent', border: 'none' }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', paddingRight: '16px' }}>
                                {faq.question}
                              </span>
                              <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
                                style={{ background: isExpanded ? '#1E40AF' : '#F1F5F9', color: isExpanded ? 'white' : '#64748B' }}>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <div style={{ padding: '4px 20px 20px', borderTop: '1px solid #E0EDFF' }}>
                                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.8, marginTop: '12px' }}>
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside className="sticky top-24">
              <div className="bg-white rounded-3xl overflow-hidden"
                style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}>

                {/* top bar */}
                <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '24px' }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      style={{ background: 'rgba(255,255,255,0.12)', fontSize: '18px' }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{subtitle}</p>
                      <p style={{ fontSize: '11px', color: '#64748B' }}>Recruitment Institute Certification</p>
                    </div>
                  </div>
                </div>

                {/* details */}
                <div style={{ padding: '0' }}>
                  {sidebarDetails.map(({ label, value }, i) => (
                    <div key={i} className="flex items-center justify-between"
                      style={{ padding: '14px 20px', borderBottom: i < sidebarDetails.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ padding: '20px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => setEnquiryOpen(true)}
                    className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                      padding: '14px', fontSize: '14px',
                      boxShadow: '0 8px 20px rgba(30,64,175,0.3)',
                      border: 'none',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                  >
                    Enquire About Batches
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="https://wa.me/919975048884"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #059669, #0D9488)',
                      color: 'white', padding: '14px', fontSize: '14px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp Admissions
                  </a>
                </div>

                {/* trust note */}
                <div className="flex items-center justify-center gap-2"
                  style={{ padding: '14px 20px', borderTop: '1px solid #F8FAFC', background: '#F8FAFC' }}>
                  <BadgeCheck className="w-4 h-4" style={{ color: '#10B981' }} />
                  <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    100% practical training • Certificate on completion
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} />

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: title,
            description,
            provider: {
              '@type': 'Organization',
              name: 'Recruitment Institute',
              url: 'https://recruitmentinstitute.in',
            },
            hasCourseInstance: {
              '@type': 'CourseInstance',
              courseMode: mode.includes('Online') ? 'online' : 'onsite',
              duration: duration,
            },
          }),
        }}
      />
    </>
  )
}
