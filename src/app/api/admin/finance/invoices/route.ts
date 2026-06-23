import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { issueInitialInvoice } from '@/lib/finance'

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

  const invoices = await prisma.feeInvoice.findMany({
    include: {
      feeAccount: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          batch: { select: { id: true, name: true } },
        },
      },
      items: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: invoices })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const feeAccountId = Number(body.feeAccountId)
  if (!Number.isFinite(feeAccountId)) {
    return NextResponse.json({ success: false, message: 'Fee account is required' }, { status: 400 })
  }

  const invoice = await issueInitialInvoice(feeAccountId)
  if (!invoice) {
    return NextResponse.json({ success: false, message: 'Fee account not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: invoice }, { status: 201 })
}
