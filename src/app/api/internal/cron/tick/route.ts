import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendReminder } from '@/lib/jobs/sendReminder'
import { syncCalendarEvent } from '@/lib/jobs/syncCalendarEvent'
import { dispatchNotificationRecipient } from '@/lib/jobs/dispatchNotification'
import { promoteScheduledNotifications, maxAttemptsForChannel, backoffRunAfter } from '@/lib/jobs/notifications'
import { sendBatchStartReminder, scheduleBatchStartReminders } from '@/lib/jobs/sendBatchStartReminder'

const BATCH_SIZE = 25
const MAX_ATTEMPTS = 3

const HANDLERS: Record<string, (payload: Prisma.JsonValue) => Promise<void>> = {
  send_reminder: (payload) => sendReminder(payload as unknown as Parameters<typeof sendReminder>[0]),
  sync_calendar_event: (payload) => syncCalendarEvent(payload as unknown as Parameters<typeof syncCalendarEvent>[0]),
  dispatch_notification: (payload) => dispatchNotificationRecipient(payload as unknown as Parameters<typeof dispatchNotificationRecipient>[0]),
  send_batch_start_reminder: (payload) => sendBatchStartReminder(payload as unknown as Parameters<typeof sendBatchStartReminder>[0]),
}

async function handleNotificationFailure(job: { id: number; payload: Prisma.JsonValue; attempts: number }, error: unknown) {
  const notificationRecipientId = (job.payload as { notificationRecipientId: number }).notificationRecipientId
  const recipient = await prisma.notificationRecipient.findUnique({ where: { id: notificationRecipientId } })
  if (!recipient) return

  const attempts = recipient.attempts + 1
  const limit = maxAttemptsForChannel(recipient.channel)
  const willRetry = attempts < limit
  const message = error instanceof Error ? error.message : String(error)

  await prisma.notificationRecipient.update({
    where: { id: recipient.id },
    data: {
      status: willRetry ? 'PENDING' : 'FAILED',
      attempts,
      error: message,
      lastAttemptAt: new Date(),
      ...(!willRetry && { failedAt: new Date() }),
    },
  })

  if (willRetry) {
    await prisma.jobQueue.create({
      data: { type: 'dispatch_notification', payload: { notificationRecipientId: recipient.id }, runAfter: backoffRunAfter(attempts) },
    })
  }
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const promoted = await promoteScheduledNotifications()
  await scheduleBatchStartReminders()

  const claimed = await prisma.$transaction(async (tx) => {
    const due = await tx.jobQueue.findMany({
      where: { status: 'pending', runAfter: { lte: new Date() } },
      orderBy: { runAfter: 'asc' },
      take: BATCH_SIZE,
    })
    if (due.length === 0) return []

    await tx.jobQueue.updateMany({
      where: { id: { in: due.map((j) => j.id) } },
      data: { status: 'processing' },
    })
    return due
  })

  let succeeded = 0
  let failed = 0

  for (const job of claimed) {
    const handler = HANDLERS[job.type]
    try {
      if (!handler) throw new Error(`No handler registered for job type "${job.type}"`)
      await handler(job.payload)
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: 'completed' },
      })
      succeeded++
    } catch (error) {
      if (job.type === 'dispatch_notification') {
        await handleNotificationFailure(job, error)
        await prisma.jobQueue.update({ where: { id: job.id }, data: { status: 'failed', error: error instanceof Error ? error.message : String(error) } })
        failed++
        continue
      }

      const attempts = job.attempts + 1
      const willRetry = attempts < MAX_ATTEMPTS
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: willRetry ? 'pending' : 'failed',
          attempts,
          error: error instanceof Error ? error.message : String(error),
          ...(willRetry && { runAfter: new Date(Date.now() + 5 * 60 * 1000) }),
        },
      })
      failed++
    }
  }

  return NextResponse.json({ success: true, data: { promoted, claimed: claimed.length, succeeded, failed } })
}
