import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

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
              createdAt: true,
            },
          },
          attendance: {
            select: {
              sessionId: true,
              present: true,
              joinedAt: true,
            },
          },
        },
      },
      sessions: {
        select: {
          id: true,
          title: true,
          sessionDate: true,
          startTime: true,
          endTime: true,
          status: true,
          meetLink: true,
        },
        orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
      },
      assignments: {
        select: {
          id: true,
          title: true,
          dueAt: true,
          submissions: {
            select: {
              id: true,
              studentId: true,
              score: true,
              submittedAt: true,
              gradedAt: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  // Format batches with calculated statistics
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
        joinedAt: en.student.createdAt,
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

  return NextResponse.json({ success: true, data: formattedBatches })
}
