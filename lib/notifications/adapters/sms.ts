import type { NotificationRecipient } from '@prisma/client'

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const FROM_NUMBER = process.env.TWILIO_SMS_FROM

export async function sendSmsAdapter(recipient: NotificationRecipient): Promise<{ providerMessageId: string }> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    throw new Error('SMS provider not configured: missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_SMS_FROM')
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: recipient.address,
      From: FROM_NUMBER,
      Body: recipient.renderedBody,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`SMS send failed: ${data.message || res.statusText}`)
  return { providerMessageId: data.sid }
}
