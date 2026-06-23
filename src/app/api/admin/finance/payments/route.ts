import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const toDecimal = (v: unknown) => new Prisma.Decimal(Number(v || 0).toFixed(2))

export async function GET() {
  const err = await guard()
  if (err) return err

  const payments = await prisma.feePayment.findMany({
    include: {
      feeAccount: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          batch: { select: { id: true, name: true } },
        },
      },
      invoice: true,
      refunds: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: payments })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const feeAccountId = Number(body.feeAccountId)
  const amount = Number(body.amount)
  const gateway = normalizeGateway(body.gateway)

  if (!Number.isFinite(feeAccountId) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: false, message: 'Fee account and amount are required' }, { status: 400 })
  }

  const payment = await prisma.$transaction(async (tx) => {
    const record = await tx.feePayment.create({
      data: {
        feeAccountId,
        invoiceId: body.invoiceId ? Number(body.invoiceId) : null,
        gateway,
        gatewayRef: body.gatewayRef || null,
        transactionId: body.transactionId || null,
        amount: toDecimal(amount),
        currency: body.currency || 'INR',
        paymentMethod: body.paymentMethod || null,
        status: body.status || 'CAPTURED',
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
        rawPayload: body.rawPayload ?? undefined,
      },
    })

    const account = await tx.studentFeeAccount.findUnique({ where: { id: feeAccountId } })
    if (account) {
      const nextPaid = Number(account.paidAmount) + amount
      const nextRefunded = Number(account.refundedAmount)
      const nextOutstanding = Math.max(Number(account.netPayable) - nextPaid + nextRefunded, 0)
      await tx.studentFeeAccount.update({
        where: { id: feeAccountId },
        data: {
          paidAmount: toDecimal(nextPaid),
          outstandingAmount: toDecimal(nextOutstanding),
          status: nextOutstanding <= 0 ? 'PAID' : nextPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING',
        },
      })
    }

    if (body.invoiceId) {
      const invoice = await tx.feeInvoice.findUnique({ where: { id: Number(body.invoiceId) } })
      if (invoice) {
        const nextPaid = Number(invoice.paidAmount) + amount
        const nextBalance = Math.max(Number(invoice.totalAmount) - nextPaid, 0)
        await tx.feeInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: toDecimal(nextPaid),
            balanceAmount: toDecimal(nextBalance),
            status: nextBalance <= 0 ? 'PAID' : nextPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED',
          },
        })
      }
    }

    return record
  })

  return NextResponse.json({ success: true, data: payment }, { status: 201 })
}

function normalizeGateway(value: unknown) {
  const candidate = String(value || 'RAZORPAY').toUpperCase()
  if (candidate === 'STRIPE' || candidate === 'CASH' || candidate === 'BANK_TRANSFER') return candidate
  return 'RAZORPAY'
}
