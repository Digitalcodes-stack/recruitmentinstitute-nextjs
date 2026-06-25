import { prisma } from '@/lib/prisma'
import { resolveAudience } from '@/lib/notifications/audience'
import { renderTemplate } from '@/lib/notifications/render'

const CHANNEL_RETRY_LIMIT: Record<string, number> = {
  EMAIL: 5,
  IN_APP: 5,
  SMS: 2,
  WHATSAPP: 2,
  PUSH: 3,
}

export function maxAttemptsForChannel(channel: string) {
  return CHANNEL_RETRY_LIMIT[channel] ?? 3
}

export function backoffRunAfter(attempts: number) {
  return new Date(Date.now() + 5 * 60 * 1000 * Math.pow(2, attempts - 1))
}

export async function expandNotificationToRecipients(notificationId: number) {
  const notification = await prisma.notification.findUniqueOrThrow({
    where: { id: notificationId },
    include: { template: true },
  })

  const resolved = await resolveAudience(
    notification.audienceType,
    notification.audienceFilter as Record<string, unknown> | null,
    notification.channels,
    undefined,
    notification.template?.key
  )

  const variables = (notification.variables as Record<string, unknown>) ?? {}
  const subjectSource = notification.template?.subject ?? notification.title
  const bodySource = (channel: string) =>
    channel === 'EMAIL' ? notification.template?.bodyHtml ?? notification.template?.bodyText ?? '' : notification.template?.bodyText ?? ''

  if (resolved.length === 0) return 0

  await prisma.notificationRecipient.createMany({
    data: resolved.map((r) => ({
      notificationId,
      recipientType: r.recipientType,
      recipientId: r.recipientId,
      channel: r.channel,
      address: r.address,
      renderedSubject: renderTemplate(subjectSource, variables),
      renderedBody: renderTemplate(bodySource(r.channel), variables),
    })),
  })

  return resolved.length
}

export async function enqueueNotificationDispatch(notificationId: number, runAfter = new Date()) {
  const recipients = await prisma.notificationRecipient.findMany({
    where: { notificationId, status: 'PENDING' },
    select: { id: true },
  })
  if (recipients.length === 0) return 0

  await prisma.jobQueue.createMany({
    data: recipients.map((r) => ({
      type: 'dispatch_notification',
      payload: { notificationRecipientId: r.id },
      runAfter,
    })),
  })
  await prisma.notification.update({ where: { id: notificationId }, data: { status: 'PROCESSING' } })
  return recipients.length
}

export async function sendNotificationNow(notificationId: number) {
  await expandNotificationToRecipients(notificationId)
  return enqueueNotificationDispatch(notificationId)
}

export async function retryFailedRecipients(notificationId: number) {
  const failed = await prisma.notificationRecipient.findMany({
    where: { notificationId, status: { in: ['FAILED', 'BOUNCED'] } },
    select: { id: true, channel: true },
  })
  if (failed.length === 0) return 0

  await prisma.notificationRecipient.updateMany({
    where: { id: { in: failed.map((f) => f.id) } },
    data: { status: 'PENDING', attempts: 0, error: null },
  })
  await prisma.jobQueue.createMany({
    data: failed.map((f) => ({
      type: 'dispatch_notification',
      payload: { notificationRecipientId: f.id },
      runAfter: new Date(),
    })),
  })
  await prisma.notification.update({ where: { id: notificationId }, data: { status: 'PROCESSING' } })
  return failed.length
}

export async function retrySingleRecipient(recipientId: number) {
  const recipient = await prisma.notificationRecipient.findUnique({ where: { id: recipientId } })
  if (!recipient || (recipient.status !== 'FAILED' && recipient.status !== 'BOUNCED')) return null

  await prisma.notificationRecipient.update({
    where: { id: recipientId },
    data: { status: 'PENDING', attempts: 0, error: null },
  })
  await prisma.jobQueue.create({
    data: { type: 'dispatch_notification', payload: { notificationRecipientId: recipientId }, runAfter: new Date() },
  })
  return recipient
}

export async function promoteScheduledNotifications() {
  const due = await prisma.notification.findMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
    select: { id: true },
  })
  for (const { id } of due) {
    await sendNotificationNow(id)
  }
  return due.length
}
