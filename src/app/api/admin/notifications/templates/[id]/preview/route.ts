import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { renderTemplate } from '@/lib/notifications/render'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const template = await prisma.notificationTemplate.findUnique({ where: { id: Number(id) } })
  if (!template) return NextResponse.json({ success: false, message: 'Template not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const variables = (body.variables ?? {}) as Record<string, unknown>

  const bodySource = template.channel === 'EMAIL' ? template.bodyHtml ?? template.bodyText ?? '' : template.bodyText ?? ''

  return NextResponse.json({
    success: true,
    data: {
      subject: template.subject ? renderTemplate(template.subject, variables) : null,
      body: renderTemplate(bodySource, variables),
    },
  })
}
