import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import SubmissionGradeForm from '@/components/admin/SubmissionGradeForm'
import { ArrowLeft, ClipboardList, Paperclip } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AssignmentDetailPage({ params }: Props) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const { id } = await params
  const assignmentId = parseInt(id)

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      submissions: {
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })
  if (!assignment) notFound()

  return (
    <AdminLayout title={assignment.title}>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/admin/assignments"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 14 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Assignments
        </Link>

        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 10 }}>
            <ClipboardList style={{ width: 11, height: 11 }} /> Assignment
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{assignment.title}</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {assignment.batch.name} · {assignment.batch.course.title} · Due {new Date(assignment.dueAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          {assignment.description && <p style={{ fontSize: 13.5, color: '#475569', marginTop: 14, lineHeight: 1.6 }}>{assignment.description}</p>}
          {assignment.fileUrl && (
            <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#2563eb', marginTop: 12 }}>
              <Paperclip style={{ width: 12, height: 12 }} /> View attachment
            </a>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
        Submissions ({assignment.submissions.length})
      </h3>

      {assignment.submissions.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>No submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignment.submissions.map((s) => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: 18, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{s.student.name}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.student.email}</p>
                <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 6 }}>
                  Submitted {new Date(s.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#2563eb', marginTop: 8 }}>
                  <Paperclip style={{ width: 12, height: 12 }} /> View submission
                </a>
                {s.note && <p style={{ fontSize: 12.5, color: '#475569', marginTop: 8 }}>{s.note}</p>}
                {s.score !== null && (
                  <p style={{ fontSize: 12, color: '#059669', marginTop: 8, fontWeight: 600 }}>
                    Graded: {s.score.toString()}/100{s.feedback ? ` — ${s.feedback}` : ''}
                  </p>
                )}
              </div>
              <SubmissionGradeForm
                assignmentId={assignmentId}
                submissionId={s.id}
                initialScore={s.score !== null ? Number(s.score) : null}
                initialFeedback={s.feedback}
              />
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
