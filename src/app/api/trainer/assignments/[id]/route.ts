import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { assignmentSchema } from '@/lib/validations'

async function guard(assignmentId: number) {
  const session = await getUserSession()
  if (!session || session.type !== 'trainer') {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) }
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { batch: { select: { trainerId: true } } },
  })

  if (!assignment) {
    return { error: NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 }) }
  }

  if (assignment.batch.trainerId !== session.userId) {
    return { error: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }) }
  }

  return { session, assignment }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assignmentId = parseInt(id)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(assignmentId)
  if ('error' in auth) return auth.error

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      batch: {
        include: {
          course: { select: { title: true } },
          enrollments: {
            where: { status: { in: ['APPROVED', 'ACTIVE', 'ENROLLED', 'COMPLETED'] } },
            include: { student: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      submissions: {
        include: { student: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json({ success: true, data: assignment })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assignmentId = parseInt(id)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(assignmentId)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const validated = assignmentSchema.partial().safeParse({
    ...body,
    ...(body.batchId !== undefined && { batchId: Number(body.batchId) }),
  })

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const { dueAt, ...rest } = validated.data
  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...rest,
      ...(dueAt !== undefined && { dueAt: new Date(dueAt) }),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assignmentId = parseInt(id)
  if (isNaN(assignmentId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  const auth = await guard(assignmentId)
  if ('error' in auth) return auth.error

  await prisma.assignment.delete({ where: { id: assignmentId } })
  return NextResponse.json({ success: true, message: 'Assignment deleted' })
}
