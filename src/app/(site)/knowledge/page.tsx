import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getPaginationData, buildPaginationPages } from '@/utils/pagination'
import { ChevronRight, ChevronDown, MessageSquare, BookOpen, Lightbulb, Users, Search, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recruitment & HR Knowledge Base | Recruitment Institute',
  description:
    'Browse expert answers to common questions about HR workflows, boolean searches, LinkedIn sourcing, and candidate management frameworks.',
}

export const revalidate = 3600

interface Props {
  searchParams: Promise<{ page?: string }>
}

const fallbackItems = [
  {
    id: 1,
    question: 'What is the difference between active and passive candidate sourcing?',
    answer: 'Active candidate sourcing targets professionals who are actively searching for new roles, applying to job boards, or updating their resumes. Passive candidate sourcing involves identifying and engaging talent who are currently employed and not searching, but might be open to a career progression opportunity.',
    addedBy: 'Admissions Lead',
  },
  {
    id: 2,
    question: 'What are Boolean search strings in recruitment?',
    answer: 'Boolean strings are customized search parameters that use operators like AND, OR, and NOT alongside keywords and punctuation to filter candidate databases on platforms like Google, LinkedIn, and internal ATS tools. Mastering Boolean search is one of the most high-impact skills a recruiter can develop.',
    addedBy: 'IT Recruitment Trainer',
  },
  {
    id: 3,
    question: 'How can an ATS help in talent acquisition?',
    answer: 'An Applicant Tracking System (ATS) manages recruitment stages electronically. It handles posting open requisitions to job boards, parsing candidate resume keywords, tracking interview status, and archiving email communication pipelines — saving hours of manual work every week.',
    addedBy: 'Operations Director',
  },
  {
    id: 4,
    question: 'What is structured competency interviewing?',
    answer: 'Structured interviewing evaluates candidates using pre-determined, standardized questions mapped directly to role-specific competencies, ensuring fair grading scales and reducing interviewer bias. It leads to more consistent hiring decisions and better long-term employee performance.',
    addedBy: 'Corporate Recruiter Trainer',
  },
]

const stats = [
  { icon: BookOpen, value: '50+', label: 'Expert answers', color: '#1E40AF', bg: '#EFF6FF' },
  { icon: Users, value: '5K+', label: 'Professionals helped', color: '#059669', bg: '#F0FDF4' },
  { icon: Search, value: '100%', label: 'Practical focus', color: '#7C3AED', bg: '#F5F3FF' },
]

export default async function KnowledgePage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 10

  let dbItems: { id: number; question: string; answer: string; addedBy: string | null }[] = []
  let total = 0

  try {
    const fetchedItems = await prisma.knowledgeItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    })
    dbItems = fetchedItems.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      addedBy: item.addedBy,
    }))
    total = await prisma.knowledgeItem.count()
  } catch (err) {
    console.error('Failed to load knowledge items:', err)
  }

  const displayItems = dbItems.length > 0 ? dbItems : fallbackItems
  const displayTotal = dbItems.length > 0 ? total : fallbackItems.length

  const pagination = getPaginationData(page, limit, displayTotal)
  const pages = buildPaginationPages(pagination.page, pagination.totalPages)

  return (
    <>
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a2744 60%, #0F172A 100%)', paddingTop: '72px', paddingBottom: '80px' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 pointer-events-none rounded-full"
          style={{ width: 450, height: 450, background: 'rgba(30,64,175,0.14)', filter: 'blur(90px)', transform: 'translate(25%,-25%)' }} />
        <div className="absolute bottom-0 left-0 pointer-events-none rounded-full"
          style={{ width: 300, height: 300, background: 'rgba(30,64,175,0.10)', filter: 'blur(70px)', transform: 'translate(-20%,20%)' }} />

        <div className="container relative z-10">
          <div className="flex items-center gap-2 mb-8" style={{ fontSize: '12px', color: '#64748B' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: '#94A3B8' }}>Knowledge Base</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '50px',
                background: 'rgba(30,64,175,0.25)', border: '1px solid rgba(59,130,246,0.3)',
                color: '#93C5FD', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '20px',
              }}>
                <Lightbulb className="w-3.5 h-3.5" />
                HR Knowledge Hub
              </div>
              <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '16px' }}>
                Recruitment &amp; HR<br />
                <span style={{ color: '#60A5FA' }}>Knowledge Base</span>
              </h1>
              <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.8, maxWidth: '480px' }}>
                Expert answers to your most common questions on HR workflows, boolean search, ATS tools, LinkedIn sourcing, and career guidance.
              </p>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              {stats.map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', padding: '18px 24px', backdropFilter: 'blur(8px)' }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: bg, color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white"
          style={{ height: '52px', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* ── Main Content ── */}
      <section style={{ background: '#F8FAFC', padding: '72px 0' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block', padding: '5px 14px', borderRadius: '50px',
              background: '#EFF6FF', color: '#1E40AF',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: '14px',
            }}>
              Learn &amp; Grow
            </div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              HR &amp; Recruitment Q&amp;A
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto' }}>
              Find answers to commonly asked questions on hiring policies, LinkedIn boolean strings, ATS tools, and career advice.
            </p>
          </div>

          {/* Two-column: accordion + video */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }} className="knowledge-grid">

            {/* LEFT: Accordion */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
                {displayItems.map((item, idx) => (
                  <details
                    key={item.id}
                    style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}
                  >
                    <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', cursor: 'pointer', listStyle: 'none', gap: '16px' }}>
                      <div className="flex items-center gap-4" style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-center shrink-0 rounded-xl font-bold"
                          style={{ width: 36, height: 36, background: '#EFF6FF', color: '#1E40AF', fontSize: '13px' }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.45 }}>
                          {item.question}
                        </span>
                      </div>
                      <div className="shrink-0 flex items-center justify-center rounded-full"
                        style={{ width: 28, height: 28, background: '#F1F5F9', color: '#64748B' }}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </summary>
                    <div style={{ padding: '0 24px 20px 84px', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ paddingTop: '16px' }}>
                        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.85 }}>{item.answer}</p>
                        {item.addedBy && (
                          <div className="flex items-center gap-2" style={{ marginTop: '16px' }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                              <HelpCircle className="w-3 h-3" />
                            </div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                              Answered by: {item.addedBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2" style={{ marginBottom: '48px' }}>
                  {pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`d-${i}`} style={{ padding: '0 8px', color: '#94A3B8', fontSize: '14px' }}>…</span>
                    ) : (
                      <Link
                        key={p}
                        href={`/knowledge?page=${p}`}
                        className="flex items-center justify-center font-bold rounded-xl transition-all"
                        style={
                          p === pagination.page
                            ? { width: 40, height: 40, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: 'white', fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(30,64,175,0.25)' }
                            : { width: 40, height: 40, background: 'white', border: '1px solid #E2E8F0', color: '#475569', fontSize: '13px', textDecoration: 'none' }
                        }
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Video sidebar */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 16px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', lineHeight: 1.35 }}>
                    Acquiring the right talent is the most important key to growth
                  </h3>
                  <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg,#1E40AF,#2563EB)', borderRadius: '2px', marginTop: '10px' }} />
                </div>

                {/* YouTube embed */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src="https://www.youtube.com/embed/jNQXAC9IVRw?rel=0"
                    title="Recruitment Institute — HR Training"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <a
                    href="https://www.youtube.com/@recruitmentinstitute"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '12px 20px', borderRadius: '12px',
                      background: 'linear-gradient(135deg,#1E40AF,#2563EB)',
                      color: 'white', fontSize: '14px', fontWeight: 700,
                      textDecoration: 'none', boxShadow: '0 4px 14px rgba(30,64,175,0.3)',
                    }}
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Support CTA */}
          <div className="relative overflow-hidden rounded-3xl" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E3A8A 100%)', padding: '48px 40px', marginTop: '48px' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
            <div className="absolute top-0 right-0 pointer-events-none rounded-full"
              style={{ width: 250, height: 250, background: 'rgba(37,99,235,0.18)', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '10px', letterSpacing: '-0.02em' }}>
                Have a Different Question?
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.75, maxWidth: '440px', margin: '0 auto 28px' }}>
                If your question isn&apos;t resolved here, our training coordinators are available on WhatsApp or via the contact form.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/919975048884"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold rounded-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', color: 'white', padding: '13px 24px', fontSize: '14px', textDecoration: 'none', boxShadow: '0 6px 16px rgba(5,150,105,0.3)' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Counselor
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-bold rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', color: 'white', padding: '13px 24px', fontSize: '14px', textDecoration: 'none' }}
                >
                  Send Support Request
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .knowledge-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
