import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { MessageCircleQuestion, MessageSquare, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import AnswerActions from '@/components/admin/AnswerActions'
import QuestionActions from '@/components/admin/QuestionActions'

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sp     = await searchParams
  const filter = (sp.filter as 'all' | 'pending' | 'approved') || 'all'

  const questions = await prisma.question.findMany({
    include: {
      user: true,
      answers: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalAns   = questions.reduce((s, q) => s + q.answers.length, 0)
  const approved   = questions.reduce((s, q) => s + q.answers.filter((a) => a.isApproved).length, 0)
  const pending    = totalAns - approved
  const answered   = questions.filter((q) => q.answers.length > 0).length
  const unanswered = questions.filter((q) => q.answers.length === 0).length

  /* filter questions based on answer approval status */
  const filtered = filter === 'pending'
    ? questions.filter((q) => q.answers.some((a) => !a.isApproved))
    : filter === 'approved'
    ? questions.filter((q) => q.answers.some((a) => a.isApproved))
    : questions

  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777']

  return (
    <AdminLayout title="Question & Answer">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0284c7' }}>
            <MessageCircleQuestion style={{ width: 11, height: 11 }} />
            Community Q&A
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Question &amp; Answer
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Approve or remove community answers. Delete off-topic questions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Questions', value: questions.length, icon: MessageCircleQuestion, accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Answered',        value: answered,         icon: CheckCircle2,          accent: '#059669', bg: '#f0fdf4' },
            { label: 'Unanswered',      value: unanswered,       icon: Clock,                 accent: '#d97706', bg: '#fffbeb' },
            { label: 'Total Answers',   value: totalAns,         icon: MessageSquare,         accent: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Approved',        value: approved,         icon: ShieldCheck,           accent: '#0891b2', bg: '#ecfeff' },
            { label: 'Pending Review',  value: pending,          icon: Clock,                 accent: '#dc2626', bg: '#fef2f2' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div className="flex items-center gap-1.5 mb-2"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
                <span className="rounded-full font-semibold"
                  style={{ fontSize: 10, padding: '3px 8px', background: bg, color: accent, border: `1px solid ${accent}22` }}>
                  {label === 'Pending Review' && value > 0 ? 'Action needed' : 'Live'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all',      label: 'All Questions',  count: questions.length },
          { key: 'pending',  label: 'Has Pending',    count: questions.filter((q) => q.answers.some((a) => !a.isApproved)).length },
          { key: 'approved', label: 'All Approved',   count: questions.filter((q) => q.answers.some((a) => a.isApproved)).length },
        ].map((tab) => {
          const isActive = filter === tab.key
          return (
            <a key={tab.key} href={`/admin/questions?filter=${tab.key}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                ...(isActive
                  ? { background: '#2563eb', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.28)' }
                  : { background: '#fff', color: '#475569', border: '1px solid #e8ecf0' }),
              }}
            >
              {tab.label}
              <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 100, background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: isActive ? '#fff' : '#64748b', fontWeight: 700 }}>
                {tab.count}
              </span>
            </a>
          )
        })}
      </div>

      {/* ── Questions list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
            <MessageCircleQuestion style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No questions here</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {filter === 'pending' ? 'No questions with pending answers.' : 'No questions match this filter.'}
            </p>
          </div>
        ) : filtered.map((q) => {
          const hasAnswers = q.answers.length > 0
          const initials   = q.user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
          const color      = colors[q.userId % colors.length]
          const pendingCount  = q.answers.filter((a) => !a.isApproved).length
          const approvedCount = q.answers.filter((a) => a.isApproved).length

          return (
            <div key={q.id}
              style={{ background: '#fff', border: `1px solid ${hasAnswers ? '#e8ecf0' : '#fde68a'}`, borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}
            >
              {/* Question header */}
              <div style={{ padding: '18px 24px', borderBottom: hasAnswers ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-start justify-between gap-4">
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.45, flex: 1 }}>{q.question}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {pendingCount > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                          {pendingCount} pending
                        </span>
                      )}
                      {approvedCount > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          {approvedCount} approved
                        </span>
                      )}
                      {!hasAnswers && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                          Unanswered
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        <span style={{ fontWeight: 600 }}>{q.user.name}</span>
                        {q.user.email && <span style={{ color: '#94a3b8' }}> · {q.user.email}</span>}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <QuestionActions questionId={q.id} />
                  </div>
                </div>
              </div>

              {/* Answers */}
              {q.answers.length > 0 && (
                <div style={{ background: '#f8fafc' }}>
                  {/* answers table header */}
                  <div style={{ padding: '8px 24px', background: '#f1f5f9', borderBottom: '1px solid #e8ecf0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>Answer</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#94a3b8' }}>Actions</span>
                  </div>

                  {q.answers.map((ans, aIdx) => {
                    const aInitials = ans.user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
                    const aColor    = colors[ans.userId % colors.length]
                    return (
                      <div key={ans.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 24px',
                          borderTop: aIdx === 0 ? 'none' : '1px solid #e8ecf0',
                          background: ans.isApproved ? 'rgba(240,253,244,0.5)' : '#fff',
                          borderLeft: `3px solid ${ans.isApproved ? '#22c55e' : '#f59e0b'}`,
                        }}
                      >
                        {/* approved indicator */}
                        <div style={{ marginLeft: 4, width: 28, height: 28, borderRadius: '50%', background: aColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {aInitials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{ans.user.name}</span>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>
                              {new Date(ans.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {ans.isApproved ? (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                                ✓ Approved
                              </span>
                            ) : (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                                Pending
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{ans.answer}</p>
                        </div>
                        <AnswerActions answerId={ans.id} isApproved={ans.isApproved} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
