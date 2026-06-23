import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { topicSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const chapterId = req.nextUrl.searchParams.get('chapterId')
  const topics = await prisma.topic.findMany({
    where: chapterId ? { chapterId: parseInt(chapterId) } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { lessons: true } } },
  })
  return NextResponse.json({ success: true, data: topics })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = topicSchema.safeParse({
    ...body,
    chapterId: Number(body.chapterId),
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const topic = await prisma.topic.create({ data: validated.data })
  return NextResponse.json({ success: true, data: topic }, { status: 201 })
}
