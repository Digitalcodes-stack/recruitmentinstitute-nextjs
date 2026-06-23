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

  const refunds = await prisma.feeRefund.findMany({
    include: {
      feeAccount: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
          batch: { select: { id: true, name: true } },
        },
      },
      invoice: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: refunds })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const feeAccountId = Number(body.feeAccountId)
  const amount = Number(body.amount)
  if (!Number.isFinite(feeAccountId) || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: false, message: 'Fee account and amount are required' }, { status: 400 })
  }

  const refund = await prisma.$transaction(async (tx) => {
    const record = await tx.feeRefund.create({
      data: {
        feeAccountId,
        invoiceId: body.invoiceId ? Number(body.invoiceId) : null,
        paymentId: body.paymentId ? Number(body.paymentId) : null,
        gateway: normalizeGateway(body.gateway),
        gatewayRefundRef: body.gatewayRefundRef || null,
        amount: toDecimal(amount),
        reason: body.reason || null,
        status: body.status || 'PROCESSED',
        processedAt: body.processedAt ? new Date(body.processedAt) : new Date(),
        rawPayload: body.rawPayload ?? undefined,
      },
    })

    const account = await tx.studentFeeAccount.findUnique({ where: { id: feeAccountId } })
    if (account) {
      const nextRefunded = Number(account.refundedAmount) + amount
      const nextOutstanding = Math.max(Number(account.netPayable) - Number(account.paidAmount) + nextRefunded, 0)
      await tx.studentFeeAccount.update({
        where: { id: feeAccountId },
        data: {
          refundedAmount: toDecimal(nextRefunded),
          outstandingAmount: toDecimal(nextOutstanding),
          status: nextOutstanding <= 0 ? 'REFUNDED' : 'PARTIALLY_PAID',
        },
      })
    }

    if (body.invoiceId) {
      const invoice = await tx.feeInvoice.findUnique({ where: { id: Number(body.invoiceId) } })
      if (invoice) {
        const nextBalance = Math.max(Number(invoice.balanceAmount) + amount, 0)
        await tx.feeInvoice.update({
          where: { id: invoice.id },
          data: {
            balanceAmount: toDecimal(nextBalance),
            status: nextBalance <= 0 ? 'REFUNDED' : 'PARTIALLY_PAID',
          },
        })
      }
    }

    if (body.paymentId) {
      await tx.feePayment.update({
        where: { id: Number(body.paymentId) },
        data: { status: 'PARTIALLY_REFUNDED' },
      })
    }

    return record
  })

  return NextResponse.json({ success: true, data: refund }, { status: 201 })
}

function normalizeGateway(value: unknown) {
  const candidate = String(value || 'RAZORPAY').toUpperCase()
  if (candidate === 'STRIPE' || candidate === 'CASH' || candidate === 'BANK_TRANSFER') return candidate
  return 'RAZORPAY'
}
