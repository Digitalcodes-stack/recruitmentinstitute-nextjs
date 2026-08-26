'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Layers3,
  Users,
  Search,
  CalendarDays,
  ClipboardList,
  UserCheck,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

interface StudentRow {
  id: number
  enrollmentId: number
  name: string
  email: string
  contact: string | null
  isActive: boolean
  joinedAt?: string | Date
  enrollmentStatus: string
  enrolledAt: string | Date
  attendanceCount: number
  attendanceRate: number
  submissionsCount: number
  totalAssignments: number
  avgScore: number | null
}

interface BatchData {
  id: number
  name: string
  courseId: number
  courseTitle: string
  mode: string
  capacity: number
  startDate: string | Date
  endDate: string | Date | null
  schedule: string | null
  status: string
  totalSessions: number
  totalAssignments: number
  enrolledCount: number
  students: StudentRow[]
}

interface Props {
  batches: BatchData[]
  initialBatchId?: number
}

export default function TrainerBatchesClient({ batches, initialBatchId }: Props) {
  const [selectedBatchId, setSelectedBatchId] = useState<number>(
    initialBatchId && batches.some((b) => b.id === initialBatchId)
      ? initialBatchId
      : batches[0]?.id ?? 0
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)

  const activeBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId) ?? batches[0] ?? null,
    [batches, selectedBatchId]
  )

  const filteredStudents = useMemo(() => {
    if (!activeBatch) return []
    if (!searchQuery.trim()) return activeBatch.students
    const q = searchQuery.toLowerCase()
    return activeBatch.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.contact && s.contact.includes(q))
    )
  }, [activeBatch, searchQuery])

  if (batches.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '60px 24px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <Layers3 style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No Batches Assigned</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          You have not been assigned to any course batches yet. Please contact the administrator.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Batch Selector Cards Grid */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>Select Cohort Batch</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {batches.map((batch) => {
            const isSelected = batch.id === selectedBatchId
            const enrolledPct = Math.min(100, Math.round((batch.enrolledCount / batch.capacity) * 100))

            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                style={{
                  background: isSelected ? '#ffffff' : '#f8fafc',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: isSelected ? '#1e40af' : '#0f172a', margin: 0 }}>
                      {batch.name}
                    </h3>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{batch.courseTitle}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: batch.status === 'ACTIVE' ? '#ecfdf5' : '#eff6ff',
                      color: batch.status === 'ACTIVE' ? '#059669' : '#1e40af',
                      border: `1px solid ${batch.status === 'ACTIVE' ? '#a7f3d0' : '#bfdbfe'}`,
                    }}
                  >
                    {batch.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarDays style={{ width: 12, height: 12, color: '#94a3b8' }} />
                    {new Date(batch.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users style={{ width: 12, height: 12, color: '#94a3b8' }} />
                    {batch.enrolledCount} / {batch.capacity} Students
                  </span>
                </div>

                {/* Capacity Bar */}
                <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${enrolledPct}%`, height: '100%', background: '#2563eb', borderRadius: 100 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Batch Detail Panel */}
      {activeBatch && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {activeBatch.name} — Student Roster
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: 6 }}>
                  {activeBatch.courseTitle}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                Track student attendance rates, assignment submissions, average marks, and full contact profiles.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                href={`/trainer/sessions?batchId=${activeBatch.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: '#2563eb',
                  padding: '8px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
              >
                <Plus style={{ width: 14, height: 14 }} /> Schedule Class
              </Link>
              <Link
                href={`/trainer/attendance`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '8px 14px',
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
              >
                <UserCheck style={{ width: 14, height: 14, color: '#16a34a' }} /> Mark Attendance
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <Search style={{ width: 15, height: 15, color: '#94a3b8', position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search students by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>
          </div>

          {/* Student Roster Table */}
          {filteredStudents.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 16 }}>
              <Users style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                {searchQuery ? 'No matching students found' : 'No students enrolled in this batch yet'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Student
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Contact
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Enrollment
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Attendance
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Assignments
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                      Avg Score
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', textAlign: 'right' }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => {
                    const initials = s.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: '#eff6ff',
                                color: '#1e40af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>{s.name}</p>
                              <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>
                                ID: #{s.id} {s.joinedAt ? `· Joined ${new Date(s.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Mail style={{ width: 11, height: 11, color: '#94a3b8' }} /> {s.email}
                            </span>
                            {s.contact && (
                              <span style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Phone style={{ width: 11, height: 11, color: '#94a3b8' }} /> {s.contact}
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            {s.enrollmentStatus}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 110 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700 }}>
                              <span style={{ color: '#0f172a' }}>{s.attendanceRate}%</span>
                              <span style={{ color: '#64748b' }}>{s.attendanceCount} att.</span>
                            </div>
                            <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${s.attendanceRate}%`,
                                  height: '100%',
                                  background: s.attendanceRate >= 80 ? '#10b981' : s.attendanceRate >= 50 ? '#f59e0b' : '#ef4444',
                                  borderRadius: 100,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                            {s.submissionsCount} / {s.totalAssignments}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {s.avgScore !== null ? (
                            <span style={{ fontSize: 13, fontWeight: 800, color: s.avgScore >= 75 ? '#059669' : '#d97706' }}>
                              {s.avgScore}%
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: '#1e40af',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              cursor: 'pointer',
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
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
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#ffffff',
              borderRadius: 20,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {selectedStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{selectedStudent.name}</h3>
                  <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>Cohort Student · #{selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 6px 0', fontWeight: 700, textTransform: 'uppercase' }}>Contact & Enrollment</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail style={{ width: 13, height: 13, color: '#2563eb' }} />
                    <a href={`mailto:${selectedStudent.email}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      {selectedStudent.email}
                    </a>
                  </div>
                  {selectedStudent.contact && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone style={{ width: 13, height: 13, color: '#16a34a' }} />
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedStudent.contact}</span>
                      </div>
                      <a
                        href={`https://wa.me/${selectedStudent.contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textDecoration: 'none' }}
                      >
                        Chat on WhatsApp →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#eff6ff', borderRadius: 12, padding: 12, border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: 11, color: '#1e40af', fontWeight: 700, margin: 0 }}>Attendance Rate</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#1e40af', margin: '4px 0 0 0' }}>{selectedStudent.attendanceRate}%</p>
                  <p style={{ fontSize: 10.5, color: '#64748b', margin: '2px 0 0 0' }}>{selectedStudent.attendanceCount} sessions attended</p>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 12, border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: 11, color: '#15803d', fontWeight: 700, margin: 0 }}>Assignments Average</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: '#15803d', margin: '4px 0 0 0' }}>
                    {selectedStudent.avgScore !== null ? `${selectedStudent.avgScore}%` : '—'}
                  </p>
                  <p style={{ fontSize: 10.5, color: '#64748b', margin: '2px 0 0 0' }}>{selectedStudent.submissionsCount} submitted</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
