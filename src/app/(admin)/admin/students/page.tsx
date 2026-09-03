import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import StudentAdminDirectory from '@/components/admin/StudentAdminDirectory'
import { GraduationCap, Users, UserCheck, Clock3, Plus } from 'lucide-react'
import { syncApprovedCandidatesToStudents } from '@/lib/sync-users'

export default async function AdminStudentsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  // Auto-sync any approved candidates to students roster
  await syncApprovedCandidatesToStudents()

  const students = await prisma.student.findMany({
    include: {
      enrollments: {
        include: {
          batch: {
            select: {
              id: true,
              name: true,
              startDate: true,
              mode: true,
              course: { select: { id: true, title: true } },
              sessions: { select: { id: true, status: true } },
            },
          },
          attendance: {
            select: {
              sessionId: true,
              present: true,
            },
          },
        },
      },
      assignmentSubmissions: {
        select: {
          id: true,
          score: true,
          submittedAt: true,
          gradedAt: true,
          assignment: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const activeCount = students.filter((s) => s.isActive).length
  const inactiveCount = students.length - activeCount
  const totalSubmissions = students.reduce((acc, s) => acc + s.assignmentSubmissions.length, 0)

  const formattedStudents = students.map((s) => ({
    ...s,
    assignmentSubmissions: s.assignmentSubmissions.map((sub) => ({
      ...sub,
      score: sub.score !== null ? Number(sub.score) : null,
    })),
  }))

  return (
    <AdminLayout title="Student Directory">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{
              background: '#ecfeff',
              border: '1px solid #a5f3fc',
              padding: '4px 12px',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#0891b2',
            }}
          >
            <GraduationCap style={{ width: 12, height: 12 }} />
            Student Lifecycle & Roster
          </div>
          <h1 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
            Enrolled Students
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: '4px 0 0' }}>
            Inspect student profiles, assigned cohorts, active access status, and academic coursework.
          </p>
        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Students', value: students.length, icon: Users, accent: '#2563eb', bg: '#eff6ff' },
            { label: 'Active Access',  value: activeCount,     icon: UserCheck, accent: '#16a34a', bg: '#f0fdf4' },
            { label: 'Submissions',    value: totalSubmissions, icon: Clock3, accent: '#7c3aed', bg: '#f5f3ff' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                padding: '10px 16px',
                minWidth: 110,
              }}
            >
              <div
                className="flex items-center gap-1 mb-1"
                style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}
              >
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Admin Directory Component with Search & Actions */}
      <StudentAdminDirectory initialStudents={formattedStudents} />
    </AdminLayout>
  )
}
