'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  PlusCircle,
  Send,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Answer {
  id: number
  answer: string
  createdAt: Date
  user: { name: string; email: string } | null
}

interface Question {
  id: number
  question: string
  createdAt: Date
  user: { name: string; email: string } | null
  answers: Answer[]
  _count: { answers: number }
}

interface Props {
  question: Question
}

const avatarImages = [
  '/assets/images/team/style1/1.jpg',
  '/assets/images/team/style1/2.jpg',
  '/assets/images/team/style1/3.jpg',
  '/assets/images/team/style2/1.jpg',
  '/assets/images/team/style2/3.jpg',
  '/assets/images/team/style2/5.jpg',
]

const answerAvatarImages = [
  '/assets/images/team/style2/2.jpg',
  '/assets/images/team/style2/4.jpg',
  '/assets/images/team/style1/4.jpg',
  '/assets/images/team/style1/5.jpg',
  '/assets/images/team/style1/6.jpg',
  '/assets/images/team/style2/6.jpg',
]

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function QuestionDetailClient({ question }: Props) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>(question.answers)

  const handlePostAnswer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/community/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, answer }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Answer posted!')
        setAnswers((prev) => [...prev, data.data])
        setAnswer('')
      } else if (data.message?.toLowerCase().includes('login')) {
        toast.error('Please login to post an answer')
        router.push('/candidate-login')
      } else {
        toast.error(data.message || 'Failed to post answer')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const questionAvatar = avatarImages[question.id % avatarImages.length]

  return (
    <>
      {/* ── Header strip ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0F172A 60%, #0D1F3C 100%)',
        padding: '40px 0 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute pointer-events-none" style={{ top: '-60px', left: '-60px', width: 360, height: 360, background: 'radial-gradient(circle, rgba(30,64,175,0.18) 0%, transparent 65%)' }} />
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #F59E0B 30%, #14B8A6 70%, transparent)' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '12px', fontWeight: 600 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>Home</Link>
            <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
            <Link href="/community" style={{ color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>Community</Link>
            <ChevronRight style={{ width: 12, height: 12, color: '#475569' }} />
            <span style={{ color: '#94A3B8' }}>Discussion</span>
          </div>

          {/* Back link */}
          <Link href="/community" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#94A3B8', textDecoration: 'none', fontSize: '13px',
            fontWeight: 600, marginBottom: '24px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to Community
          </Link>

          {/* Question title */}
          <h1 style={{
            fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 800,
            color: 'white', lineHeight: 1.3, letterSpacing: '-0.02em',
            maxWidth: '820px', marginBottom: '20px',
          }}>
            {question.question}
          </h1>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '2px solid rgba(255,255,255,0.15)' }}>
                <Image src={questionAvatar} alt="" fill sizes="32px" style={{ objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>
                {question.user?.name || 'Community Member'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar style={{ width: 13, height: 13, color: '#64748B' }} />
              <span style={{ fontSize: '12px', color: '#64748B' }}>{formatDate(question.createdAt)}</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '50px',
              background: answers.length > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
              border: `1px solid ${answers.length > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
            }}>
              <MessageSquare style={{ width: 12, height: 12, color: answers.length > 0 ? '#10B981' : '#64748B' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: answers.length > 0 ? '#10B981' : '#94A3B8' }}>
                {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <section style={{ background: '#F1F5F9', padding: '48px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '24px', alignItems: 'start' }} className="detail-grid">

            {/* ── Left: Answers + Post form ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Answer count header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: 'linear-gradient(135deg, #1E40AF, #2563EB)' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {answers.length === 0
                    ? 'No answers yet — be the first!'
                    : `${answers.length} ${answers.length === 1 ? 'Answer' : 'Answers'}`}
                </h2>
              </div>

              {/* Answer cards */}
              {answers.map((ans, idx) => {
                const avatar = answerAvatarImages[idx % answerAvatarImages.length]
                const color = ['#1E40AF', '#059669', '#7C3AED', '#EA580C', '#0891B2'][idx % 5]
                const bg = ['#EFF6FF', '#F0FDF4', '#F5F3FF', '#FFF7ED', '#ECFEFF'][idx % 5]
                const border = ['#BFDBFE', '#BBF7D0', '#DDD6FE', '#FED7AA', '#A5F3FC'][idx % 5]

                return (
                  <div key={ans.id} style={{
                    background: 'white', borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
                    padding: '24px 28px',
                  }}>
                    {/* Answer author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: `2px solid ${border}`, background: bg, flexShrink: 0 }}>
                        <Image src={avatar} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {ans.user?.name || 'Community Member'}
                        </p>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{formatDate(ans.createdAt)}</p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '50px',
                          background: bg, border: `1px solid ${border}`,
                        }}>
                          <CheckCircle2 style={{ width: 11, height: 11, color }} />
                          <span style={{ fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Answer</span>
                        </div>
                      </div>
                    </div>

                    {/* Answer body */}
                    <p style={{
                      fontSize: '15px', color: '#334155', lineHeight: 1.8,
                      margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {ans.answer}
                    </p>
                  </div>
                )
              })}

              {/* Post answer form */}
              <div style={{
                background: 'white', borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
                overflow: 'hidden',
              }}>
                {/* Form header */}
                <div style={{
                  padding: '18px 28px', borderBottom: '1px solid #F1F5F9',
                  background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1E40AF, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PlusCircle style={{ width: 15, height: 15, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Post Your Answer</p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Share your recruiter experience and insights</p>
                  </div>
                </div>

                <form onSubmit={handlePostAnswer} style={{ padding: '24px 28px' }}>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    rows={5}
                    minLength={5}
                    placeholder="Share your experience, best practices, or practical tips that could help..."
                    style={{
                      width: '100%', resize: 'vertical', borderRadius: '10px',
                      border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                      padding: '14px 16px', fontSize: '14px', color: '#0F172A',
                      outline: 'none', fontFamily: 'inherit', lineHeight: 1.7,
                      boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#1E40AF'
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(30,64,175,0.08)'
                      e.currentTarget.style.background = 'white'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = '#E2E8F0'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.background = '#F8FAFC'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                      Login required to post. Keep answers practical and respectful.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: loading ? '#94A3B8' : 'linear-gradient(135deg, #1E40AF, #2563EB)',
                        color: 'white', fontWeight: 700, fontSize: '13px',
                        padding: '11px 24px', borderRadius: '10px', border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 4px 16px rgba(30,64,175,0.3)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                    >
                      <Send style={{ width: 14, height: 14 }} />
                      {loading ? 'Posting...' : 'Post Answer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* ── Right: Sidebar ── */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }} className="detail-sidebar">

              {/* Stats card */}
              <div style={{
                background: 'white', borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Thread Info</span>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: MessageSquare, label: 'Answers', value: answers.length, color: '#1E40AF', bg: '#EFF6FF' },
                    { icon: Users, label: 'Participants', value: new Set([question.user?.email, ...answers.map(a => a.user?.email)].filter(Boolean)).size, color: '#059669', bg: '#F0FDF4' },
                    { icon: Calendar, label: 'Posted', value: formatDate(question.createdAt), color: '#7C3AED', bg: '#F5F3FF' },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 16, height: 16, color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, fontWeight: 600 }}>{label}</p>
                        <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asked by */}
              <div style={{
                background: 'white', borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
                padding: '20px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>Asked By</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '2px solid #BFDBFE', flexShrink: 0 }}>
                    <Image src={questionAvatar} alt="" fill sizes="44px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {question.user?.name || 'Community Member'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>HR Recruiter</p>
                  </div>
                </div>
                <div style={{
                  marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
                  background: '#EFF6FF', border: '1px solid #BFDBFE',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <CheckCircle2 style={{ width: 13, height: 13, color: '#1E40AF' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF' }}>Verified Community Member</span>
                </div>
              </div>

              {/* CTA */}
              <div style={{
                borderRadius: '16px', overflow: 'hidden', position: 'relative',
                background: 'linear-gradient(145deg, #0A1628, #0F172A)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                padding: '24px 20px',
              }}>
                <div style={{ height: '2px', background: 'linear-gradient(90deg, #1E40AF, #F59E0B)', marginBottom: '16px', borderRadius: '1px' }} />
                <p style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Know the answer?</p>
                <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px' }}>
                  Login and share your recruiter experience to help the community.
                </p>
                <Link href="/candidate-login" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                  color: 'white', fontWeight: 700, fontSize: '13px',
                  padding: '11px 16px', borderRadius: '8px',
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(30,64,175,0.4)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >
                  Login to Answer
                </Link>
                <Link href="/community" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  color: '#64748B', fontSize: '12px', fontWeight: 600,
                  textDecoration: 'none', marginTop: '10px',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
                >
                  ← Back to all discussions
                </Link>
              </div>
            </aside>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .detail-grid { grid-template-columns: 1fr !important; }
            .detail-sidebar { position: static !important; }
          }
        `}</style>
      </section>
    </>
  )
}
