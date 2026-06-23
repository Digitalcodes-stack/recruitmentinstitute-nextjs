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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = lessonSchema.partial().safeParse({
    ...body,
    ...(body.topicId !== undefined && { topicId: Number(body.topicId) }),
    ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    ...(body.durationSec !== undefined && { durationSec: body.durationSec === '' ? undefined : Number(body.durationSec) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const lesson = await prisma.lesson.update({ where: { id: parseInt(id) }, data: validated.data })
  return NextResponse.json({ success: true, data: lesson })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.lesson.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Lesson deleted' })
}
