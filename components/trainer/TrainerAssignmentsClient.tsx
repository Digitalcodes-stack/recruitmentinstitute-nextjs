'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ClipboardCheck,
  ClipboardList,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  Edit3,
  Trash2,
  X,
  Loader2,
  Award,
  Send,
  CalendarDays,
  FileText,
  User,
} from 'lucide-react'

interface SubmissionItem {
  id: number
  studentId: number
  studentName: string
  studentEmail: string
  fileUrl: string
  note: string | null
  submittedAt: string | Date
  score: number | null
  feedback: string | null
  gradedAt: string | Date | null
}

interface AssignmentItem {
  id: number
  title: string
  description: string | null
  fileUrl: string | null
  dueAt: string | Date
  createdAt: string | Date
  batchId: number
  batchName: string
  courseTitle: string
  totalEnrolled: number
  totalSubmissions: number
  pendingGrading: number
  gradedCount: number
  submissions: SubmissionItem[]
}

interface BatchOption {
  id: number
  name: string
  course: { title: string }
  _count: { enrollments: number }
}

interface Props {
  assignments: AssignmentItem[]
  batches: BatchOption[]
  initialBatchFilter?: number
  initialAssignmentId?: number
  initialGradeSubmissionId?: number
}

export default function TrainerAssignmentsClient({
  assignments: initialAssignments,
  batches,
  initialBatchFilter,
  initialAssignmentId,
  initialGradeSubmissionId,
}: Props) {
  const router = useRouter()
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments)
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<number>(initialBatchFilter || 0)

  // Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createBatchId, setCreateBatchId] = useState<number>(batches[0]?.id ?? 0)
  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createDueDate, setCreateDueDate] = useState('')
  const [createDueTime, setCreateDueTime] = useState('23:59')
  const [createFileUrl, setCreateFileUrl] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Submissions & Grading Drawer State
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(
    initialAssignmentId
      ? initialAssignments.find((a) => a.id === initialAssignmentId) ?? null
      : null
  )

  // Grading Form in-modal state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(
    initialGradeSubmissionId || null
  )
  const [gradeScore, setGradeScore] = useState<string>('')
  const [gradeFeedback, setGradeFeedback] = useState<string>('')
  const [gradeLoading, setGradeLoading] = useState(false)

  const now = new Date()

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    if (selectedBatchFilter === 0) return assignments
    return assignments.filter((a) => a.batchId === selectedBatchFilter)
  }, [assignments, selectedBatchFilter])

  // Overview metrics
  const totalSubmissions = assignments.reduce((sum, a) => sum + a.totalSubmissions, 0)
  const totalPending = assignments.reduce((sum, a) => sum + a.pendingGrading, 0)
  const totalGraded = assignments.reduce((sum, a) => sum + a.gradedCount, 0)

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateTitle('')
    setCreateDescription('')
    setCreateFileUrl('')
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCreateDueDate(nextWeek.toISOString().split('T')[0])
    setCreateModalOpen(true)
  }

  // Submit Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createBatchId || !createTitle || !createDueDate) {
      toast.error('Please enter title, batch, and due date')
      return
    }

    setCreateLoading(true)
    try {
      const dueIso = new Date(`${createDueDate}T${createDueTime}:00`).toISOString()
      const res = await fetch('/api/trainer/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: createBatchId,
          title: createTitle,
          description: createDescription || null,
          dueAt: dueIso,
          fileUrl: createFileUrl || null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create assignment')

      toast.success('Assignment created successfully!')
      setCreateModalOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create assignment')
    } finally {
      setCreateLoading(false)
    }
  }

  // Delete Assignment
  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all student submissions?')) return

    const toastId = toast.loading('Deleting assignment...')
    try {
      const res = await fetch(`/api/trainer/assignments/${assignmentId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete')

      toast.success('Assignment deleted successfully', { id: toastId })
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      if (activeAssignment?.id === assignmentId) setActiveAssignment(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete assignment', { id: toastId })
    }
  }

  // Open Grading for a submission
  const handleOpenGrade = (sub: SubmissionItem) => {
    setGradingSubmissionId(sub.id)
    setGradeScore(sub.score !== null ? String(sub.score) : '')
    setGradeFeedback(sub.feedback || '')
  }

  // Submit Grade
  const handleSaveGrade = async (assignmentId: number, submissionId: number) => {
    if (gradeScore === '' || isNaN(Number(gradeScore))) {
      toast.error('Please enter a valid numeric score (0-100)')
      return
    }

    const numScore = Number(gradeScore)
    if (numScore < 0 || numScore > 100) {
      toast.error('Score must be between 0 and 100')
      return
    }

    setGradeLoading(true)
    try {
      const res = await fetch(`/api/trainer/assignments/${assignmentId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          score: numScore,
          feedback: gradeFeedback,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save grade')

      toast.success('Grade & feedback recorded successfully!')
      setGradingSubmissionId(null)

      // Update local state
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id !== assignmentId) return a
          return {
            ...a,
            pendingGrading: Math.max(0, a.pendingGrading - (data.data.gradedAt ? 1 : 0)),
            gradedCount: a.gradedCount + 1,
            submissions: a.submissions.map((s) =>
              s.id === submissionId
                ? { ...s, score: numScore, feedback: gradeFeedback, gradedAt: new Date() }
                : s
            ),
          }
        })
      )

      if (activeAssignment && activeAssignment.id === assignmentId) {
        setActiveAssignment((prev) => {
          if (!prev) return null
          return {
            ...prev,
            submissions: prev.submissions.map((s) =>
              s.id === submissionId
                ? { ...s, score: numScore, feedback: gradeFeedback, gradedAt: new Date() }
                : s
            ),
          }
        })
      }

      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not record grade')
    } finally {
      setGradeLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 13,
    border: '1px solid #cbd5e1',
    outline: 'none',
    color: '#0f172a',
    background: '#f8fafc',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              Total Assignments
            </span>
            <ClipboardList style={{ width: 16, height: 16, color: '#1e40af' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{assignments.length}</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
              Total Submissions
            </span>
            <FileText style={{ width: 16, height: 16, color: '#3b82f6' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{totalSubmissions}</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d97706' }}>
              Pending Review
            </span>
            <Clock style={{ width: 16, height: 16, color: '#d97706' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: totalPending > 0 ? '#d97706' : '#0f172a', marginTop: 4 }}>
            {totalPending}
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#059669' }}>
              Graded & Returned
            </span>
            <CheckCircle2 style={{ width: 16, height: 16, color: '#059669' }} />
          </div>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 4 }}>{totalGraded}</p>
        </div>
      </div>

      {/* Action Toolbar & Batch Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Filter Batch:</span>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(Number(e.target.value))}
            style={{
              padding: '9px 14px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              fontWeight: 600,
            }}
          >
            <option value={0}>All Batches ({assignments.length})</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.course.title})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(30,64,175,0.25)',
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Create Assignment
        </button>
      </div>

      {/* Assignment Cards List */}
      {filteredAssignments.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <ClipboardList style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No Assignments Found</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Create assignments for your batches to give homework, tasks, or case studies.
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#1e40af',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Create Assignment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {filteredAssignments.map((a) => {
            const isOverdue = new Date(a.dueAt) < now
            const submissionPct =
              a.totalEnrolled > 0 ? Math.round((a.totalSubmissions / a.totalEnrolled) * 100) : 0

            return (
              <div
                key={a.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {a.batchName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isOverdue ? '#dc2626' : '#1e40af',
                        background: isOverdue ? '#fef2f2' : '#f8fafc',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: `1px solid ${isOverdue ? '#fecaca' : '#e2e8f0'}`,
                      }}
                    >
                      Due {new Date(a.dueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{a.courseTitle}</p>

                  {a.description && (
                    <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginTop: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.description}
                    </p>
                  )}

                  {a.fileUrl && (
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        color: '#2563eb',
                        fontWeight: 700,
                        marginTop: 10,
                        textDecoration: 'none',
                      }}
                    >
                      <Paperclip style={{ width: 12, height: 12 }} /> Reference Attachment
                    </a>
                  )}
                </div>

                {/* Submissions Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#475569', marginBottom: 6 }}>
                    <span>
                      Submissions: <strong>{a.totalSubmissions}</strong> / {a.totalEnrolled}
                    </span>
                    {a.pendingGrading > 0 ? (
                      <span style={{ fontWeight: 700, color: '#d97706' }}>{a.pendingGrading} to grade</span>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#059669' }}>All graded</span>
                    )}
                  </div>

                  <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden', marginBottom: 14 }}>
                    <div
                      style={{
                        width: `${submissionPct}%`,
                        height: '100%',
                        background: submissionPct >= 80 ? '#10b981' : '#3b82f6',
                        borderRadius: 100,
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => setActiveAssignment(a)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 8,
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <ClipboardCheck style={{ width: 14, height: 14 }} />
                      View Submissions ({a.submissions.length})
                    </button>

                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      title="Delete Assignment"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateModalOpen(false)
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
          <div
            style={{
              position: 'relative',
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Create Batch Assignment</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Assign practical tasks or projects to students.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: 14, height: 14, color: '#64748b' }} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Target Batch *
                  </span>
                  <select value={createBatchId} onChange={(e) => setCreateBatchId(Number(e.target.value))} style={inputStyle}>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.course.title}) — {batch._count.enrollments} Students
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Assignment Title *
                  </span>
                  <input
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Sourcing Boolean Search Matrix & Case Study"
                    style={inputStyle}
                    required
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Instructions & Description
                  </span>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    placeholder="Provide detailed instructions for completion, submission format, and grading rubric..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Due Date *
                    </span>
                    <input
                      type="date"
                      value={createDueDate}
                      onChange={(e) => setCreateDueDate(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Due Time
                    </span>
                    <input
                      type="time"
                      value={createDueTime}
                      onChange={(e) => setCreateDueTime(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Reference Attachment URL (Optional)
                  </span>
                  <input
                    type="url"
                    value={createFileUrl}
                    onChange={(e) => setCreateFileUrl(e.target.value)}
                    placeholder="e.g. https://... or PDF / Template URL"
                    style={inputStyle}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 22px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      border: 'none',
                      cursor: createLoading ? 'not-allowed' : 'pointer',
                      opacity: createLoading ? 0.7 : 1,
                    }}
                  >
                    {createLoading && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
                    Create Assignment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions & Grading Drawer / Modal */}
      {activeAssignment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveAssignment(null)
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
          <div
            style={{
              position: 'relative',
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: 700,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: '#eff6ff',
                    color: '#1e40af',
                  }}
                >
                  {activeAssignment.batchName}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {activeAssignment.title}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Submissions ({activeAssignment.submissions.length}) · Due:{' '}
                  {new Date(activeAssignment.dueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X style={{ width: 16, height: 16, color: '#64748b' }} />
              </button>
            </div>

            {/* Submissions List */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeAssignment.submissions.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
                  <FileText style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No submissions uploaded yet</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Students in this batch have not yet submitted their files.
                  </p>
                </div>
              ) : (
                activeAssignment.submissions.map((sub) => {
                  const isGradingThis = gradingSubmissionId === sub.id

                  return (
                    <div
                      key={sub.id}
                      style={{
                        padding: '18px 20px',
                        background: sub.score !== null ? '#f8fafc' : '#fffbeb',
                        borderRadius: 16,
                        border: sub.score !== null ? '1px solid #e2e8f0' : '1.5px solid #fde68a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>{sub.studentName}</p>
                          <p style={{ fontSize: 11.5, color: '#64748b' }}>{sub.studentEmail}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                            Submitted on {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at{' '}
                            {new Date(sub.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div>
                          {sub.score !== null ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: '#ecfdf5',
                                color: '#059669',
                                fontSize: 13,
                                fontWeight: 800,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <Award style={{ width: 14, height: 14 }} /> {sub.score} / 100
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 8,
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: 11.5,
                                fontWeight: 800,
                              }}
                            >
                              <Clock style={{ width: 12, height: 12 }} /> Needs Grade
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Note & Submission File */}
                      {sub.note && (
                        <p style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                          "{sub.note}"
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          <Download style={{ width: 13, height: 13 }} /> Download / View File
                        </a>

                        {!isGradingThis && (
                          <button
                            onClick={() => handleOpenGrade(sub)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              background: '#1e40af',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            {sub.score !== null ? 'Edit Grade' : 'Grade Submission'}
                          </button>
                        )}
                      </div>

                      {/* Inline Grading Form */}
                      {isGradingThis && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '16px',
                            borderRadius: 12,
                            background: '#ffffff',
                            border: '1.5px solid #1e40af',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                          }}
                        >
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Enter Score & Feedback</p>

                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Score (0-100):</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={gradeScore}
                                onChange={(e) => setGradeScore(e.target.value)}
                                placeholder="85"
                                style={{ width: 70, padding: '7px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 800, outline: 'none' }}
                                required
                              />
                            </label>
                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>/ 100</span>
                          </div>

                          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                              Feedback & Comments for Student
                            </span>
                            <textarea
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              placeholder="Great sourcing string! Ensure to double check boolean operators for Location constraints."
                              rows={2}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', resize: 'vertical' }}
                            />
                          </label>

                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setGradingSubmissionId(null)}
                              style={{ padding: '7px 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveGrade(activeAssignment.id, sub.id)}
                              disabled={gradeLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '7px 16px',
                                borderRadius: 8,
                                background: '#1e40af',
                                color: '#ffffff',
                                fontSize: 12,
                                fontWeight: 700,
                                border: 'none',
                                cursor: gradeLoading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {gradeLoading ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Send style={{ width: 12, height: 12 }} />}
                              Save & Return Grade
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
