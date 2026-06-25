import type { NotificationRecipient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0'

export async function sendWhatsappAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('WhatsApp provider not configured: missing WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN')
  }

  const notification = await prisma.notification.findUnique({
    where: { id: recipient.notificationId },
    include: { template: true },
  })
  const templateName = notification?.template?.whatsappTemplateName

  const payload = templateName
    ? {
        messaging_product: 'whatsapp',
        to: recipient.address,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: recipient.renderedBody }],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: recipient.address,
        type: 'text',
        text: { body: recipient.renderedBody },
      }

  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`WhatsApp send failed: ${data.error?.message || res.statusText}`)
  return { providerMessageId: data.messages?.[0]?.id }
}
