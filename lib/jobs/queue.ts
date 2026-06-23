import { prisma } from '@/lib/prisma'

const LEAD_TIMES: { lead: '24h' | '1h' | '15m'; ms: number }[] = [
  { lead: '24h', ms: 24 * 60 * 60 * 1000 },
  { lead: '1h', ms: 60 * 60 * 1000 },
  { lead: '15m', ms: 15 * 60 * 1000 },
]

export async function enqueueSessionReminders(sessionId: number, startTime: Date) {
  await prisma.jobQueue.deleteMany({
    where: { type: 'send_reminder', status: 'pending', payload: { path: ['sessionId'], equals: sessionId } },
  })

  const jobs = LEAD_TIMES
    .map(({ lead, ms }) => ({ lead, runAfter: new Date(startTime.getTime() - ms) }))
    .filter(({ runAfter }) => runAfter.getTime() > Date.now())

  if (jobs.length === 0) return

  await prisma.jobQueue.createMany({
    data: jobs.map(({ lead, runAfter }) => ({
      type: 'send_reminder',
      payload: { sessionId, lead },
      runAfter,
    })),
  })
}

export async function cancelSessionReminders(sessionId: number) {
  await prisma.jobQueue.deleteMany({
    where: { type: 'send_reminder', status: 'pending', payload: { path: ['sessionId'], equals: sessionId } },
  })
}

export async function enqueueCalendarSync(sessionId: number, action: 'create' | 'patch' | 'cancel', googleEventId?: string) {
  if (action !== 'cancel') {
    await prisma.session.update({ where: { id: sessionId }, data: { calendarSyncStatus: 'PENDING' } })
  }
  await prisma.jobQueue.create({
    data: {
      type: 'sync_calendar_event',
      payload: { sessionId, action, ...(googleEventId && { googleEventId }) },
      runAfter: new Date(),
    },
  })
}

export async function enqueueJobRetry(jobId: number, runAfter = new Date()) {
  const job = await prisma.jobQueue.findUnique({ where: { id: jobId } })
  if (!job) return null

  return prisma.jobQueue.update({
    where: { id: jobId },
    data: {
      status: 'pending',
      attempts: 0,
      error: null,
      runAfter,
    },
  })
}
