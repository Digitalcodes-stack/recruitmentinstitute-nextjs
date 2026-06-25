import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import EnrollmentReviewActions from '@/components/admin/EnrollmentReviewActions'
import { ClipboardList, Users, Clock3, BadgeCheck } from 'lucide-react'

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  PENDING: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  APPROVED: { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0' },
  ACTIVE: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  COMPLETED: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  ON_HOLD: { bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
  ENROLLED: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
}

function labelForStatus(status: string) {
  return status === 'PENDING' ? 'Pending Approval' : status === 'ON_HOLD' ? 'On Hold' : status.charAt(0) + status.slice(1).toLowerCase()
}

export default async function AdminEnrollmentsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      batch: {
        select: {
          id: true,
          name: true,
          capacity: true,
          course: { select: { title: true } },
          trainer: { select: { name: true } },
        },
      },
      reviewedByAdmin: { select: { name: true, email: true } },
    },
    orderBy: { requestedAt: 'desc' },
  })

  const pendingCount = enrollments.filter((e) => e.status === 'PENDING').length
  const approvedCount = enrollments.filter((e) => ['APPROVED', 'ACTIVE', 'ENROLLED'].includes(e.status)).length

  return (
    <AdminLayout title="Enrollments">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 100, padding: '5px 13px', marginBottom: 12, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#d97706' }}>
            <ClipboardList style={{ width: 11, height: 11 }} />
            Enrollment Review
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>Enrollment Requests</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>Approve, hold, or reject student requests before trainer assignment and session access.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: enrollments.length, icon: Users, bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
            { label: 'Pending', value: pendingCount, icon: Clock3, bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
            { label: 'Approved', value: approvedCount, icon: BadgeCheck, bg: '#ecfdf5', color: '#059669', border: '#bbf7d0' },
          ].map(({ label, value, icon: Icon, bg, color, border }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>
                <Icon style={{ width: 10, height: 10 }} />
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{value}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}` }}>Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0' }}>
              {['Student', 'Course / Batch', 'Requested', 'Status', 'Reviewer', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => {
              const st = STATUS_STYLE[enrollment.status] ?? STATUS_STYLE.PENDING
              return (
                <tr key={enrollment.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{enrollment.student.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{enrollment.student.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{enrollment.batch.course.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {enrollment.batch.name} · Trainer: {enrollment.batch.trainer.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {new Date(enrollment.requestedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {labelForStatus(enrollment.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {enrollment.reviewedByAdmin ? (
                      <>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{enrollment.reviewedByAdmin.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{enrollment.reviewedByAdmin.email}</div>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not reviewed</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {enrollment.status === 'PENDING' ? (
                      <EnrollmentReviewActions id={enrollment.id} />
                    ) : (
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>No action required</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
