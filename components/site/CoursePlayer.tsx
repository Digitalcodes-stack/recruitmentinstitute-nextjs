'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Video, FileText,
  ClipboardList, HelpCircle, Download, Paperclip, Loader2,
} from 'lucide-react'

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

export default function CoursePlayer({ courseId }: { courseId: number }) {
  const [data, setData] = useState<{ course: { title: string }; modules: ModuleRow[]; completedLessonIds: number[] } | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [marking, setMarking] = useState(false)

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
    } finally {
      setMarking(false)
    }
  }

  if (!data) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}><Loader2 style={{ width: 22, height: 22 }} /></div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Sidebar: curriculum tree */}
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{data.course.title}</p>
          <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: '#2563eb', borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{completedCount}/{totalLessons} lessons complete ({progressPct}%)</p>
        </div>

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
                          <div
                            key={l.id}
                            onClick={() => setActiveLessonId(l.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 50px', cursor: 'pointer',
                              background: isActive ? '#eff6ff' : 'transparent',
                              borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                            }}
                          >
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
      </div>

      {/* Player */}
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
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                  background: completed.has(activeLesson.id) ? '#ecfdf5' : '#2563eb',
                  color: completed.has(activeLesson.id) ? '#059669' : '#fff',
                }}
              >
                <CheckCircle2 style={{ width: 13, height: 13 }} />
                {completed.has(activeLesson.id) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>

            {activeLesson.type === 'VIDEO' && activeLesson.videoUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#0f172a', marginBottom: 20 }}>
                <iframe
                  src={activeLesson.videoUrl}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
    </div>
  )
}
