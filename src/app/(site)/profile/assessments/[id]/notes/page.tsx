import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpen, ArrowLeft, Lightbulb, Tag, ListChecks, FileText } from 'lucide-react'
import { getUserSession } from '@/lib/auth'
import { getAssessmentNotes, FastApiError } from '@/lib/fastapiClient'

export const metadata: Metadata = {
  title: 'AI Study Notes',
  robots: { index: false, follow: false },
}

const TOPIC_COLORS = [
  { bg: '#EFF6FF', border: '#BFDBFE', header: 'linear-gradient(135deg,#1d4ed8,#2563eb)', icon: '#93c5fd', tag: '#dbeafe', tagText: '#1e40af' },
  { bg: '#F5F3FF', border: '#DDD6FE', header: 'linear-gradient(135deg,#6d28d9,#7c3aed)', icon: '#c4b5fd', tag: '#ede9fe', tagText: '#5b21b6' },
  { bg: '#ECFDF5', border: '#A7F3D0', header: 'linear-gradient(135deg,#047857,#059669)', icon: '#6ee7b7', tag: '#d1fae5', tagText: '#065f46' },
  { bg: '#FFF7ED', border: '#FED7AA', header: 'linear-gradient(135deg,#c2410c,#ea580c)', icon: '#fdba74', tag: '#ffedd5', tagText: '#9a3412' },
  { bg: '#FDF2F8', border: '#F9A8D4', header: 'linear-gradient(135deg,#9d174d,#db2777)', icon: '#f9a8d4', tag: '#fce7f3', tagText: '#831843' },
  { bg: '#FFFBEB', border: '#FDE68A', header: 'linear-gradient(135deg,#92400e,#d97706)', icon: '#fcd34d', tag: '#fef3c7', tagText: '#78350f' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function toTitleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

// Upgrade old-format notes (bold headings) to proper ### markdown sections
// so they render consistently with the new rich format.
function upgradeNotesContent(content: string, topicName: string): string {
  let out = content
  // Replace "### Notes for X" with "### Overview"
  out = out.replace(/^###\s*Notes for .+$/im, '### Overview')
  // Convert **Section Title** on its own line to ### Section Title
  out = out.replace(/^\*\*(Summary|Key Points to Remember|Key Terms|Source material referenced)\*\*$/gim, '### $1')
  // If still no ### headings, the whole content is plain — wrap it
  if (!out.includes('###')) {
    out = `### Overview\n\n${out}`
  }
  return out
}

export default async function AssessmentNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession()
  if (!session || session.type !== 'student') redirect('/student-login')

  const { id } = await params
  const studentAssessmentId = Number(id)
  if (!studentAssessmentId) notFound()

  let notes
  try {
    notes = await getAssessmentNotes(studentAssessmentId)
  } catch (error) {
    if (error instanceof FastApiError && (error.status === 404 || error.status === 401)) notFound()
    throw error
  }

  return (
    <>
      <style>{`
        .notes-page { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }

        /* breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 28px; }
        .breadcrumb a { font-size: 12px; font-weight: 600; color: #94a3b8; text-decoration: none; transition: color .15s; }
        .breadcrumb a:hover { color: #2563eb; }
        .breadcrumb-sep { color: #cbd5e1; font-size: 12px; }
        .breadcrumb-cur { font-size: 12px; font-weight: 700; color: #2563eb; }

        /* hero */
        .notes-hero {
          background: linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#1d4ed8 100%);
          border-radius: 24px; padding: 36px 40px; margin-bottom: 36px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
          position: relative; overflow: hidden;
        }
        .notes-hero::before {
          content: ''; position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .hero-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .hero-count {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: #bfdbfe;
          margin-bottom: 10px;
        }
        .hero-back {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; font-size: 13px; font-weight: 700; text-decoration: none;
          backdrop-filter: blur(8px); transition: background .2s; white-space: nowrap;
        }
        .hero-back:hover { background: rgba(255,255,255,0.2); }

        /* layout */
        .notes-layout { display: grid; grid-template-columns: 220px 1fr; gap: 28px; align-items: start; }
        @media (max-width: 768px) { .notes-layout { grid-template-columns: 1fr; } .notes-sidebar { display: none; } }

        /* sidebar */
        .notes-sidebar {
          position: sticky; top: 24px;
          background: #fff; border: 1px solid #e8ecf0; border-radius: 18px;
          padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .sidebar-title { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; }
        .sidebar-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px; text-decoration: none;
          font-size: 13px; font-weight: 600; color: #475569;
          transition: all .15s; margin-bottom: 4px; border: 1px solid transparent;
        }
        .sidebar-item:hover { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .sidebar-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* note cards */
        .note-card {
          border-radius: 22px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          margin-bottom: 24px; border: 1px solid;
        }
        .note-header {
          padding: 22px 28px; display: flex; align-items: center; gap: 14px;
        }
        .note-header-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2);
        }
        .note-num {
          font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,0.65); margin-bottom: 2px;
        }
        .note-title { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -.01em; }

        .note-body { padding: 28px 32px; }

        /* markdown inside note-body */
        .note-body h3 {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
          color: #94a3b8; margin: 24px 0 12px; padding-bottom: 8px;
          border-bottom: 1px solid #e8ecf0;
        }
        .note-body h3:first-child { margin-top: 0; }
        .note-body strong { color: #0f172a; font-weight: 700; }
        .note-body p { font-size: 14px; color: #334155; line-height: 1.85; margin: 0 0 12px; }
        .note-body ul {
          list-style: none; padding: 0; margin: 0 0 14px; display: flex; flex-direction: column; gap: 6px;
        }
        .note-body ul li {
          font-size: 14px; color: #334155; line-height: 1.7;
          padding: 8px 12px 8px 36px; border-radius: 8px;
          background: #f8fafc; position: relative;
        }
        .note-body ul li::before {
          content: '→'; position: absolute; left: 12px; color: #2563eb; font-weight: 700;
        }
        .note-body a { color: #2563eb; text-decoration: underline; }
        .note-body code {
          background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 5px;
          padding: 1px 6px; font-size: 12px; color: #0f172a;
        }

        /* key-terms section styling */
        .note-body ul li strong { font-weight: 700; color: #0f172a; }

        /* empty */
        .notes-empty {
          background: #fff; border: 2px dashed #e2e8f0; border-radius: 24px;
          padding: 64px 32px; text-align: center;
        }

        /* tip box */
        .tip-box {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px;
          padding: 14px 18px; display: flex; align-items: flex-start; gap: 10; margin-bottom: 28px;
        }
      `}</style>

      <div className="notes-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/profile" className="breadcrumb a" style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>Profile</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/profile/assessments/${studentAssessmentId}`} style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>Result</Link>
          <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>AI Study Notes</span>
        </nav>

        {/* Hero */}
        <div className="notes-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="hero-icon">
              <BookOpen style={{ width: 26, height: 26, color: '#fff' }} />
            </div>
            <div>
              <div className="hero-count">
                <ListChecks style={{ width: 13, height: 13 }} />
                {notes.length} topic{notes.length !== 1 ? 's' : ''} covered
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.1, margin: 0 }}>
                Your AI Study Notes
              </h1>
              <p style={{ fontSize: 14, color: '#93c5fd', marginTop: 6, maxWidth: 480 }}>
                Personalised notes on your weak topics — generated from course curriculum to help you close knowledge gaps fast.
              </p>
            </div>
          </div>
          <Link href={`/profile/assessments/${studentAssessmentId}`} className="hero-back">
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back to Result
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="notes-empty">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ListChecks style={{ width: 28, height: 28, color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Weak Topics Found</h2>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
              You performed well across all assessed topics — no extra study notes were generated for this attempt. Great work!
            </p>
            <Link href={`/profile/assessments/${studentAssessmentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, padding: '10px 20px', borderRadius: 12, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Result
            </Link>
          </div>
        ) : (
          <div className="notes-layout">
            {/* Sidebar index */}
            <aside className="notes-sidebar">
              <p className="sidebar-title">Topics in this report</p>
              {notes.map((note, idx) => {
                const color = TOPIC_COLORS[idx % TOPIC_COLORS.length]
                return (
                  <a key={note.id} href={`#topic-${slugify(note.topic_name)}`} className="sidebar-item">
                    <span className="sidebar-dot" style={{ background: color.header.includes('#1d4ed8') ? '#2563eb' : color.header.includes('#6d28d9') ? '#7c3aed' : color.header.includes('#047857') ? '#059669' : color.header.includes('#c2410c') ? '#ea580c' : color.header.includes('#9d174d') ? '#db2777' : '#d97706' }} />
                    <span style={{ lineHeight: 1.3 }}>{toTitleCase(note.topic_name)}</span>
                  </a>
                )
              })}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <Lightbulb style={{ width: 13, height: 13, color: '#d97706', flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: '#92400e', fontWeight: 600, lineHeight: 1.4 }}>Review these before your next attempt</p>
                </div>
              </div>
            </aside>

            {/* Note cards */}
            <div>
              {/* tip banner */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', marginBottom: 28 }}>
                <Lightbulb style={{ width: 18, height: 18, color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                  <strong>Study tip:</strong> Read each section fully, rewrite key points in your own words, then test yourself before your next assessment attempt.
                </p>
              </div>

              {notes.map((note, idx) => {
                const color = TOPIC_COLORS[idx % TOPIC_COLORS.length]
                return (
                  <div
                    key={note.id}
                    id={`topic-${slugify(note.topic_name)}`}
                    className="note-card"
                    style={{ background: color.bg, borderColor: color.border }}
                  >
                    {/* Card header */}
                    <div className="note-header" style={{ background: color.header }}>
                      <div className="note-header-icon">
                        <FileText style={{ width: 20, height: 20, color: '#fff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="note-num">Topic {idx + 1} of {notes.length}</p>
                        <h2 className="note-title">{toTitleCase(note.topic_name)}</h2>
                      </div>
                      <span style={{ padding: '5px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                        Weak Topic
                      </span>
                    </div>

                    {/* Card body — markdown */}
                    <div className="note-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        // eslint-disable-next-line react/no-children-prop
                        key={note.id}
                        components={{
                          h3: ({ children }) => {
                            const text = String(children)
                            const titled = toTitleCase(text)
                            return (
                              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#64748b', marginTop: 28, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                                {(text.includes('Overview') || text.includes('Summary')) && <FileText style={{ width: 13, height: 13 }} />}
                                {text.includes('Key Points') && <ListChecks style={{ width: 13, height: 13 }} />}
                                {text.includes('Key Terms') && <Tag style={{ width: 13, height: 13 }} />}
                                {(text.includes('Source') || text.includes('Practical')) && <BookOpen style={{ width: 13, height: 13 }} />}
                                {text.includes('Understanding') && <Lightbulb style={{ width: 13, height: 13 }} />}
                                {titled}
                              </h3>
                            )
                          },
                          p: ({ children }) => (
                            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.85, margin: '0 0 12px' }}>{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, padding: '9px 14px 9px 38px', borderRadius: 10, background: '#fff', border: '1px solid #e8ecf0', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#2563eb', fontWeight: 800, fontSize: 14 }}>→</span>
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong style={{ fontWeight: 700, color: '#0f172a' }}>{children}</strong>
                          ),
                          code: ({ children }) => (
                            <code style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 6px', fontSize: 12, color: '#0f172a', fontFamily: 'monospace' }}>{children}</code>
                          ),
                        }}
                      >
                        {upgradeNotesContent(note.notes_content, note.topic_name)}
                      </ReactMarkdown>
                    </div>
                  </div>
                )
              })}

              {/* Bottom CTA */}
              <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a8a)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Ready to improve your score?</h3>
                  <p style={{ fontSize: 13, color: '#93c5fd' }}>Check your study plan or retake the assessment.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/profile/assessments/${studentAssessmentId}/study-plan`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    View Study Plan
                  </Link>
                  <Link href={`/profile/assessments/${studentAssessmentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: '#fff', color: '#1e40af', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Result
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
