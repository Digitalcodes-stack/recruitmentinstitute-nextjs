'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, ChevronRight, Plus, Trash2, Loader2, GripVertical,
  Video, FileText, ClipboardList, HelpCircle, Download, Layers3, Paperclip,
} from 'lucide-react'

interface ResourceRow { id: number; title: string; fileUrl: string; fileType: string }
interface LessonRow {
  id: number; title: string; type: string; videoUrl: string | null
  durationSec: number | null; isPreview: boolean; resources: ResourceRow[]
}
interface TopicRow { id: number; title: string; lessons: LessonRow[] }
interface ChapterRow { id: number; title: string; topics: TopicRow[] }
interface ModuleRow { id: number; title: string; description: string | null; chapters: ChapterRow[] }

const LESSON_ICON: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  VIDEO: Video, PDF: FileText, PPT: FileText, ASSIGNMENT: ClipboardList, QUIZ: HelpCircle, DOWNLOAD: Download,
}

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data.data
}

const rowInput: React.CSSProperties = { flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0', outline: 'none' }
const smallBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }

export default function CurriculumBuilder({ courseId }: { courseId: number }) {
  const router = useRouter()
  const [modules, setModules] = useState<ModuleRow[] | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const data = await api(`/api/admin/courses/${courseId}/curriculum`, 'GET')
    setModules(data)
  }
  useEffect(() => { load() }, [courseId])

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return
    setBusy(true)
    try {
      await api('/api/admin/modules', 'POST', { courseId, title: newModuleTitle, sortOrder: modules?.length ?? 0 })
      setNewModuleTitle('')
      await load()
    } finally { setBusy(false) }
  }

  async function removeEntity(kind: 'modules' | 'chapters' | 'topics' | 'lessons' | 'lms-resources', id: number) {
    if (!confirm('Delete this and everything nested inside it?')) return
    await api(`/api/admin/${kind}/${id}`, 'DELETE')
    await load()
  }

  if (modules === null) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}><Loader2 style={{ width: 20, height: 20 }} /></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title, e.g. 'Sourcing Fundamentals'"
          style={rowInput}
        />
        <button onClick={addModule} disabled={busy} style={{ ...smallBtn, background: '#2563eb', color: '#fff', padding: '9px 18px' }}>
          <Plus style={{ width: 13, height: 13 }} /> Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
          <Layers3 style={{ width: 28, height: 28, color: '#e2e8f0', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No curriculum yet. Add the first module above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modules.map((mod) => (
            <ModuleBlock
              key={mod.id}
              mod={mod}
              expanded={expanded}
              toggle={toggle}
              onChange={load}
              onRemove={removeEntity}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ModuleBlock({ mod, expanded, toggle, onChange, onRemove }: {
  mod: ModuleRow
  expanded: Set<string>
  toggle: (k: string) => void
  onChange: () => Promise<void>
  onRemove: (kind: 'modules' | 'chapters' | 'topics' | 'lessons' | 'lms-resources', id: number) => Promise<void>
}) {
  const key = `m${mod.id}`
  const isOpen = expanded.has(key)
  const [newChapter, setNewChapter] = useState('')

  async function addChapter() {
    if (!newChapter.trim()) return
    await api('/api/admin/chapters', 'POST', { moduleId: mod.id, title: newChapter, sortOrder: mod.chapters.length })
    setNewChapter('')
    await onChange()
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
      <div onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', cursor: 'pointer', background: '#f8fafc' }}>
        {isOpen ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
        <Layers3 style={{ width: 14, height: 14, color: '#2563eb' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', flex: 1 }}>{mod.title}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{mod.chapters.length} chapters</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove('modules', mod.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '12px 16px 16px 36px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mod.chapters.map((ch) => (
            <ChapterBlock key={ch.id} chapter={ch} expanded={expanded} toggle={toggle} onChange={onChange} onRemove={onRemove} />
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input value={newChapter} onChange={(e) => setNewChapter(e.target.value)} placeholder="New chapter title" style={rowInput} />
            <button onClick={addChapter} style={{ ...smallBtn, background: '#eff6ff', color: '#2563eb' }}>
              <Plus style={{ width: 12, height: 12 }} /> Chapter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChapterBlock({ chapter, expanded, toggle, onChange, onRemove }: {
  chapter: ChapterRow
  expanded: Set<string>
  toggle: (k: string) => void
  onChange: () => Promise<void>
  onRemove: (kind: 'modules' | 'chapters' | 'topics' | 'lessons' | 'lms-resources', id: number) => Promise<void>
}) {
  const key = `c${chapter.id}`
  const isOpen = expanded.has(key)
  const [newTopic, setNewTopic] = useState('')

  async function addTopic() {
    if (!newTopic.trim()) return
    await api('/api/admin/topics', 'POST', { chapterId: chapter.id, title: newTopic, sortOrder: chapter.topics.length })
    setNewTopic('')
    await onChange()
  }

  return (
    <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer', background: '#fafbfc' }}>
        {isOpen ? <ChevronDown style={{ width: 13, height: 13 }} /> : <ChevronRight style={{ width: 13, height: 13 }} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{chapter.title}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{chapter.topics.length} topics</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove('chapters', chapter.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '10px 12px 12px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chapter.topics.map((t) => (
            <TopicBlock key={t.id} topic={t} expanded={expanded} toggle={toggle} onChange={onChange} onRemove={onRemove} />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="New topic title" style={rowInput} />
            <button onClick={addTopic} style={{ ...smallBtn, background: '#f5f3ff', color: '#7c3aed' }}>
              <Plus style={{ width: 12, height: 12 }} /> Topic
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TopicBlock({ topic, expanded, toggle, onChange, onRemove }: {
  topic: TopicRow
  expanded: Set<string>
  toggle: (k: string) => void
  onChange: () => Promise<void>
  onRemove: (kind: 'modules' | 'chapters' | 'topics' | 'lessons' | 'lms-resources', id: number) => Promise<void>
}) {
  const key = `t${topic.id}`
  const isOpen = expanded.has(key)
  const [form, setForm] = useState({ title: '', type: 'VIDEO', videoUrl: '' })
  const [adding, setAdding] = useState(false)

  async function addLesson() {
    if (!form.title.trim()) return
    setAdding(true)
    try {
      await api('/api/admin/lessons', 'POST', { topicId: topic.id, ...form, sortOrder: topic.lessons.length })
      setForm({ title: '', type: 'VIDEO', videoUrl: '' })
      await onChange()
    } finally { setAdding(false) }
  }

  return (
    <div style={{ border: '1px solid #f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
      <div onClick={() => toggle(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }}>
        {isOpen ? <ChevronDown style={{ width: 12, height: 12 }} /> : <ChevronRight style={{ width: 12, height: 12 }} />}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', flex: 1 }}>{topic.title}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{topic.lessons.length} lessons</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove('topics', topic.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
          <Trash2 style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '8px 12px 12px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topic.lessons.map((l) => (
            <LessonRowItem key={l.id} lesson={l} onChange={onChange} onRemove={onRemove} />
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="New lesson title" style={rowInput} />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={{ ...rowInput, flex: 'none', width: 120 }}>
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
              <option value="PPT">PPT</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="QUIZ">Quiz</option>
              <option value="DOWNLOAD">Download</option>
            </select>
            <button onClick={addLesson} disabled={adding} style={{ ...smallBtn, background: '#ecfdf5', color: '#059669' }}>
              <Plus style={{ width: 12, height: 12 }} /> Lesson
            </button>
          </div>
          {form.type === 'VIDEO' && (
            <input
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="Video URL (optional, can add after creating)"
              style={{ ...rowInput, fontSize: 12 }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function LessonRowItem({ lesson, onChange, onRemove }: {
  lesson: LessonRow
  onChange: () => Promise<void>
  onRemove: (kind: 'modules' | 'chapters' | 'topics' | 'lessons' | 'lms-resources', id: number) => Promise<void>
}) {
  const Icon = LESSON_ICON[lesson.type] ?? FileText
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [resForm, setResForm] = useState({ title: '', fileUrl: '', fileType: 'PDF' })

  async function addResource() {
    if (!resForm.title.trim() || !resForm.fileUrl.trim()) return
    await api('/api/admin/lms-resources', 'POST', { lessonId: lesson.id, ...resForm })
    setResForm({ title: '', fileUrl: '', fileType: 'PDF' })
    setShowResourceForm(false)
    await onChange()
  }

  return (
    <div style={{ background: '#f8fafc', borderRadius: 9, padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GripVertical style={{ width: 12, height: 12, color: '#cbd5e1' }} />
        <Icon style={{ width: 13, height: 13, color: '#64748b' }} />
        <span style={{ fontSize: 12, color: '#0f172a', flex: 1 }}>{lesson.title}</span>
        {lesson.isPreview && <span style={{ fontSize: 10, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 7px', borderRadius: 20 }}>Preview</span>}
        <button onClick={() => setShowResourceForm((v) => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 4 }} title="Attach resource">
          <Paperclip style={{ width: 12, height: 12 }} />
        </button>
        <button onClick={() => onRemove('lessons', lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
          <Trash2 style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {lesson.resources.length > 0 && (
        <div style={{ marginTop: 6, marginLeft: 21, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {lesson.resources.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
              <Paperclip style={{ width: 10, height: 10 }} />
              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{r.title}</a>
              <button onClick={() => onRemove('lms-resources', r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                <Trash2 style={{ width: 10, height: 10 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showResourceForm && (
        <div style={{ marginTop: 6, marginLeft: 21, display: 'flex', gap: 6 }}>
          <input value={resForm.title} onChange={(e) => setResForm((f) => ({ ...f, title: e.target.value }))} placeholder="Resource title" style={{ ...rowInput, fontSize: 11, padding: '5px 8px' }} />
          <input value={resForm.fileUrl} onChange={(e) => setResForm((f) => ({ ...f, fileUrl: e.target.value }))} placeholder="File URL" style={{ ...rowInput, fontSize: 11, padding: '5px 8px' }} />
          <button onClick={addResource} style={{ ...smallBtn, background: '#2563eb', color: '#fff', padding: '5px 10px' }}>Add</button>
        </div>
      )}
    </div>
  )
}
