import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'
import { sendNotificationNow } from '@/lib/jobs/notifications'

const createSchema = z.object({
  templateId: z.number().int().optional(),
  title: z.string().min(2),
  channels: z.array(z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'])).min(1),
  audienceType: z.enum(['SINGLE', 'SEGMENT', 'ALL_STUDENTS', 'ALL_CANDIDATES', 'CUSTOM_LIST']),
  audienceFilter: z.record(z.string(), z.unknown()).optional(),
  variables: z.record(z.string(), z.unknown()).default({}),
  scheduledAt: z.string().datetime().optional(),
})

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return { err: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }), session: null }
  return { err: null, session }
}

export async function GET(req: NextRequest) {
  const { err } = await guard()
  if (err) return err

  const status = req.nextUrl.searchParams.get('status')
  const notifications = await prisma.notification.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { id: 'desc' },
    include: { template: { select: { name: true, channel: true } }, _count: { select: { recipients: true } } },
  })
  return NextResponse.json({ success: true, data: notifications })
}

export async function POST(req: NextRequest) {
  const { err, session } = await guard()
  if (err) return err

  const body = await req.json()
  const validated = createSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { scheduledAt, templateId, title, channels, audienceType, audienceFilter, variables } = validated.data
  const notification = await prisma.notification.create({
    data: {
      templateId,
      title,
      channels,
      audienceType,
      audienceFilter: (audienceFilter ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      variables: variables as Prisma.InputJsonValue,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      createdBy: session!.userId,
    },
  })

  if (!scheduledAt) {
    await sendNotificationNow(notification.id)
  }

  return NextResponse.json({ success: true, data: notification }, { status: 201 })
}
