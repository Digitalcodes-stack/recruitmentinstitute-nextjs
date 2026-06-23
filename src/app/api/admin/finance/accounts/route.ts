import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { createFeeAccountForEnrollment } from '@/lib/finance'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const accounts = await prisma.studentFeeAccount.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
      batch: { select: { id: true, name: true } },
      invoices: { select: { id: true, invoiceNo: true, status: true, totalAmount: true, balanceAmount: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: accounts })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const enrollmentId = Number(body.enrollmentId)
  if (!Number.isFinite(enrollmentId)) {
    return NextResponse.json({ success: false, message: 'Enrollment is required' }, { status: 400 })
  }

  const account = await createFeeAccountForEnrollment(enrollmentId)
  if (!account) {
    return NextResponse.json({ success: false, message: 'Enrollment not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: account }, { status: 201 })
}
