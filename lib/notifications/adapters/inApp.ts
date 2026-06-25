import type { NotificationRecipient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function sendInAppAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  if (!recipient.recipientId) throw new Error('In-app notifications require a recipientId')

  const row = await prisma.inAppNotification.create({
    data: {
      recipientType: recipient.recipientType,
      recipientId: recipient.recipientId,
      title: recipient.renderedSubject || '',
      body: recipient.renderedBody,
      notificationRecipientId: recipient.id,
    },
  })
  return { providerMessageId: String(row.id) }
}
