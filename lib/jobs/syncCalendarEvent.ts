import { prisma } from '@/lib/prisma'
import { createCalendarEvent, patchCalendarEvent, cancelCalendarEvent } from '@/lib/google'
import {
  sendSessionScheduledEmail,
  sendSessionRescheduledEmail,
  sendSessionCancelledEmail,
} from '@/lib/email'

interface SyncPayload {
  sessionId: number
  action: 'create' | 'patch' | 'cancel'
  googleEventId?: string
}

async function getSessionWithRelations(sessionId: number) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      trainer: true,
      batch: { include: { enrollments: { include: { student: true } } } },
    },
  })
}

function getAttendees(session: NonNullable<Awaited<ReturnType<typeof getSessionWithRelations>>>) {
  const activeEnrollments = session.batch.enrollments.filter((e) => e.status === 'ENROLLED' && e.student.isActive)
  const emails = new Map<string, { email: string }>()

  emails.set(session.trainer.email, { email: session.trainer.email })
  for (const enrollment of activeEnrollments) {
    emails.set(enrollment.student.email, { email: enrollment.student.email })
  }

  return { activeEnrollments, attendees: Array.from(emails.values()) }
}

async function sendClassEmails(
  kind: 'scheduled' | 'rescheduled' | 'cancelled',
  session: NonNullable<Awaited<ReturnType<typeof getSessionWithRelations>>>,
  activeEnrollments: Array<(typeof session.batch.enrollments)[number]>,
  meetLink: string | null
) {
  const sessionDate = session.sessionDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const startTime = session.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  for (const enrollment of activeEnrollments) {
    const base = {
      studentEmail: enrollment.student.email,
      studentName: enrollment.student.name,
      sessionTitle: session.title,
      batchName: session.batch.name,
      meetLink,
    }

    if (kind === 'scheduled') {
      await sendSessionScheduledEmail(base)
    } else if (kind === 'rescheduled') {
      await sendSessionRescheduledEmail(base)
    } else {
      await sendSessionCancelledEmail({
        ...base,
        sessionDate,
        startTime,
      })
    }
  }
}

export async function syncCalendarEvent(payload: SyncPayload) {
  const { sessionId, action } = payload
  const session = await getSessionWithRelations(sessionId)

  if (action === 'cancel') {
    const eventId = session?.googleEventId ?? payload.googleEventId
    if (eventId) await cancelCalendarEvent(eventId)
    if (session) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { calendarSyncStatus: 'SYNCED', calendarSyncError: null },
      })
      const { activeEnrollments } = getAttendees(session)
      await sendClassEmails('cancelled', session, activeEnrollments, session.meetLink)
    }
    return
  }

  if (!session) return

  try {
    const { activeEnrollments, attendees } = getAttendees(session)
    const withMeet = !session.meetLink

    if (action === 'create' || !session.googleEventId) {
      const { eventId, meetLink } = await createCalendarEvent({
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        attendees,
        withMeet,
      })
      const finalMeetLink = session.meetLink ?? meetLink
      await prisma.session.update({
        where: { id: sessionId },
        data: { googleEventId: eventId, meetLink: finalMeetLink, calendarSyncStatus: 'SYNCED', calendarSyncError: null },
      })

      try {
        await sendClassEmails('scheduled', session, activeEnrollments, finalMeetLink)
      } catch {
        // Email failure must not roll back an already-successful Calendar sync.
      }
      return
    }

    // action === 'patch', event already exists
    const patchResult = await patchCalendarEvent(session.googleEventId, {
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      attendees,
      ...(withMeet ? { withMeet: true } : {}),
    })
    const finalMeetLink = session.meetLink ?? patchResult.meetLink ?? null
    await prisma.session.update({
      where: { id: sessionId },
      data: { meetLink: finalMeetLink, calendarSyncStatus: 'SYNCED', calendarSyncError: null },
    })

    try {
      await sendClassEmails('rescheduled', session, activeEnrollments, finalMeetLink)
    } catch {
      // Same isolation as the create path above.
    }
  } catch (e) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { calendarSyncStatus: 'FAILED', calendarSyncError: (e instanceof Error ? e.message : String(e)).slice(0, 500) },
    })
    throw e
  }
}
