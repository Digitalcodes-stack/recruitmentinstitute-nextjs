import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendReminder } from '@/lib/jobs/sendReminder'
import { syncCalendarEvent } from '@/lib/jobs/syncCalendarEvent'

const BATCH_SIZE = 25
const MAX_ATTEMPTS = 3

const HANDLERS: Record<string, (payload: Prisma.JsonValue) => Promise<void>> = {
  send_reminder: (payload) => sendReminder(payload as unknown as Parameters<typeof sendReminder>[0]),
  sync_calendar_event: (payload) => syncCalendarEvent(payload as unknown as Parameters<typeof syncCalendarEvent>[0]),
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

  return NextResponse.json({ success: true, data: { claimed: claimed.length, succeeded, failed } })
}
