import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getPaginationData, buildPaginationPages } from '@/utils/pagination'
import {
  BookOpen, Lightbulb, Users, MessageSquare, ChevronRight,
  ChevronDown, HelpCircle, GraduationCap, Briefcase, Target,
  TrendingUp, Award, Phone, ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'HR & Recruitment Knowledge Base | Recruitment Institute',
  description:
    'Browse 36+ expert answers on HR workflows, boolean search, ATS tools, LinkedIn sourcing, salary benchmarking, and recruitment career advice.',
}

export const revalidate = 3600

interface Props {
  searchParams: Promise<{ page?: string }>
}

const fallbackItems = [
  { id: 1, question: 'What is the difference between active and passive candidate sourcing?', answer: 'Active candidate sourcing targets professionals who are actively searching for new roles. Passive candidate sourcing involves identifying and engaging talent who are currently employed but might be open to a career progression opportunity.', addedBy: 'Admissions Lead' },
  { id: 2, question: 'What are Boolean search strings in recruitment?', answer: 'Boolean strings use operators AND, OR, and NOT alongside keywords to filter candidate databases on LinkedIn, Naukri, and ATS tools. Mastering Boolean search is one of the highest-impact skills a recruiter can develop.', addedBy: 'IT Recruitment Trainer' },
  { id: 3, question: 'How can an ATS help in talent acquisition?', answer: 'An ATS manages recruitment stages electronically — posting jobs, parsing resumes, tracking interview status, and archiving communication pipelines, saving hours of manual work every week.', addedBy: 'Operations Director' },
  { id: 4, question: 'What is structured competency interviewing?', answer: 'Structured interviewing uses pre-determined, standardized questions mapped to role-specific competencies, ensuring fair grading and reducing interviewer bias for more consistent hiring decisions.', addedBy: 'Corporate Recruiter Trainer' },
]

const accentColors = [
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', light: '#F0F7FF' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669', light: '#F0FFF4' },
  { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED', light: '#F8F5FF' },
  { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', light: '#FFFDF0' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48', light: '#FFF5F6' },
  { bg: '#ECFEFF', border: '#A5F3FC', text: '#0891B2', light: '#F0FEFF' },
  { bg: '#F0FDF4', border: '#A7F3D0', text: '#047857', light: '#F0FFF9' },
  { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309', light: '#FFFBF0' },
  { bg: '#EFF6FF', border: '#BAE6FD', text: '#0369A1', light: '#F0F9FF' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#9333EA', light: '#FDF8FF' },
]

export default async function KnowledgePage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 10

  let dbItems: { id: number; question: string; answer: string; addedBy: string | null }[] = []
  let total = 0

  try {
    const fetched = await prisma.knowledgeItem.findMany({
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
    })
    dbItems = fetched.map(i => ({ id: i.id, question: i.question, answer: i.answer, addedBy: i.addedBy }))
    total = await prisma.knowledgeItem.count()
  } catch {
    // fallback used
  }

  const displayItems = dbItems.length > 0 ? dbItems : fallbackItems
  const displayTotal  = dbItems.length > 0 ? total : fallbackItems.length
  const pagination    = getPaginationData(page, limit, displayTotal)
  const pages         = buildPaginationPages(pagination.page, pagination.totalPages)
  const startIdx      = (page - 1) * limit

  return (
    <>
      <style>{`
        body { font-family: 'Poppins', sans-serif; }

        /* Hero */
        .kb-hero { background: linear-gradient(135deg, #F0F7FF 0%, #EEF2FF 50%, #F5F3FF 100%); padding: 72px 0 88px; position: relative; overflow: hidden; }
        .kb-hero-blob1 { position:absolute; top:-80px; right:-60px; width:480px; height:480px; background:radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 70%); pointer-events:none; }
        .kb-hero-blob2 { position:absolute; bottom:-60px; left:-40px; width:360px; height:360px; background:radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 70%); pointer-events:none; }
        .kb-wave { position:absolute; bottom:0; left:0; right:0; height:56px; background:#F8FAFC; clip-path:ellipse(55% 100% at 50% 100%); }

        /* Stat cards */
        .kb-stat { background:#fff; border-radius:20px; border:1.5px solid #E8EDF5; padding:22px 26px; display:flex; align-items:center; gap:16px; box-shadow:0 4px 20px rgba(15,23,42,.06); transition:transform .25s,box-shadow .25s; }
        .kb-stat:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,.1); }

        /* Accordion */
        .kb-item { background:#fff; border-radius:20px; border:1.5px solid #E8EDF5; box-shadow:0 2px 14px rgba(15,23,42,.05); overflow:hidden; transition:border-color .2s,box-shadow .2s; margin-bottom:14px; }
        .kb-item:hover { border-color:#BFDBFE; box-shadow:0 6px 28px rgba(30,64,175,.1); }
        .kb-item[open] { border-color:#93C5FD; box-shadow:0 8px 32px rgba(30,64,175,.12); }
        .kb-item[open] .kb-chevron { transform:rotate(180deg); background:#EFF6FF !important; color:#1D4ED8 !important; }
        .kb-summary { display:flex; align-items:center; justify-content:space-between; padding:20px 22px; cursor:pointer; list-style:none; gap:14px; user-select:none; }
        .kb-summary::-webkit-details-marker { display:none; }
        .kb-num { width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; transition:all .2s; }
        .kb-chevron { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#F8FAFC; color:#94A3B8; flex-shrink:0; transition:all .3s; border:1px solid #E2E8F0; }
        .kb-body { padding:0 22px 22px 74px; border-top:1px solid #F1F5F9; }
        .kb-body-inner { padding-top:18px; }

        /* Sidebar */
        .kb-sidebar-card { background:#fff; border-radius:22px; border:1.5px solid #E8EDF5; box-shadow:0 4px 24px rgba(15,23,42,.08); overflow:hidden; margin-bottom:20px; }
        .kb-sidebar-tag { display:inline-flex; align-items:center; gap:6px; padding:4px 14px; border-radius:50px; font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }

        /* Quick links */
        .kb-qlink { display:flex; align-items:center; gap:12px; padding:13px 16px; border-radius:14px; background:#F8FAFC; border:1px solid #E8EDF5; transition:all .2s; text-decoration:none; }
        .kb-qlink:hover { background:#EFF6FF; border-color:#BFDBFE; transform:translateX(3px); }

        /* Pagination */
        .kb-page-btn { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; text-decoration:none; transition:all .2s; }
        .kb-page-active { background:linear-gradient(135deg,#1E40AF,#2563EB); color:#fff; box-shadow:0 4px 14px rgba(30,64,175,.35); }
        .kb-page-inactive { background:#fff; border:1.5px solid #E2E8F0; color:#475569; }
        .kb-page-inactive:hover { background:#EFF6FF; border-color:#BFDBFE; color:#1D4ED8; }

        /* CTA */
        .kb-cta { background:linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#3B82F6 100%); border-radius:28px; padding:52px 48px; position:relative; overflow:hidden; margin-top:60px; }
        .kb-cta-blob { position:absolute; top:-80px; right:-80px; width:360px; height:360px; background:rgba(255,255,255,.07); border-radius:50%; pointer-events:none; }
        .kb-cta-blob2 { position:absolute; bottom:-60px; left:5%; width:280px; height:280px; background:rgba(255,255,255,.04); border-radius:50%; pointer-events:none; }
        .kb-cta-btn { display:inline-flex; align-items:center; gap:9px; padding:14px 28px; border-radius:13px; font-size:14px; font-weight:700; text-decoration:none; transition:transform .2s,box-shadow .2s; }
        .kb-cta-btn:hover { transform:translateY(-2px); }

        @media (max-width:960px) { .kb-grid { grid-template-columns:1fr !important; } .kb-hero-stats { grid-template-columns:1fr !important; } }
        @media (max-width:640px) { .kb-cta { padding:40px 28px !important; } .kb-body { padding-left:22px !important; } }
      `}</style>

      {/* ── HERO ── */}
      <section className="kb-hero">
        <div className="kb-hero-blob1" />
        <div className="kb-hero-blob2" />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, fontSize: 12, fontWeight: 600 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: 13, height: 13, color: '#94A3B8' }} />
            <span style={{ color: '#1D4ED8', fontWeight: 700 }}>Knowledge Base</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 420px', gap: 60, alignItems: 'center' }} className="kb-grid">
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 50, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 22 }}>
                <Lightbulb style={{ width: 13, height: 13 }} /> HR Knowledge Hub
              </div>
              <h1 style={{ fontSize: 'clamp(34px,4vw,56px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.08, letterSpacing: '-.04em', marginBottom: 18 }}>
                Your Complete{' '}
                <span style={{ background: 'linear-gradient(120deg,#1D4ED8,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  HR & Recruitment
                </span>
                <br />Knowledge Base
              </h1>
              <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.85, maxWidth: 500, marginBottom: 36 }}>
                Expert answers on boolean search, ATS tools, LinkedIn sourcing, salary benchmarking, interview techniques, and your HR career path.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                {[
                  { label: `${displayTotal}+ Q&As`, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
                  { label: 'Updated 2026', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
                  { label: 'Industry Experts', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
                ].map(b => (
                  <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 50, background: b.bg, border: `1.5px solid ${b.border}`, fontSize: 12, fontWeight: 700, color: b.color }}>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="kb-hero-stats">
              {[
                { icon: BookOpen,      value: '36+',  label: 'Expert Q&As',        color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
                { icon: Users,         value: '5K+',  label: 'Professionals Helped', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
                { icon: GraduationCap, value: '95%',  label: 'Placement Rate',     color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
                { icon: Award,         value: '10+',  label: 'Years of Training',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
              ].map(({ icon: Icon, value, label, color, bg, border }) => (
                <div key={label} className="kb-stat">
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 20, height: 20, color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, margin: 0, letterSpacing: '-.03em' }}>{value}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 4, lineHeight: 1.3 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="kb-wave" />
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ background: '#F8FAFC', padding: '72px 0 96px' }}>
        <div className="container">

          {/* Section header */}
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 18px', borderRadius: 50, background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase' as const, marginBottom: 18 }}>
              <BookOpen style={{ width: 11, height: 11 }} /> Learn &amp; Grow
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,42px)', fontWeight: 900, color: '#0F172A', lineHeight: 1.12, letterSpacing: '-.04em', margin: '0 0 16px' }}>
              HR &amp; Recruitment{' '}
              <span style={{ background: 'linear-gradient(120deg,#1D4ED8,#2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Q&amp;A
              </span>
            </h2>
            <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.8, margin: 0 }}>
              Find expert answers to commonly asked questions on hiring, boolean strings, ATS tools, interview techniques, and career advice — all from experienced recruiters.
            </p>
          </div>

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36, alignItems: 'start' }} className="kb-grid">

            {/* LEFT: Accordion */}
            <div>
              {/* Page indicator */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '12px 18px', background: '#fff', borderRadius: 14, border: '1.5px solid #E8EDF5' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                    Showing <strong style={{ color: '#0F172A' }}>{startIdx + 1}–{Math.min(startIdx + limit, displayTotal)}</strong> of <strong style={{ color: '#0F172A' }}>{displayTotal}</strong> questions
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', padding: '4px 12px', borderRadius: 50 }}>
                    Page {page} of {pagination.totalPages}
                  </span>
                </div>
              )}

              {/* Q&A Items */}
              {displayItems.map((item, idx) => {
                const globalIdx = startIdx + idx
                const ac = accentColors[globalIdx % accentColors.length]
                return (
                  <details key={item.id} className="kb-item">
                    <summary className="kb-summary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                        <div className="kb-num" style={{ background: ac.bg, color: ac.text, border: `1.5px solid ${ac.border}` }}>
                          {globalIdx + 1}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.5, flex: 1 }}>
                          {item.question}
                        </span>
                      </div>
                      <div className="kb-chevron">
                        <ChevronDown style={{ width: 15, height: 15 }} />
                      </div>
                    </summary>

                    <div className="kb-body">
                      <div className="kb-body-inner">
                        {/* Accent left bar */}
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ width: 3, borderRadius: 3, background: ac.text, flexShrink: 0, alignSelf: 'stretch', opacity: 0.5 }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14.5, color: '#334155', lineHeight: 1.9, margin: 0 }}>{item.answer}</p>
                            {item.addedBy && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: '5px 12px', borderRadius: 50, background: ac.bg, border: `1px solid ${ac.border}` }}>
                                <HelpCircle style={{ width: 12, height: 12, color: ac.text }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: ac.text, letterSpacing: '.1em', textTransform: 'uppercase' as const }}>
                                  {item.addedBy}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                )
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 36, flexWrap: 'wrap' as const }}>
                  {page > 1 && (
                    <Link href={`/knowledge?page=${page - 1}`} className="kb-page-btn kb-page-inactive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', gap: 4 }}>
                      ← Prev
                    </Link>
                  )}
                  {pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`d-${i}`} style={{ padding: '0 6px', color: '#94A3B8', fontSize: 14 }}>…</span>
                    ) : (
                      <Link key={p} href={`/knowledge?page=${p}`}
                        className={`kb-page-btn ${p === pagination.page ? 'kb-page-active' : 'kb-page-inactive'}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        {p}
                      </Link>
                    )
                  )}
                  {page < pagination.totalPages && (
                    <Link href={`/knowledge?page=${page + 1}`} className="kb-page-btn kb-page-inactive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', gap: 4 }}>
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div style={{ position: 'sticky', top: 96 }}>

              {/* Video card */}
              <div className="kb-sidebar-card">
                <div style={{ padding: '22px 22px 18px' }}>
                  <div className="kb-sidebar-tag" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', marginBottom: 12 }}>
                    <Lightbulb style={{ width: 10, height: 10 }} /> Featured
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: 0 }}>
                    Acquiring the right talent is the most important key to growth
                  </h3>
                  <div style={{ width: 36, height: 3, background: 'linear-gradient(90deg,#1D4ED8,#7C3AED)', borderRadius: 2, marginTop: 12 }} />
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src="https://www.youtube.com/embed/jNQXAC9IVRw?rel=0"
                    title="Recruitment Institute HR Training"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
                <div style={{ padding: '16px 22px 22px' }}>
                  <a href="https://www.youtube.com/@recruitmentinstitute" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 13, background: 'linear-gradient(135deg,#1E40AF,#2563EB)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 18px rgba(30,64,175,.3)' }}>
                    Watch on YouTube <ArrowRight style={{ width: 15, height: 15 }} />
                  </a>
                </div>
              </div>

              {/* Quick links */}
              <div className="kb-sidebar-card">
                <div style={{ padding: '20px 22px 14px' }}>
                  <div className="kb-sidebar-tag" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669', marginBottom: 14 }}>
                    <Target style={{ width: 10, height: 10 }} /> Quick Links
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { href: '/courses', icon: GraduationCap, label: 'Explore Our Courses', color: '#1D4ED8', bg: '#EFF6FF' },
                      { href: '/community', icon: Users, label: 'HR Community Forum', color: '#059669', bg: '#F0FDF4' },
                      { href: '/contact', icon: Phone, label: 'Talk to a Counsellor', color: '#7C3AED', bg: '#F5F3FF' },
                      { href: '/testimonials', icon: Award, label: 'Student Success Stories', color: '#D97706', bg: '#FFFBEB' },
                      { href: '/blogs', icon: BookOpen, label: 'Read HR Blogs', color: '#0891B2', bg: '#ECFEFF' },
                    ].map(({ href, icon: Icon, label, color, bg }) => (
                      <Link key={href} href={href} className="kb-qlink">
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: 16, height: 16, color }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', flex: 1 }}>{label}</span>
                        <ChevronRight style={{ width: 14, height: 14, color: '#94A3B8', flexShrink: 0 }} />
                      </Link>
                    ))}
                  </div>
                </div>
                <div style={{ height: 1, background: '#F1F5F9' }} />
                <div style={{ padding: '16px 22px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 14, background: 'linear-gradient(135deg,#EFF6FF,#F5F3FF)', border: '1.5px solid #BFDBFE' }}>
                    <TrendingUp style={{ width: 18, height: 18, color: '#1D4ED8', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', margin: 0 }}>95% Placement Rate</p>
                      <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>Within 90 days of completion</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ask a question CTA */}
              <div style={{ background: 'linear-gradient(135deg,#F5F3FF,#EFF6FF)', border: '1.5px solid #DDD6FE', borderRadius: 20, padding: '22px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Briefcase style={{ width: 22, height: 22, color: '#1D4ED8' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>Have a Question?</p>
                <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: '0 0 16px' }}>
                  Our counsellors answer personalised HR career queries daily.
                </p>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#059669,#0D9488)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(5,150,105,.28)' }}>
                  <MessageSquare style={{ width: 14, height: 14 }} /> WhatsApp Us Now
                </a>
              </div>

            </div>
          </div>

          {/* Bottom CTA */}
          <div className="kb-cta">
            <div className="kb-cta-blob" />
            <div className="kb-cta-blob2" />
            <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 40, alignItems: 'center' }} className="kb-grid">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase' as const, color: '#BFDBFE', marginBottom: 10 }}>Still Have Questions?</p>
                <h2 style={{ fontSize: 'clamp(22px,2.5vw,34px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-.03em', margin: '0 0 12px' }}>
                  Talk to an HR Training Expert — It&apos;s Free
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', lineHeight: 1.75, margin: 0, maxWidth: 480 }}>
                  Get personalised guidance on your HR career, course selection, and fee structure from our experienced counsellors.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
                <a href="https://wa.me/917385204165" target="_blank" rel="noopener noreferrer" className="kb-cta-btn"
                  style={{ background: '#fff', color: '#1E40AF', boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}>
                  <MessageSquare style={{ width: 16, height: 16 }} /> WhatsApp Us
                </a>
                <Link href="/contact" className="kb-cta-btn"
                  style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.25)', justifyContent: 'center' }}>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
