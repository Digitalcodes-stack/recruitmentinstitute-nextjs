import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import TrainerBatchesClient from '@/components/trainer/TrainerBatchesClient'

export default async function TrainerBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const { batchId } = await searchParams
  const initialBatchId = batchId ? parseInt(batchId) : undefined

  const batches = await prisma.batch.findMany({
    where: { trainerId: session.userId },
    include: {
      course: { select: { id: true, title: true } },
      enrollments: {
        where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              contact: true,
              isActive: true,
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
      sessions: {
        select: { id: true, title: true, sessionDate: true, status: true },
      },
      assignments: {
        select: {
          id: true,
          title: true,
          submissions: {
            select: {
              id: true,
              studentId: true,
              score: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  // Format data for client component
  const formattedBatches = batches.map((batch) => {
    const totalSessions = batch.sessions.length
    const totalAssignments = batch.assignments.length

    const students = batch.enrollments.map((en) => {
      const studentAttendanceCount = en.attendance.filter((a) => a.present).length
      const attendanceRate = totalSessions > 0 ? Math.round((studentAttendanceCount / totalSessions) * 100) : 100

      const studentSubmissions = batch.assignments.filter((a) =>
        a.submissions.some((sub) => sub.studentId === en.student.id)
      ).length

      const gradedSubmissions = batch.assignments.flatMap((a) =>
        a.submissions.filter((sub) => sub.studentId === en.student.id && sub.score !== null)
      )

      const avgScore =
        gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, s) => sum + Number(s.score || 0), 0) / gradedSubmissions.length
            )
          : null

      return {
        id: en.student.id,
        enrollmentId: en.id,
        name: en.student.name,
        email: en.student.email,
        contact: en.student.contact,
        isActive: en.student.isActive,
        enrollmentStatus: en.status,
        enrolledAt: en.enrolledAt,
        attendanceCount: studentAttendanceCount,
        attendanceRate,
        submissionsCount: studentSubmissions,
        totalAssignments,
        avgScore,
      }
    })

    return {
      id: batch.id,
      name: batch.name,
      courseId: batch.courseId,
      courseTitle: batch.course.title,
      mode: batch.mode,
      capacity: batch.capacity,
      startDate: batch.startDate,
      endDate: batch.endDate,
      schedule: batch.schedule,
      status: batch.status,
      totalSessions,
      totalAssignments,
      enrolledCount: students.length,
      students,
    }
  })

  return (
    <TrainerLayout title="Batches & Students" trainerName={session.name}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Assigned Batches & Student Rosters
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
          Manage your batches, view enrolled student profiles, track individual attendance and progress.
        </p>
      </div>

      <TrainerBatchesClient batches={formattedBatches} initialBatchId={initialBatchId} />
    </TrainerLayout>
  )
}
