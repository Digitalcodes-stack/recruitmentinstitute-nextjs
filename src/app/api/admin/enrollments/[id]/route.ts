import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { enrollmentReviewSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: parseInt(id) },
    include: { student: { select: { id: true, name: true, email: true } }, batch: { select: { id: true, name: true } } },
  })
  if (!enrollment) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: enrollment })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const session = await getAdminSession()
  const { id } = await params
  const body = await req.json()
  const validated = enrollmentReviewSchema.safeParse(body)
  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const enrollmentId = parseInt(id)
  const current = await prisma.enrollment.findUnique({ where: { id: enrollmentId } })
  if (!current) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })

  const updated = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: validated.data.status,
      reviewNote: validated.data.reviewNote,
      reviewedAt: new Date(),
      reviewedByAdminId: session?.userId,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      batch: { select: { id: true, name: true, capacity: true, course: { select: { id: true, title: true } } } },
      reviewedByAdmin: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ success: true, data: updated })
}
