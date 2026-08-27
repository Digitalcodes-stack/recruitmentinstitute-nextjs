import { prisma } from '@/lib/prisma'
import { sendBatchStartReminderEmail } from '@/lib/email'

interface BatchStartReminderPayload {
  batchId: number
  lead: '3d' | '1d'
}

const LEAD_LABEL: Record<BatchStartReminderPayload['lead'], string> = { '3d': 'in 3 days', '1d': 'tomorrow' }

/** Emails every enrolled student and the assigned trainer that a batch is about to start. */
export async function sendBatchStartReminder(payload: BatchStartReminderPayload) {
  const { batchId, lead } = payload

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: { select: { title: true } },
      trainer: { select: { name: true, email: true } },
      enrollments: { include: { student: { select: { name: true, email: true, isActive: true } } } },
    },
  })
  if (!batch || batch.status === 'CANCELLED') return

  const startDateStr = batch.startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const leadLabel = LEAD_LABEL[lead]

  const students = batch.enrollments
    .filter((e) => ['APPROVED', 'ACTIVE', 'ENROLLED'].includes(e.status) && e.student.isActive)
    .map((e) => e.student)

  await Promise.allSettled([
    ...students.map((student) =>
      sendBatchStartReminderEmail({
        recipientEmail: student.email,
        recipientName: student.name,
        role: 'student',
        batchName: batch.name,
        courseTitle: batch.course.title,
        startDate: startDateStr,
        leadLabel,
      })
    ),
    sendBatchStartReminderEmail({
      recipientEmail: batch.trainer.email,
      recipientName: batch.trainer.name,
      role: 'trainer',
      batchName: batch.name,
      courseTitle: batch.course.title,
      startDate: startDateStr,
      leadLabel,
    }),
  ])
}

/**
 * Scans UPCOMING batches starting in ~3 days or ~1 day and enqueues one reminder
 * job per batch per lead time. De-dupes against jobs already queued for the same
 * batch+lead so the 5-minute cron tick doesn't double-enqueue.
 */
export async function scheduleBatchStartReminders() {
  const now = new Date()
  const windows: { lead: '3d' | '1d'; daysAhead: number }[] = [
    { lead: '3d', daysAhead: 3 },
    { lead: '1d', daysAhead: 1 },
  ]

  let enqueued = 0
  for (const { lead, daysAhead } of windows) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() + daysAhead)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const batches = await prisma.batch.findMany({
      where: { status: 'UPCOMING', startDate: { gte: dayStart, lt: dayEnd } },
      select: { id: true },
    })

    for (const { id: batchId } of batches) {
      const alreadyQueued = await prisma.jobQueue.findFirst({
        where: {
          type: 'send_batch_start_reminder',
          payload: { equals: { batchId, lead } },
          status: { in: ['pending', 'processing', 'completed'] },
        },
      })
      if (alreadyQueued) continue

      await prisma.jobQueue.create({
        data: { type: 'send_batch_start_reminder', payload: { batchId, lead }, runAfter: new Date() },
      })
      enqueued++
    }
  }
  return enqueued
}
