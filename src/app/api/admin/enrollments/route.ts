import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { enrollmentSchema } from '@/lib/validations'
import { createFeeAccountForEnrollment, issueInitialInvoice } from '@/lib/finance'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const batchId = req.nextUrl.searchParams.get('batchId')
  const enrollments = await prisma.enrollment.findMany({
    where: batchId ? { batchId: parseInt(batchId) } : undefined,
    include: {
      student: { select: { id: true, name: true, email: true } },
      batch: { select: { id: true, name: true, capacity: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: enrollments })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = enrollmentSchema.safeParse({
    studentId: Number(body.studentId),
    batchId: Number(body.batchId),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { studentId, batchId } = validated.data

  const [batch, existing, currentCount] = await Promise.all([
    prisma.batch.findUnique({ where: { id: batchId } }),
    prisma.enrollment.findUnique({ where: { studentId_batchId: { studentId, batchId } } }),
    prisma.enrollment.count({ where: { batchId, status: 'ENROLLED' } }),
  ])

  if (!batch)
    return NextResponse.json({ success: false, message: 'Batch not found' }, { status: 404 })
  if (existing)
    return NextResponse.json({ success: false, message: 'Student is already enrolled in this batch' }, { status: 400 })
  if (currentCount >= batch.capacity)
    return NextResponse.json({ success: false, message: 'Batch is at full capacity' }, { status: 400 })

  const enrollment = await prisma.enrollment.create({
    data: { studentId, batchId },
    include: { student: { select: { id: true, name: true, email: true } } },
  })

  const feeAccount = await createFeeAccountForEnrollment(enrollment.id)
  if (feeAccount) {
    await issueInitialInvoice(feeAccount.id)
  }

  return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
}
