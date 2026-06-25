import type { NotificationRecipient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const FCM_PROJECT_ID = process.env.FCM_PROJECT_ID
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY

export async function sendPushAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  if (!FCM_PROJECT_ID || !FCM_SERVER_KEY) {
    throw new Error('Push provider not configured: missing FCM_PROJECT_ID / FCM_SERVER_KEY')
  }

  const device = await prisma.pushDevice.findUnique({ where: { token: recipient.address } })
  if (!device || !device.isActive) throw new Error('Push device token is inactive or not registered')

  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token: recipient.address,
        notification: {
          title: recipient.renderedSubject || 'Notification',
          body: recipient.renderedBody,
        },
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Push send failed: ${data.error?.message || res.statusText}`)
  return { providerMessageId: data.name }
}
