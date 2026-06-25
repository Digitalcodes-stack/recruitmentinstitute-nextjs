import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STATUS_MAP: Record<string, 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'READ'> = {
  delivery: 'DELIVERED',
  delivered: 'DELIVERED',
  bounce: 'BOUNCED',
  bounced: 'BOUNCED',
  open: 'READ',
  opened: 'READ',
  failed: 'FAILED',
}

export async function POST(req: NextRequest) {
  const secret = process.env.EMAIL_WEBHOOK_SECRET
  if (secret && req.headers.get('x-webhook-secret') !== secret) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const messageId = body.messageId || body.MessageID
  const eventType = String(body.event || body.RecordType || '').toLowerCase()
  const status = STATUS_MAP[eventType]

  if (!messageId || !status) return NextResponse.json({ success: true })

  const recipient = await prisma.notificationRecipient.findFirst({ where: { providerMessageId: messageId } })
  if (recipient) {
    await prisma.notificationRecipient.update({
      where: { id: recipient.id },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(status === 'READ' && { readAt: new Date() }),
      },
    })
  }

  return NextResponse.json({ success: true })
}
