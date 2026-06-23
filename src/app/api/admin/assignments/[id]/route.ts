import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { assignmentSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const assignment = await prisma.assignment.findUnique({
    where: { id: parseInt(id) },
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      submissions: {
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { submittedAt: 'desc' },
      },
    },
  })
  if (!assignment) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: assignment })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = assignmentSchema.partial().safeParse({
    ...body,
    ...(body.batchId !== undefined && { batchId: Number(body.batchId) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { dueAt, ...rest } = validated.data
  const assignment = await prisma.assignment.update({
    where: { id: parseInt(id) },
    data: { ...rest, ...(dueAt !== undefined && { dueAt: new Date(dueAt) }) },
  })
  return NextResponse.json({ success: true, data: assignment })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.assignment.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Assignment deleted' })
}
