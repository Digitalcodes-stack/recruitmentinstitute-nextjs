import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import { ClipboardList, Plus, FileCheck2 } from 'lucide-react'
import AssignmentActions from '@/components/admin/AssignmentActions'

export default async function AdminAssignmentsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const assignments = await prisma.assignment.findMany({
    include: {
      batch: { select: { name: true, course: { select: { title: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueAt: 'desc' },
  })

  const now = new Date()
  const overdueCount = assignments.filter((a) => new Date(a.dueAt) < now).length

  return (
    <AdminLayout title="Assignments">
      <div className="flex items-start justify-between gap-6 mb-7" style={{ flexWrap: 'wrap' }}>
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full mb-3"
            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '5px 13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb' }}
          >
            <ClipboardList style={{ width: 11, height: 11 }} />
            Coursework
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 26, color: '#0f172a', lineHeight: 1.2 }}>
            Assignments
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 5 }}>
            Assign coursework to a batch and review student submissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[
            { label: 'Total Assignments', value: assignments.length, icon: ClipboardList },
            { label: 'Past Due', value: overdueCount, icon: FileCheck2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: '14px 18px', minWidth: 110 }}>
              <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8' }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</span>
            </div>
          ))}
          <Link
            href="/admin/assignments/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Assignment
          </Link>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '64px 32px', textAlign: 'center' }}>
          <ClipboardList style={{ width: 36, height: 36, color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>No assignments yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Create your first assignment for a batch.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8ecf0' }}>
                {['Title', 'Batch', 'Course', 'Submissions', 'Due', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const overdue = new Date(a.dueAt) < now
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{a.title}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.batch.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.batch.course.title}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a._count.submissions}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: overdue ? '#fef2f2' : '#eff6ff', color: overdue ? '#dc2626' : '#2563eb', border: `1px solid ${overdue ? '#fecaca' : '#bfdbfe'}` }}>
                        {new Date(a.dueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <AssignmentActions id={a.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
