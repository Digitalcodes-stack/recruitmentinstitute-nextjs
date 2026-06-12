'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  Search,
  Shield,
  Sparkles,
  TrendingUp,

  Users,
  X,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { PaginationMeta } from '@/types'

interface Question {
  id: number
  question: string
  createdAt: Date
  user: { name: string; email: string } | null
  _count: { answers: number }
}

interface Props {
  questions: Question[]
  pagination: PaginationMeta & { hasNext: boolean; hasPrev: boolean; offset: number }
  pages: (number | '...')[]
  query: string
  totalQuestions: number
  totalMembers: number
}

const avatarImages = [
  '/assets/images/team/style1/1.jpg',
  '/assets/images/team/style1/2.jpg',
  '/assets/images/team/style1/3.jpg',
  '/assets/images/team/style2/1.jpg',
  '/assets/images/team/style2/3.jpg',
  '/assets/images/team/style2/5.jpg',
]

const avatarColors = [
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#EA580C' },
  { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' },
  { bg: '#ECFEFF', border: '#A5F3FC', text: '#0891B2' },
]

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getAvatar(index: number) {
  return avatarImages[index % avatarImages.length]
}

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length]
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function CommunityClient({
  questions,
  pagination,
  pages,
  query,
  totalQuestions,
  totalMembers,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(query)
  const [showAskForm, setShowAskForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(`/community?q=${encodeURIComponent(search.trim())}`)
  }

  const handleAskQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Question posted!')
        setNewQuestion('')
        setShowAskForm(false)
        router.refresh()
      } else if (data.message?.includes('login') || data.message?.includes('auth')) {
        toast.error('Please login to post a question')
        router.push('/candidate-login')
      } else {
        toast.error(data.message || 'Failed to post question')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #020817 0%, #0A1628 35%, #0D1F3C 65%, #060E1E 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Ambient glows */}
        <div className="absolute pointer-events-none" style={{ top: '-120px', left: '-80px', width: 560, height: 560, background: 'radial-gradient(circle, rgba(30,64,175,0.22) 0%, transparent 65%)', filter: 'blur(2px)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-80px', right: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 65%)' }} />
        <div className="absolute pointer-events-none" style={{ top: '30%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)' }} />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent 0%, #F59E0B 30%, #14B8A6 60%, transparent 100%)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, padding: '80px 0 72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 460px', gap: '64px', alignItems: 'center' }} className="hero-grid">

            {/* ── Left: Text ── */}
            <div>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '12px', fontWeight: 600 }}>
                <Link href="/" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}

>
                  Home
                </Link>
                <span style={{ color: '#F59E0B', fontSize: '5px' }}>●</span>
                <span style={{ color: '#94A3B8' }}>Community Forum</span>
              </div>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '7px 16px', borderRadius: '50px',
                background: 'rgba(20,184,166,0.12)',
                border: '1px solid rgba(20,184,166,0.25)',
                color: '#5EEAD4', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '24px',
              }}>
                <Sparkles style={{ width: 12, height: 12, color: '#F59E0B' }} />
                Recruiter Peer Network
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(38px, 4.5vw, 62px)', fontWeight: 900,
                color: 'white', lineHeight: 1.08, letterSpacing: '-0.04em',
                marginBottom: '24px',
              }}>
                Recruiter
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #60A5FA 0%, #5EEAD4 50%, #F59E0B 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Peer Network
                </span>
              </h1>

              <p style={{ fontSize: '17px', color: '#94A3B8', lineHeight: 1.85, maxWidth: '480px', marginBottom: '40px' }}>
                Ask practical hiring questions, learn from recruiter discussions, and build sharper HR judgment with peers.
              </p>

              {/* Live stat pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
                {[
                  { icon: MessageSquare, value: `${totalQuestions}`, label: 'Discussions', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
                  { icon: Users, value: `${totalMembers}`, label: 'Members', color: '#5EEAD4', bg: 'rgba(94,234,212,0.1)', border: 'rgba(94,234,212,0.2)' },
                  { icon: Zap, value: 'Live', label: 'Community', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                ].map(({ icon: Icon, value, label, color, bg, border }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 18px', borderRadius: '50px',
                    background: bg, border: `1px solid ${border}`,
                  }}>
                    <Icon style={{ width: 14, height: 14, color }} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color }}>{value}</span>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowAskForm(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                    padding: '14px 28px', borderRadius: '12px', border: 'none',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(30,64,175,0.4)',
                    transition: 'all 0.2s ease',
                  }}


                >
                  <PlusCircle style={{ width: 16, height: 16 }} />
                  Ask a Question
                </button>
                <Link href="#discussions" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  border: '1.5px solid rgba(255,255,255,0.15)', color: 'white',
                  fontWeight: 600, fontSize: '14px', padding: '14px 28px',
                  borderRadius: '12px', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease',
                }}


                >
                  Browse Discussions
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </Link>
              </div>
            </div>

            {/* ── Right: Photo card ── */}
            <div style={{ position: 'relative' }} className="hero-img-col">
              {/* Decorative ring */}
              <div style={{
                position: 'absolute', inset: '-16px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, rgba(30,64,175,0.3), rgba(20,184,166,0.15), rgba(245,158,11,0.1))',
                filter: 'blur(1px)',
              }} />

              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
              }}>
                {/* Main photo */}
                <div style={{ position: 'relative', height: '360px', background: '#0F172A' }}>
                  <Image
                    src="/assets/images/team/style2/3.jpg"
                    alt="HR professional"
                    fill
                    priority
                    sizes="460px"
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  />
                  {/* Gradient fade at bottom */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(6,14,30,0.95) 100%)' }} />

                  {/* Floating badge top-left */}
                  <div style={{
                    position: 'absolute', top: '20px', left: '20px',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 14px', borderRadius: '50px',
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    backdropFilter: 'blur(12px)',
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#FCD34D', letterSpacing: '0.1em' }}>LIVE COMMUNITY</span>
                  </div>
                </div>

                {/* Bottom info panel */}
                <div style={{ background: '#060E1E', padding: '24px 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
                    Live Peer Support
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', lineHeight: 1.5, marginBottom: '16px' }}>
                    Learn from real recruiter questions, screening stories &amp; hiring insights.
                  </p>
                  {/* Mini member row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex' }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          border: '2px solid #060E1E', overflow: 'hidden',
                          marginLeft: i > 1 ? '-10px' : '0', position: 'relative',
                        }}>
                          <Image src={`/assets/images/team/style1/${i}.jpg`} alt="" fill sizes="32px" style={{ objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                      <strong style={{ color: '#5EEAD4' }}>{totalMembers}+</strong> recruiters joined
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" style={{
          background: '#F1F5F9', height: '48px',
          clipPath: 'ellipse(55% 100% at 50% 100%)',
        }} />

        <style>{`
          @media (max-width: 1024px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-img-col { display: none; }
          }
        `}</style>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <section id="discussions" style={{ background: '#F1F5F9', padding: '72px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '28px', alignItems: 'start' }} className="main-grid">

            {/* ────────────────────────────────────────
                MAIN COLUMN
            ──────────────────────────────────────── */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Search + Ask header card */}
              <div style={{
                background: 'white', borderRadius: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 24px rgba(15,23,42,0.07)',
                padding: '32px 36px',
              }}>
                {/* Section label */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '50px',
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#1E40AF', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '12px',
                  }}>
                    <MessageCircle style={{ width: 11, height: 11 }} />
                    Discussions &amp; Q&amp;A
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <h2 style={{ fontSize: 'clamp(22px,2.5vw,30px)', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                        What do you want to solve today?
                      </h2>
                      <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7 }}>
                        Search past answers or post a question for sourcing, screening, and recruiter workflows.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAskForm(!showAskForm)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: showAskForm ? '#0F172A' : 'linear-gradient(135deg, #1E40AF, #2563EB)',
                        color: 'white', fontWeight: 700, fontSize: '13px',
                        padding: '12px 22px', borderRadius: '10px', border: 'none',
                        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(30,64,175,0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {showAskForm
                        ? <><X style={{ width: 15, height: 15 }} /> Cancel</>
                        : <><PlusCircle style={{ width: 15, height: 15 }} /> Ask Question</>
                      }
                    </button>
                  </div>
                </div>

                {/* Ask form */}
                {showAskForm && (
                  <div style={{
                    marginBottom: '20px',
                    background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
                    border: '1px solid #BFDBFE', borderRadius: '14px', padding: '24px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>Post Your Question</p>
                    </div>
                    <form onSubmit={handleAskQuestion}>
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        required
                        rows={4}
                        placeholder="Describe your hiring challenge, screening dilemma, or sourcing question..."
                        style={{
                          width: '100%', resize: 'none', borderRadius: '10px',
                          border: '1.5px solid #BFDBFE', background: 'white',
                          padding: '14px 16px', fontSize: '14px', color: '#0F172A',
                          outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
                          transition: 'border-color 0.2s',
                          boxSizing: 'border-box',
                        }}
                        minLength={10}
                        onFocus={e => (e.currentTarget.style.borderColor = '#1E40AF')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#BFDBFE')}
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        <button
                          type="submit"
                          disabled={loading}
                          style={{
                            background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                            color: 'white', fontWeight: 700, fontSize: '13px',
                            padding: '11px 24px', borderRadius: '8px', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
                          }}
                        >
                          {loading ? 'Posting...' : 'Post Question'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAskForm(false)}
                          style={{
                            background: 'white', color: '#64748B', fontWeight: 600,
                            fontSize: '13px', padding: '11px 20px', borderRadius: '8px',
                            border: '1.5px solid #E2E8F0', cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Search bar */}
                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                    borderRadius: '12px', overflow: 'hidden',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                    onFocusCapture={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.borderColor = '#1E40AF'
                      el.style.boxShadow = '0 0 0 4px rgba(30,64,175,0.08)'
                    }}
                    onBlurCapture={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.borderColor = '#E2E8F0'
                      el.style.boxShadow = 'none'
                    }}
                  >
                    <Search style={{ width: 18, height: 18, color: '#94A3B8', marginLeft: '18px', flexShrink: 0 }} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search questions, topics, hiring problems..."
                      style={{
                        flex: 1, height: '54px', background: 'transparent',
                        border: 'none', padding: '0 16px', fontSize: '14px',
                        color: '#0F172A', outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                        color: 'white', fontWeight: 700, fontSize: '13px',
                        padding: '0 24px', height: '54px', border: 'none',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'opacity 0.2s',
                      }}


                    >
                      Search
                    </button>
                  </div>
                </form>

                {query && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Results for:</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 12px', borderRadius: '50px',
                      background: '#EFF6FF', color: '#1E40AF', fontSize: '12px', fontWeight: 700,
                    }}>
                      &ldquo;{query}&rdquo;
                      <Link href="/community" style={{ color: '#64748B', lineHeight: 1 }}>
                        <X style={{ width: 12, height: 12 }} />
                      </Link>
                    </span>
                  </div>
                )}
              </div>

              {/* Question cards */}
              {questions.length === 0 ? (
                <div style={{
                  background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0',
                  padding: '64px 40px', textAlign: 'center',
                  boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
                    background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MessageCircle style={{ width: 28, height: 28, color: '#1E40AF' }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                    {query ? `No results for "${query}"` : 'No questions yet'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#64748B' }}>
                    {query ? 'Try a different search term or browse all discussions.' : 'Be the first to ask a question in this community!'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {questions.map((q, index) => {
                    const color = getAvatarColor(index)
                    const isHovered = hoveredCard === q.id
                    return (
                      <article
                        key={q.id}
                        style={{
                          background: 'white', borderRadius: '18px',
                          border: isHovered ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          boxShadow: isHovered
                            ? '0 16px 48px rgba(30,64,175,0.12)'
                            : '0 2px 12px rgba(15,23,42,0.05)',
                          padding: '28px 32px',
                          transition: 'all 0.25s ease',
                          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                          cursor: 'default',
                        }}


                      >
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                          {/* Avatar */}
                          <div style={{ flexShrink: 0, position: 'relative' }}>
                            <div style={{
                              width: '52px', height: '52px', borderRadius: '14px',
                              overflow: 'hidden', border: `2px solid ${color.border}`,
                              position: 'relative', background: color.bg,
                            }}>
                              <Image
                                src={getAvatar(index)}
                                alt={q.user?.name || 'Member'}
                                fill
                                sizes="52px"
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            {/* Online dot */}
                            <div style={{
                              position: 'absolute', bottom: '2px', right: '2px',
                              width: '10px', height: '10px', borderRadius: '50%',
                              background: '#10B981', border: '2px solid white',
                            }} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Meta row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  width: '20px', height: '20px', borderRadius: '6px',
                                  background: color.bg, color: color.text, fontSize: '9px', fontWeight: 800,
                                }}>
                                  {getInitials(q.user?.name || 'TM')}
                                </span>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                  {q.user?.name || 'Trainee Member'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar style={{ width: 12, height: 12, color: '#94A3B8' }} />
                                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                                  {formatDate(q.createdAt)}
                                </span>
                              </div>
                              {/* Answer count badge */}
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '3px 10px', borderRadius: '50px',
                                background: q._count.answers > 0 ? '#F0FDF4' : '#F8FAFC',
                                border: `1px solid ${q._count.answers > 0 ? '#BBF7D0' : '#E2E8F0'}`,
                              }}>
                                <MessageSquare style={{ width: 11, height: 11, color: q._count.answers > 0 ? '#059669' : '#94A3B8' }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: q._count.answers > 0 ? '#059669' : '#64748B' }}>
                                  {q._count.answers} {q._count.answers === 1 ? 'answer' : 'answers'}
                                </span>
                              </div>
                            </div>

                            {/* Question text */}
                            <h3 style={{
                              fontSize: '16px', fontWeight: 700,
                              color: isHovered ? '#1E40AF' : '#0F172A',
                              lineHeight: 1.4, letterSpacing: '-0.01em',
                              marginBottom: '16px',
                              transition: 'color 0.2s',
                            }}>
                              {q.question}
                            </h3>

                            {/* Footer row */}
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              paddingTop: '14px', borderTop: '1px solid #F1F5F9',
                              flexWrap: 'wrap', gap: '10px',
                            }}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                  padding: '4px 12px', borderRadius: '50px',
                                  background: '#EFF6FF', color: '#1E40AF',
                                  fontSize: '11px', fontWeight: 600,
                                }}>HR Recruitment</span>
                                <span style={{
                                  padding: '4px 12px', borderRadius: '50px',
                                  background: '#F8FAFC', color: '#64748B',
                                  fontSize: '11px', fontWeight: 600,
                                  border: '1px solid #E2E8F0',
                                }}>Q&amp;A</span>
                              </div>
                              <Link href={`/community/${q.id}`} style={{
                                display: 'inline-flex', alignItems: 'center',
                                gap: isHovered ? '10px' : '6px',
                                fontSize: '13px', fontWeight: 700, color: '#1E40AF',
                                transition: 'gap 0.2s', textDecoration: 'none',
                              }}>
                                Join Discussion
                                <ArrowRight style={{ width: 14, height: 14 }} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '8px' }}>
                  {pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`d-${i}`} style={{ padding: '0 8px', color: '#94A3B8', fontSize: '14px' }}>…</span>
                    ) : (
                      <Link
                        key={p}
                        href={`/community?page=${p}${query ? `&q=${query}` : ''}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '42px', height: '42px', borderRadius: '10px',
                          fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                          border: p === pagination.page ? 'none' : '1.5px solid #E2E8F0',
                          background: p === pagination.page ? 'linear-gradient(135deg, #1E40AF, #2563EB)' : 'white',
                          color: p === pagination.page ? 'white' : '#64748B',
                          boxShadow: p === pagination.page ? '0 4px 16px rgba(30,64,175,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {p}
                      </Link>
                    )
                  )}
                </div>
              )}
            </main>

            {/* ────────────────────────────────────────
                SIDEBAR
            ──────────────────────────────────────── */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'sticky', top: '100px' }} className="sidebar-col">

              {/* Live Stats */}
              <div style={{
                background: 'white', borderRadius: '18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding: '18px 24px', borderBottom: '1px solid #F1F5F9',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                    Community Stats
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {[
                    { icon: MessageSquare, value: totalQuestions, label: 'Questions', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
                    { icon: Users, value: totalMembers, label: 'Members', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
                  ].map(({ icon: Icon, value, label, color, bg, border }, idx) => (
                    <div key={label} style={{
                      padding: '24px 20px',
                      borderRight: idx === 0 ? '1px solid #F1F5F9' : 'none',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: bg, border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px',
                      }}>
                        <Icon style={{ width: 18, height: 18, color }} />
                      </div>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it Works */}
              <div style={{
                background: 'white', borderRadius: '18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
                overflow: 'hidden',
              }}>
                {/* Image header */}
                <div style={{ position: 'relative', height: '160px', background: '#0F172A' }}>
                  <Image
                    src="/assets/images/team/style1/1.jpg"
                    alt="Community mentor"
                    fill
                    sizes="340px"
                    style={{ objectFit: 'cover', objectPosition: 'top' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.85) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <TrendingUp style={{ width: 13, height: 13, color: '#F59E0B' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                        How It Works
                      </span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
                      Get sharper answers from real practice.
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { icon: PlusCircle, step: '01', label: 'Ask hiring questions', desc: 'Post your real recruitment challenges' },
                    { icon: BookOpen, step: '02', label: 'Share field-tested answers', desc: 'Contribute from your own experience' },
                    { icon: Shield, step: '03', label: 'Learn from recruiter cases', desc: 'Build judgment from diverse hiring scenarios' },
                  ].map(({ icon: Icon, step, label, desc }, idx) => (
                    <div key={step} style={{
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                      padding: '14px 0',
                      borderBottom: idx < 2 ? '1px solid #F1F5F9' : 'none',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                        border: '1px solid #BFDBFE',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon style={{ width: 16, height: 16, color: '#1E40AF' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>{label}</p>
                        <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connect & Share CTA */}
              <div style={{
                borderRadius: '18px', overflow: 'hidden', position: 'relative',
                background: 'linear-gradient(145deg, #0A1628 0%, #0F172A 50%, #0D1F3C 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
              }}>
                {/* bg texture */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                }} />
                <div className="absolute" style={{ top: '-30px', right: '-30px', width: 160, height: 160, background: 'radial-gradient(circle, rgba(30,64,175,0.3) 0%, transparent 65%)', pointerEvents: 'none' }} />
                {/* Gold top border */}
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #1E40AF, #F59E0B, #14B8A6)' }} />

                <div style={{ padding: '28px 24px', position: 'relative' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '50px',
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                    marginBottom: '14px',
                  }}>
                    <Sparkles style={{ width: 11, height: 11, color: '#F59E0B' }} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#FCD34D', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                      Free to Join
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: '10px', letterSpacing: '-0.01em' }}>
                    Connect &amp; Share
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '20px' }}>
                    Register to ask questions, share answers, and stay connected with Recruitment Institute learners.
                  </p>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {['Ask unlimited questions', 'Get answers from real recruiters', 'Build your HR network'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: 14, height: 14, color: '#14B8A6', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/candidate-login" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                    color: 'white', fontWeight: 700, fontSize: '13px',
                    padding: '13px 20px', borderRadius: '10px',
                    textDecoration: 'none', boxShadow: '0 6px 20px rgba(30,64,175,0.4)',
                    transition: 'all 0.2s ease',
                  }}


                  >
                    Register / Login
                    <ArrowRight style={{ width: 15, height: 15 }} />
                  </Link>
                </div>
              </div>

            </aside>
          </div>
        </div>

        <style>{`
          @media (max-width: 1024px) {
            .main-grid { grid-template-columns: 1fr !important; }
            .sidebar-col { position: static !important; }
          }
        `}</style>
      </section>
    </>
  )
}
