import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { moduleSchema } from '@/lib/validations'

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
  const validated = moduleSchema.partial().safeParse({
    ...body,
    ...(body.courseId !== undefined && { courseId: Number(body.courseId) }),
    ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const mod = await prisma.module.update({ where: { id: parseInt(id) }, data: validated.data })
  return NextResponse.json({ success: true, data: mod })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.module.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Module deleted' })
}
