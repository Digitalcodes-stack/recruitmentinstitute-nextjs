import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { chapterSchema } from '@/lib/validations'

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
  const validated = chapterSchema.partial().safeParse({
    ...body,
    ...(body.moduleId !== undefined && { moduleId: Number(body.moduleId) }),
    ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const chapter = await prisma.chapter.update({ where: { id: parseInt(id) }, data: validated.data })
  return NextResponse.json({ success: true, data: chapter })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.chapter.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Chapter deleted' })
}
