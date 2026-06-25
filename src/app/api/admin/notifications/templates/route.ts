import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const createSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  channel: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP']),
  subject: z.string().optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  whatsappTemplateName: z.string().optional(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
})

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const templates = await prisma.notificationTemplate.findMany({ orderBy: { id: 'desc' } })
  return NextResponse.json({ success: true, data: templates })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = createSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const existing = await prisma.notificationTemplate.findUnique({ where: { key: validated.data.key } })
  if (existing)
    return NextResponse.json({ success: false, errors: { key: ['A template with this key already exists'] } }, { status: 400 })

  const template = await prisma.notificationTemplate.create({ data: validated.data })
  return NextResponse.json({ success: true, data: template }, { status: 201 })
}
