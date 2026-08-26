import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay'
import { sendPaymentConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      batchId,
      studentEmail,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment signature verification parameters' },
        { status: 400 }
      )
    }

    // 1. Verify cryptographic signature
    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Invalid transaction signature.' },
        { status: 400 }
      )
    }

    // 2. Find the pending payment record
    const payment = await prisma.feePayment.findFirst({
      where: { gatewayRef: razorpay_order_id },
      include: {
        feeAccount: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment order record not found in system' },
        { status: 404 }
      )
    }

    const { feeAccount } = payment
    const student = feeAccount.student
    const course = feeAccount.course

    // 3. Mark payment as CAPTURED
    await prisma.feePayment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        transactionId: razorpay_payment_id,
        paidAt: new Date(),
        paymentMethod: 'ONLINE_RAZORPAY',
      },
    })

    // 4. Mark FeeAccount as PAID
    await prisma.studentFeeAccount.update({
      where: { id: feeAccount.id },
      data: {
        paidAmount: feeAccount.netPayable,
        outstandingAmount: 0,
        status: 'PAID',
      },
    })

    // 5. Create or activate Course Batch Enrollment
    let targetBatchId = batchId ? Number(batchId) : feeAccount.batchId || null

    if (!targetBatchId) {
      const activeBatch = await prisma.batch.findFirst({
        where: { courseId: course.id, status: { in: ['UPCOMING', 'ACTIVE'] } },
        orderBy: { startDate: 'asc' },
      })
      if (activeBatch) {
        targetBatchId = activeBatch.id
      }
    }

    if (targetBatchId) {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          batchId: targetBatchId,
        },
      })

      if (existingEnrollment) {
        await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
        })
      } else {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            batchId: targetBatchId,
            status: 'ACTIVE',
            enrolledAt: new Date(),
          },
        })
      }
    }

    // 6. Generate Paid Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    await prisma.feeInvoice.create({
      data: {
        feeAccountId: feeAccount.id,
        invoiceNo: invoiceNumber,
        invoiceDate: new Date(),
        subtotal: feeAccount.netPayable,
        taxableAmount: feeAccount.netPayable,
        totalAmount: feeAccount.netPayable,
        paidAmount: feeAccount.netPayable,
        balanceAmount: 0,
        status: 'PAID',
      },
    })

    // 7. Send confirmation email
    try {
      if (student.email) {
        await sendPaymentConfirmationEmail({
          studentEmail: student.email,
          studentName: student.name,
          courseTitle: course.title,
          amount: Number(feeAccount.netPayable),
          transactionId: razorpay_payment_id,
          invoiceNumber,
        })
      }
    } catch (emailErr) {
      console.warn('Failed to send confirmation email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and enrollment activated successfully',
      studentId: student.id,
      courseId: course.id,
      invoiceNumber,
      transactionId: razorpay_payment_id,
    })
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      { error: error?.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
