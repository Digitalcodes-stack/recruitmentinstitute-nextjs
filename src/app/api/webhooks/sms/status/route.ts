import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const STATUS_MAP: Record<string, 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED'> = {
  sent: 'SENT',
  delivered: 'DELIVERED',
  failed: 'FAILED',
  undelivered: 'BOUNCED',
}

function verifyTwilioSignature(url: string, params: Record<string, string>, signature: string | null) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken || !signature) return false

  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url)
  const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const params: Record<string, string> = {}
  formData.forEach((value, key) => { params[key] = String(value) })

  const signature = req.headers.get('x-twilio-signature')
  const url = process.env.SMS_WEBHOOK_URL || req.url
  if (!verifyTwilioSignature(url, params, signature)) {
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
  }

  const messageSid = params.MessageSid
  const status = STATUS_MAP[params.MessageStatus]
  if (!messageSid || !status) return NextResponse.json({ success: true })

  const recipient = await prisma.notificationRecipient.findFirst({ where: { providerMessageId: messageSid } })
  if (recipient) {
    await prisma.notificationRecipient.update({
      where: { id: recipient.id },
      data: { status, ...(status === 'DELIVERED' && { deliveredAt: new Date() }) },
    })
  }

  return NextResponse.json({ success: true })
}
