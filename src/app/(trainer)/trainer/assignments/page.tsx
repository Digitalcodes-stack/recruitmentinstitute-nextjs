import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import TrainerAssignmentsClient from '@/components/trainer/TrainerAssignmentsClient'

export default async function TrainerAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; assignmentId?: string; grade?: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const { batchId: paramBatchId, assignmentId: paramAssignmentId, grade: paramGrade } = await searchParams
  const initialBatchFilter = paramBatchId ? parseInt(paramBatchId) : undefined
  const initialAssignmentId = paramAssignmentId ? parseInt(paramAssignmentId) : undefined
  const initialGradeSubmissionId = paramGrade ? parseInt(paramGrade) : undefined

  const [batches, assignments] = await Promise.all([
    prisma.batch.findMany({
      where: { trainerId: session.userId },
      include: {
        course: { select: { title: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.assignment.findMany({
      where: { batch: { trainerId: session.userId } },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            course: { select: { title: true } },
            _count: { select: { enrollments: true } },
          },
        },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { dueAt: 'desc' },
    }),
  ])

  const formattedAssignments = assignments.map((a) => {
    const totalEnrolled = a.batch._count.enrollments
    const totalSubmissions = a.submissions.length
    const pendingGrading = a.submissions.filter((s) => s.score === null).length
    const gradedCount = a.submissions.filter((s) => s.score !== null).length

    return {
      id: a.id,
      title: a.title,
      description: a.description,
      fileUrl: a.fileUrl,
      dueAt: a.dueAt,
      createdAt: a.createdAt,
      batchId: a.batch.id,
      batchName: a.batch.name,
      courseTitle: a.batch.course.title,
      totalEnrolled,
      totalSubmissions,
      pendingGrading,
      gradedCount,
      submissions: a.submissions.map((s) => ({
        id: s.id,
        studentId: s.student.id,
        studentName: s.student.name,
        studentEmail: s.student.email,
        fileUrl: s.fileUrl,
        note: s.note,
        submittedAt: s.submittedAt,
        score: s.score ? Number(s.score) : null,
        feedback: s.feedback,
        gradedAt: s.gradedAt,
      })),
    }
  })

  return (
    <TrainerLayout title="Assignments & Grading" trainerName={session.name}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Batch Assignments & Grading Portal
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
          Create and assign coursework, review student submission files, grade work out of 100, and provide constructive feedback.
        </p>
      </div>

      <TrainerAssignmentsClient
        assignments={formattedAssignments}
        batches={batches}
        initialBatchFilter={initialBatchFilter}
        initialAssignmentId={initialAssignmentId}
        initialGradeSubmissionId={initialGradeSubmissionId}
      />
    </TrainerLayout>
  )
}
