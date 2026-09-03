'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Users,
  Mail,
  Phone,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Layers3,
  Calendar,
  Clock3,
  BookOpen,
  Award,
  TrendingUp,
  X,
  MessageCircle,
  FileText,
  Plus,
  UserPlus,
  Loader2,
} from 'lucide-react'

interface StudentRecord {
  id: number
  name: string
  email: string
  contact: string | null
  isActive: boolean
  createdAt: Date | string
  enrollments: Array<{
    batch: {
      id: number
      name: string
      startDate?: Date | string
      mode?: string
      course: { id?: number; title: string }
      sessions?: Array<{ id: number; status: string }>
    }
    attendance?: Array<{
      sessionId: number
      present: boolean
    }>
  }>
  assignmentSubmissions: Array<{
    id: number
    score: any
    submittedAt?: Date | string
    gradedAt?: Date | string | null
    assignment?: { id: number; title: string }
  }>
}

export default function StudentAdminDirectory({
  initialStudents,
}: {
  initialStudents: StudentRecord[]
}) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [submittingAdd, setSubmittingAdd] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
  })

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.email.trim()) {
      toast.error('Name and email are required')
      return
    }

    setSubmittingAdd(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Student added successfully!')
        const createdStudent: StudentRecord = {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          contact: data.data.contact,
          isActive: data.data.isActive,
          createdAt: data.data.createdAt || new Date().toISOString(),
          enrollments: [],
          assignmentSubmissions: [],
        }
        setStudents((prev) => [createdStudent, ...prev])
        setShowAddModal(false)
        setAddForm({ name: '', email: '', contact: '', password: '' })
      } else {
        toast.error(data.message || 'Failed to add student')
      }
    } catch {
      toast.error('Network error adding student')
    } finally {
      setSubmittingAdd(false)
    }
  }

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive } : s))
        )
        if (selectedStudent && selectedStudent.id === id) {
          setSelectedStudent((prev) => (prev ? { ...prev, isActive } : null))
        }
        toast.success(`Student access ${isActive ? 'activated' : 'deactivated'}`)
      } else {
        toast.error(data.message || 'Failed to update')
      }
    } catch {
      toast.error('Network error updating student')
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase()
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.contact && s.contact.includes(q)) ||
        s.enrollments.some(
          (e) =>
            e.batch.name.toLowerCase().includes(q) ||
            e.batch.course.title.toLowerCase().includes(q)
        )

      if (filterTab === 'active') return matchSearch && s.isActive
      if (filterTab === 'inactive') return matchSearch && !s.isActive
      return matchSearch
    })
  }, [students, search, filterTab])

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(['all', 'active', 'inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: filterTab === tab ? 700 : 600,
                border: filterTab === tab ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                background: filterTab === tab ? '#eff6ff' : '#ffffff',
                color: filterTab === tab ? '#1e40af' : '#64748b',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'all' ? `All Students (${students.length})` : tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '0 12px',
              height: 36,
              minWidth: 260,
            }}
          >
            <Search style={{ width: 14, height: 14, color: '#94a3b8' }} />
            <input
              placeholder="Search by student name, email, course, batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 12.5,
                color: '#0f172a',
                width: '100%',
              }}
            />
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredStudents.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <Users style={{ width: 36, height: 36, color: '#cbd5e1', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No students found matching your criteria</p>
        </div>
      ) : (
        <>
          {/* Header Row */}
          <div
            style={{
              padding: '12px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              display: 'grid',
              gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 90px 110px',
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              alignItems: 'center',
            }}
          >
            <span>Student Profile</span>
            <span>Course & Cohort</span>
            <span>Attendance</span>
            <span>Assignments</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {/* Data Rows */}
          {filteredStudents.map((s, idx) => {
            const initials = s.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
            const joinDate = new Date(s.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            // Calculate overall attendance
            let totalSessionsCount = 0
            let presentCount = 0
            s.enrollments.forEach((e) => {
              const count = e.batch?.sessions?.length ?? 0
              totalSessionsCount += count
              const present = e.attendance?.filter((a) => a.present).length ?? 0
              presentCount += present
            })
            const attendancePct = totalSessionsCount > 0 ? Math.round((presentCount / totalSessionsCount) * 100) : 100

            // Assignment metrics
            const graded = s.assignmentSubmissions.filter((sub) => sub.score !== null)
            const avgScore =
              graded.length > 0
                ? Math.round(graded.reduce((acc, sub) => acc + Number(sub.score || 0), 0) / graded.length)
                : null

            return (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 1.6fr 1.1fr 1fr 90px 110px',
                  alignItems: 'center',
                  padding: '14px 24px',
                  borderBottom: idx < filteredStudents.length - 1 ? '1px solid #f8fafc' : 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Profile Avatar + Name + Join Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {initials || 'ST'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {s.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        ID: #{s.id}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>•</span>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Calendar style={{ width: 10, height: 10 }} /> Joined {joinDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enrolled Batches & Courses */}
                <div style={{ paddingRight: 12 }}>
                  {s.enrollments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.enrollments.map((enr, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                            {enr.batch.course.title}
                          </span>
                          <Link
                            href={`/admin/batches/${enr.batch.id}`}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <Layers3 style={{ width: 10, height: 10 }} />
                            <span>{enr.batch.name}</span>
                            {enr.batch.mode && (
                              <span style={{ fontSize: 9.5, color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>
                                {enr.batch.mode}
                              </span>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                      No active cohort
                    </span>
                  )}
                </div>

                {/* Attendance Rate */}
                <div style={{ paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: attendancePct >= 80 ? '#15803d' : attendancePct >= 50 ? '#b45309' : '#b91c1c',
                        background: attendancePct >= 80 ? '#f0fdf4' : attendancePct >= 50 ? '#fefce8' : '#fef2f2',
                        border: `1px solid ${attendancePct >= 80 ? '#bbf7d0' : attendancePct >= 50 ? '#fef08a' : '#fecaca'}`,
                        padding: '2px 7px',
                        borderRadius: 6,
                      }}
                    >
                      {attendancePct}%
                    </span>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>
                      {presentCount}/{totalSessionsCount || 0} classes
                    </span>
                  </div>
                  {totalSessionsCount > 0 && (
                    <div style={{ width: '100%', maxWidth: 90, height: 4, background: '#e2e8f0', borderRadius: 10, marginTop: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${attendancePct}%`,
                          height: '100%',
                          background: attendancePct >= 80 ? '#22c55e' : attendancePct >= 50 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Assignment Submissions */}
                <div style={{ paddingRight: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {s.assignmentSubmissions.length} Submitted
                  </p>
                  <p style={{ fontSize: 11, color: avgScore !== null ? '#059669' : '#94a3b8', margin: '2px 0 0 0', fontWeight: 600 }}>
                    {avgScore !== null ? `Avg Score: ${avgScore}%` : 'Pending grading'}
                  </p>
                </div>

                {/* Status Toggle Switch */}
                <div>
                  <button
                    onClick={() => toggleStatus(s.id, !s.isActive)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: s.isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      background: s.isActive ? '#f0fdf4' : '#f8fafc',
                      color: s.isActive ? '#15803d' : '#64748b',
                    }}
                  >
                    {s.isActive ? (
                      <>
                        <CheckCircle2 style={{ width: 11, height: 11, color: '#16a34a' }} />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle style={{ width: 11, height: 11, color: '#94a3b8' }} />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Actions: View Profile Drawer */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#1e40af',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Student Details Sliding Modal / Drawer */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              height: '100%',
              background: '#ffffff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedStudent.name}
                  </h3>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                    Student ID: #{selectedStudent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: 16, height: 16, color: '#64748b' }} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Contact Card */}
              <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 12 }}>
                  Contact Information & Journey
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <a href={`mailto:${selectedStudent.email}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      {selectedStudent.email}
                    </a>
                  </div>
                  {selectedStudent.contact ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone style={{ width: 14, height: 14, color: '#16a34a' }} />
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedStudent.contact}</span>
                      </div>
                      <a
                        href={`https://wa.me/${selectedStudent.contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#ffffff',
                          background: '#16a34a',
                          padding: '4px 10px',
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircle style={{ width: 12, height: 12 }} /> WhatsApp
                      </a>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>No phone number on record</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: 12 }}>
                    <Calendar style={{ width: 14, height: 14, color: '#64748b' }} />
                    <span>
                      Platform Join Date:{' '}
                      <strong style={{ color: '#0f172a' }}>
                        {new Date(selectedStudent.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses & Batches */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 10 }}>
                  Enrolled Courses & Cohorts ({selectedStudent.enrollments.length})
                </h4>
                {selectedStudent.enrollments.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>Student has not enrolled in any course batch.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedStudent.enrollments.map((enr, i) => (
                      <div key={i} style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff' }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {enr.batch.course.title}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                          Cohort: <strong>{enr.batch.name}</strong> · Mode: <strong>{enr.batch.mode || 'Online'}</strong>
                        </p>
                        {enr.batch.startDate && (
                          <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0 0' }}>
                            Start Date:{' '}
                            {new Date(enr.batch.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignments History */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 10 }}>
                  Assignment Submissions ({selectedStudent.assignmentSubmissions.length})
                </h4>
                {selectedStudent.assignmentSubmissions.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8' }}>No assignment submissions recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedStudent.assignmentSubmissions.map((sub, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText style={{ width: 14, height: 14, color: '#3b82f6' }} />
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>
                            {sub.assignment?.title || `Assignment #${sub.id}`}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: sub.score !== null ? '#15803d' : '#d97706',
                            background: sub.score !== null ? '#f0fdf4' : '#fffbeb',
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {sub.score !== null ? `Score: ${sub.score}%` : 'Pending review'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => toggleStatus(selectedStudent.id, !selectedStudent.isActive)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: selectedStudent.isActive ? '#dc2626' : '#16a34a',
                    cursor: 'pointer',
                  }}
                >
                  {selectedStudent.isActive ? 'Deactivate Access' : 'Activate Access'}
                </button>
                <Link
                  href="/student-login"
                  target="_blank"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: '#1e40af',
                    color: '#ffffff',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} /> Student Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add New Student Modal Dialog */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserPlus style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Add New Student
                  </h3>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>
                    Create a direct student record with active LMS access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: 14, height: 14, color: '#64748b' }} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nikhat Parveen Hanagal"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. nikhatgdg@gmail.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Contact / Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={addForm.contact}
                  onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Initial Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for default (RI@Student2026)"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  style={{
                    flex: 1.5,
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    cursor: submittingAdd ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {submittingAdd ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Plus style={{ width: 14, height: 14 }} />}
                  {submittingAdd ? 'Adding...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
