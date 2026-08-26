import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload.payment.entity
      const orderId = paymentEntity.order_id
      const paymentId = paymentEntity.id

      const payment = await prisma.feePayment.findFirst({
        where: { gatewayRef: orderId },
        include: { feeAccount: true },
      })

      if (payment && payment.status !== 'CAPTURED') {
        await prisma.feePayment.update({
          where: { id: payment.id },
          data: {
            status: 'CAPTURED',
            transactionId: paymentId,
            paidAt: new Date(),
            rawPayload: event as object,
          },
        })

        await prisma.studentFeeAccount.update({
          where: { id: payment.feeAccountId },
          data: {
            paidAmount: payment.feeAccount.finalFee,
            pendingAmount: 0,
            status: 'PAID',
          },
        })
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity
      const orderId = paymentEntity.order_id

      const payment = await prisma.feePayment.findFirst({
        where: { gatewayRef: orderId },
      })

      if (payment && payment.status === 'PENDING') {
        await prisma.feePayment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            rawPayload: event as object,
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error)
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 })
  }
}
