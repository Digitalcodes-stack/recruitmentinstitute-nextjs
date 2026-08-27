'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Video, FileText,
  ClipboardList, HelpCircle, Download, Paperclip, Loader2, Award,
  BookOpen, LayoutList, Play,
} from 'lucide-react'
import SessionCompletionModal from '@/components/shared/SessionCompletionModal'

interface ResourceRow { id: number; title: string; fileUrl: string }
interface LessonRow {
  id: number; title: string; type: string; videoUrl: string | null
  bodyHtml: string | null; resources: ResourceRow[]
}
interface TopicRow { id: number; title: string; lessons: LessonRow[] }
interface ChapterRow { id: number; title: string; topics: TopicRow[] }
interface ModuleRow { id: number; title: string; chapters: ChapterRow[] }

const LESSON_ICON: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  VIDEO: Video, PDF: FileText, PPT: FileText, ASSIGNMENT: ClipboardList, QUIZ: HelpCircle, DOWNLOAD: Download,
}

const TAB_BTN = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: 700, transition: 'all .15s',
  background: active ? '#1d4ed8' : 'transparent',
  color: active ? '#fff' : '#64748b',
})

// ── Module colour palette (cycles) ──────────────────────────────────────────
const MODULE_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', num: '#1d4ed8', numBg: '#dbeafe', bar: '#2563eb' },
  { bg: '#f5f3ff', border: '#ddd6fe', num: '#6d28d9', numBg: '#ede9fe', bar: '#7c3aed' },
  { bg: '#ecfdf5', border: '#a7f3d0', num: '#047857', numBg: '#d1fae5', bar: '#059669' },
  { bg: '#fff7ed', border: '#fed7aa', num: '#c2410c', numBg: '#ffedd5', bar: '#ea580c' },
  { bg: '#fdf2f8', border: '#f9a8d4', num: '#9d174d', numBg: '#fce7f3', bar: '#db2777' },
  { bg: '#fffbeb', border: '#fde68a', num: '#92400e', numBg: '#fef3c7', bar: '#d97706' },
]

export default function CoursePlayer({ courseId }: { courseId: number }) {
  const [data, setData] = useState<{ course: { title: string }; modules: ModuleRow[]; completedLessonIds: number[] } | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [marking, setMarking] = useState(false)
  const [tab, setTab] = useState<'lessons' | 'curriculum'>('lessons')
  const [expandedModule, setExpandedModule] = useState<number | null>(0)

  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completedLessonData, setCompletedLessonData] = useState<{ title: string; nextLessonId: number | null } | null>(null)

  useEffect(() => {
    fetch(`/api/student/courses/${courseId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) return
        setData(res.data)
        setCompleted(new Set(res.data.completedLessonIds))
        const firstLesson = res.data.modules[0]?.chapters[0]?.topics[0]?.lessons[0]
        if (firstLesson) setActiveLessonId(firstLesson.id)
        setExpanded(new Set([`m${res.data.modules[0]?.id}`, `c${res.data.modules[0]?.chapters[0]?.id}`, `t${res.data.modules[0]?.chapters[0]?.topics[0]?.id}`]))
      })
  }, [courseId])

  const allLessons = useMemo(() => {
    if (!data) return []
    return data.modules.flatMap((m) => m.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons)))
  }, [data])

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? null
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((l) => completed.has(l.id)).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function toggleComplete(lessonId: number) {
    const next = !completed.has(lessonId)
    setMarking(true)
    try {
      await fetch('/api/lms/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, isCompleted: next }),
      })
      setCompleted((prev) => {
        const s = new Set(prev)
        next ? s.add(lessonId) : s.delete(lessonId)
        return s
      })

      if (next) {
        const currentIdx = allLessons.findIndex((l) => l.id === lessonId)
        const currentL = allLessons[currentIdx]
        const nextL = currentIdx !== -1 && currentIdx + 1 < allLessons.length ? allLessons[currentIdx + 1] : null
        setCompletedLessonData({
          title: currentL ? currentL.title : 'Session',
          nextLessonId: nextL ? nextL.id : null,
        })
        setShowCompletionModal(true)
      }
    } finally {
      setMarking(false)
    }
  }

  function handleContinueToNextSession() {
    if (completedLessonData?.nextLessonId) {
      setActiveLessonId(completedLessonData.nextLessonId)
    }
    setShowCompletionModal(false)
  }

  if (!data) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}><Loader2 style={{ width: 22, height: 22 }} /></div>
  }

  const totalTopics = data.modules.reduce((a, m) => a + m.chapters.reduce((b, c) => b + c.topics.length, 0), 0)
  const totalChapters = data.modules.reduce((a, m) => a + m.chapters.length, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>

        {/* Progress header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{data.course.title}</p>
          <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: '#2563eb', borderRadius: 4, transition: 'width .4s ease' }} />
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{completedCount}/{totalLessons} lessons complete ({progressPct}%)</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 12px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <button style={TAB_BTN(tab === 'lessons')} onClick={() => setTab('lessons')}>
            <Play style={{ width: 12, height: 12 }} /> Lessons
          </button>
          <button style={TAB_BTN(tab === 'curriculum')} onClick={() => setTab('curriculum')}>
            <LayoutList style={{ width: 12, height: 12 }} /> Curriculum
          </button>
        </div>

        {/* Assessment CTA */}
        {progressPct === 100 && (
          <div style={{ padding: '14px 18px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award style={{ width: 13, height: 13 }} /> Course Complete!
            </p>
            <Link
              href={`/profile/courses/${courseId}/assessment`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            >
              Take Assessment
            </Link>
          </div>
        )}

        {/* ── LESSONS TAB ───────────────────────────────── */}
        {tab === 'lessons' && (
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {data.modules.map((mod) => (
              <div key={mod.id}>
                <div onClick={() => toggleExpand(`m${mod.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', cursor: 'pointer', background: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                  {expanded.has(`m${mod.id}`) ? <ChevronDown style={{ width: 12, height: 12 }} /> : <ChevronRight style={{ width: 12, height: 12 }} />}
                  {mod.title}
                </div>
                {expanded.has(`m${mod.id}`) && mod.chapters.map((ch) => (
                  <div key={ch.id}>
                    <div onClick={() => toggleExpand(`c${ch.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 8px 26px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      {expanded.has(`c${ch.id}`) ? <ChevronDown style={{ width: 11, height: 11 }} /> : <ChevronRight style={{ width: 11, height: 11 }} />}
                      {ch.title}
                    </div>
                    {expanded.has(`c${ch.id}`) && ch.topics.map((t) => (
                      <div key={t.id}>
                        <div onClick={() => toggleExpand(`t${t.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px 6px 38px', cursor: 'pointer', fontSize: 12, color: '#475569' }}>
                          {expanded.has(`t${t.id}`) ? <ChevronDown style={{ width: 10, height: 10 }} /> : <ChevronRight style={{ width: 10, height: 10 }} />}
                          {t.title}
                        </div>
                        {expanded.has(`t${t.id}`) && t.lessons.map((l) => {
                          const Icon = LESSON_ICON[l.type] ?? FileText
                          const isDone = completed.has(l.id)
                          const isActive = l.id === activeLessonId
                          return (
                            <div key={l.id} onClick={() => setActiveLessonId(l.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 50px', cursor: 'pointer', background: isActive ? '#eff6ff' : 'transparent', borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent' }}>
                              {isDone ? <CheckCircle2 style={{ width: 13, height: 13, color: '#059669', flexShrink: 0 }} /> : <Circle style={{ width: 13, height: 13, color: '#cbd5e1', flexShrink: 0 }} />}
                              <Icon style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: isActive ? '#2563eb' : '#334155', fontWeight: isActive ? 600 : 400 }}>{l.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ── CURRICULUM TAB ────────────────────────────── */}
        {tab === 'curriculum' && (
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #f1f5f9' }}>
              {[
                { label: 'Modules', value: data.modules.length },
                { label: 'Chapters', value: totalChapters },
                { label: 'Topics', value: totalTopics },
              ].map((s) => (
                <div key={s.label} style={{ padding: '10px 0', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{s.value}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {data.modules.map((mod, mIdx) => {
              const color = MODULE_COLORS[mIdx % MODULE_COLORS.length]
              const isOpen = expandedModule === mIdx
              const modLessons = mod.chapters.flatMap((c) => c.topics.flatMap((t) => t.lessons))
              const modDone = modLessons.filter((l) => completed.has(l.id)).length
              return (
                <div key={mod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Module row */}
                  <button
                    onClick={() => setExpandedModule(isOpen ? null : mIdx)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: isOpen ? color.bg : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${isOpen ? color.bar : 'transparent'}`, transition: 'all .15s' }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: color.numBg, color: color.num, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {mIdx + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{mod.title}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{modDone}/{modLessons.length}</span>
                    {isOpen ? <ChevronDown style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} /> : <ChevronRight style={{ width: 12, height: 12, color: '#94a3b8', flexShrink: 0 }} />}
                  </button>

                  {/* Chapters + Topics */}
                  {isOpen && mod.chapters.map((ch, cIdx) => (
                    <div key={ch.id} style={{ background: '#fafbfc' }}>
                      <p style={{ padding: '7px 14px 7px 50px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' }}>
                        {cIdx + 1}. {ch.title}
                      </p>
                      {ch.topics.map((t, tIdx) => {
                        const tLessons = t.lessons
                        const tDone = tLessons.filter((l) => completed.has(l.id)).length
                        return (
                          <div key={t.id}
                            onClick={() => {
                              const firstLesson = t.lessons[0]
                              if (firstLesson) {
                                setActiveLessonId(firstLesson.id)
                                setExpanded((prev) => {
                                  const next = new Set(prev)
                                  next.add(`m${mod.id}`); next.add(`c${ch.id}`); next.add(`t${t.id}`)
                                  return next
                                })
                                setTab('lessons')
                              }
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 60px', cursor: tLessons.length > 0 ? 'pointer' : 'default', transition: 'background .1s' }}
                            onMouseEnter={(e) => { if (tLessons.length) (e.currentTarget as HTMLElement).style.background = '#f0f4ff' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                          >
                            {tDone === tLessons.length && tLessons.length > 0
                              ? <CheckCircle2 style={{ width: 13, height: 13, color: '#059669', flexShrink: 0 }} />
                              : <BookOpen style={{ width: 13, height: 13, color: color.num, flexShrink: 0 }} />}
                            <span style={{ flex: 1, fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                              {tIdx + 1}. {t.title}
                            </span>
                            {tLessons.length > 0 && (
                              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {tDone}/{tLessons.length} lessons
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── PLAYER (right side, unchanged) ──────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: 28, minHeight: 400 }}>
        {!activeLesson ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No lessons yet — check back soon.</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>{activeLesson.title}</h3>
              <button
                onClick={() => toggleComplete(activeLesson.id)}
                disabled={marking}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', background: completed.has(activeLesson.id) ? '#ecfdf5' : '#2563eb', color: completed.has(activeLesson.id) ? '#059669' : '#fff' }}
              >
                <CheckCircle2 style={{ width: 13, height: 13 }} />
                {completed.has(activeLesson.id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            {activeLesson.type === 'VIDEO' && activeLesson.videoUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#0f172a', marginBottom: 20 }}>
                <iframe src={activeLesson.videoUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}

            {activeLesson.bodyHtml && (
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: activeLesson.bodyHtml }} />
            )}

            {activeLesson.resources.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }}>Resources</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeLesson.resources.map((r) => (
                    <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>
                      <Paperclip style={{ width: 13, height: 13 }} /> {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Completion Modal Popup */}
      <SessionCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        sessionTitle={completedLessonData?.title}
        courseTitle={data.course.title}
        onContinueNextSession={completedLessonData?.nextLessonId ? handleContinueToNextSession : undefined}
        nextSessionUrl={`/profile/courses/${courseId}`}
        progressUrl="/profile"
      />
    </div>
  )
}
