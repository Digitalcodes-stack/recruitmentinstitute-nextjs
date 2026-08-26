import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TrainerLayout from '@/components/trainer/TrainerLayout'
import TrainerAttendanceClient from '@/components/trainer/TrainerAttendanceClient'

export default async function TrainerAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; batchId?: string }>
}) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') redirect('/trainer-login')

  const { sessionId: paramSessionId, batchId: paramBatchId } = await searchParams
  const initialSessionId = paramSessionId ? parseInt(paramSessionId) : undefined
  const filterBatchId = paramBatchId ? parseInt(paramBatchId) : undefined

  // Fetch all sessions belonging to the trainer
  const sessions = await prisma.session.findMany({
    where: {
      trainerId: session.userId,
      ...(filterBatchId ? { batchId: filterBatchId } : {}),
    },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          course: { select: { title: true } },
        },
      },
    },
    orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
  })

  // Format session list
  const formattedSessions = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    sessionDate: s.sessionDate,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    meetLink: s.meetLink,
    batchId: s.batchId,
    batchName: s.batch.name,
    courseTitle: s.batch.course.title,
  }))

  // Determine active session
  const activeSessionId =
    initialSessionId && formattedSessions.some((s) => s.id === initialSessionId)
      ? initialSessionId
      : formattedSessions[0]?.id ?? 0

  let initialRoster: any[] = []

  if (activeSessionId > 0) {
    const classSession = await prisma.session.findUnique({
      where: { id: activeSessionId },
      include: {
        batch: {
          include: {
            enrollments: {
              where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    contact: true,
                  },
                },
              },
            },
          },
        },
        attendance: true,
      },
    })

    if (classSession) {
      const attendanceMap = new Map(classSession.attendance.map((a) => [a.enrollmentId, a]))
      initialRoster = classSession.batch.enrollments.map((en) => {
        const att = attendanceMap.get(en.id)
        return {
          enrollmentId: en.id,
          studentId: en.student.id,
          studentName: en.student.name,
          studentEmail: en.student.email,
          studentContact: en.student.contact,
          present: att ? att.present : false,
          joinedAt: att?.joinedAt || null,
        }
      })
    }
  }

  return (
    <TrainerLayout title="Class Attendance Register" trainerName={session.name}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Class Attendance Register
        </h1>
        <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>
          Record student presence for conducted live classes, track online join timestamps, and maintain batch attendance logs.
        </p>
      </div>

      <TrainerAttendanceClient
        sessions={formattedSessions}
        initialSessionId={activeSessionId}
        initialRoster={initialRoster}
      />
    </TrainerLayout>
  )
}
