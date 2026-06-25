import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const STATUS_MAP: Record<string, 'SENT' | 'DELIVERED' | 'FAILED' | 'READ'> = {
  sent: 'SENT',
  delivered: 'DELIVERED',
  read: 'READ',
  failed: 'FAILED',
}

function verifySignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret || !signature) return false

  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function GET(req: NextRequest) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ success: false }, { status: 403 })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const statuses = payload?.entry?.[0]?.changes?.[0]?.value?.statuses ?? []

  for (const s of statuses) {
    const status = STATUS_MAP[s.status]
    if (!status) continue
    const recipient = await prisma.notificationRecipient.findFirst({ where: { providerMessageId: s.id } })
    if (!recipient) continue
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
