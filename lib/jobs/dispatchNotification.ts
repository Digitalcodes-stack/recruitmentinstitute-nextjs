import { prisma } from '@/lib/prisma'
import type { NotificationChannel, NotificationRecipient } from '@prisma/client'
import { sendEmailAdapter } from '@/lib/notifications/adapters/email'
import { sendSmsAdapter } from '@/lib/notifications/adapters/sms'
import { sendWhatsappAdapter } from '@/lib/notifications/adapters/whatsapp'
import { sendPushAdapter } from '@/lib/notifications/adapters/push'
import { sendInAppAdapter } from '@/lib/notifications/adapters/inApp'

const ADAPTERS: Record<NotificationChannel, (r: NotificationRecipient) => Promise<{ providerMessageId: string }>> = {
  EMAIL: sendEmailAdapter,
  SMS: sendSmsAdapter,
  WHATSAPP: sendWhatsappAdapter,
  PUSH: sendPushAdapter,
  IN_APP: sendInAppAdapter,
}

async function finalizeNotificationStatus(notificationId: number) {
  const counts = await prisma.notificationRecipient.groupBy({
    by: ['status'],
    where: { notificationId },
    _count: true,
  })
  const total = counts.reduce((sum, c) => sum + c._count, 0)
  const pendingOrQueued = counts.filter((c) => c.status === 'PENDING' || c.status === 'QUEUED').reduce((s, c) => s + c._count, 0)
  if (pendingOrQueued > 0) return

  const failed = counts.filter((c) => c.status === 'FAILED' || c.status === 'BOUNCED').reduce((s, c) => s + c._count, 0)
  const status = failed === 0 ? 'COMPLETED' : failed === total ? 'FAILED' : 'PARTIALLY_FAILED'
  await prisma.notification.update({ where: { id: notificationId }, data: { status } })
}

export async function dispatchNotificationRecipient(payload: { notificationRecipientId: number }) {
  const recipient = await prisma.notificationRecipient.findUnique({ where: { id: payload.notificationRecipientId } })
  if (!recipient) return
  if (recipient.status !== 'PENDING' && recipient.status !== 'QUEUED') return

  const adapter = ADAPTERS[recipient.channel]
  try {
    const { providerMessageId } = await adapter(recipient)
    await prisma.notificationRecipient.update({
      where: { id: recipient.id },
      data: {
        status: recipient.channel === 'IN_APP' ? 'DELIVERED' : 'SENT',
        sentAt: new Date(),
        deliveredAt: recipient.channel === 'IN_APP' ? new Date() : null,
        providerMessageId,
        lastAttemptAt: new Date(),
      },
    })
  } finally {
    await finalizeNotificationStatus(recipient.notificationId)
  }
}
