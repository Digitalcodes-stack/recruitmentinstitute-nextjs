import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const [
    totalSessions,
    syncedSessions,
    pendingSessions,
    failedSessions,
    recentFailedJobs,
  ] = await Promise.all([
    prisma.session.count(),
    prisma.session.count({ where: { calendarSyncStatus: 'SYNCED' } }),
    prisma.session.count({ where: { calendarSyncStatus: 'PENDING' } }),
    prisma.session.count({ where: { calendarSyncStatus: 'FAILED' } }),
    prisma.jobQueue.findMany({
      where: { type: 'sync_calendar_event', status: 'failed' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, attempts: true, error: true, runAfter: true, updatedAt: true, payload: true },
    }),
  ])

  const config = {
    serviceAccountConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64),
    impersonateEmail: process.env.GOOGLE_IMPERSONATE_EMAIL ?? null,
    timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE ?? 'Asia/Kolkata',
    calendarScopes: ['https://www.googleapis.com/auth/calendar.events'],
  }

  return NextResponse.json({
    success: true,
    data: {
      config,
      stats: {
        totalSessions,
        syncedSessions,
        pendingSessions,
        failedSessions,
      },
      recentFailedJobs,
    },
  })
}
