import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  addedBy: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.knowledgeItem.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ success: true, data: items })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const item = await prisma.knowledgeItem.create({ data: validated.data })
  return NextResponse.json({ success: true, data: item }, { status: 201 })
}
