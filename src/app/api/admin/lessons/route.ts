import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { lessonSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const topicId = req.nextUrl.searchParams.get('topicId')
  const lessons = await prisma.lesson.findMany({
    where: topicId ? { topicId: parseInt(topicId) } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { resources: true },
  })
  return NextResponse.json({ success: true, data: lessons })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = lessonSchema.safeParse({
    ...body,
    topicId: Number(body.topicId),
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    durationSec: body.durationSec !== undefined && body.durationSec !== '' ? Number(body.durationSec) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const lesson = await prisma.lesson.create({ data: validated.data })
  return NextResponse.json({ success: true, data: lesson }, { status: 201 })
}
