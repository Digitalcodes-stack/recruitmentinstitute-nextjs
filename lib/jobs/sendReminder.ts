import { prisma } from '@/lib/prisma'
import { sendSessionReminderEmail } from '@/lib/email'

interface ReminderPayload {
  sessionId: number
  lead: '24h' | '1h' | '15m'
}

export async function sendReminder(payload: ReminderPayload) {
  const { sessionId, lead } = payload

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { batch: { include: { enrollments: { include: { student: true } } } } },
  })
  if (!session || session.status === 'CANCELLED') return

  const sessionDate = session.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const startTime = session.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  for (const enrollment of session.batch.enrollments) {
    if (!['APPROVED', 'ACTIVE', 'ENROLLED'].includes(enrollment.status) || !enrollment.student.isActive) continue
    await sendSessionReminderEmail({
      studentEmail: enrollment.student.email,
      studentName: enrollment.student.name,
      sessionTitle: session.title,
      batchName: session.batch.name,
      sessionDate,
      startTime,
      meetLink: session.meetLink,
      lead,
    })
  }
}
