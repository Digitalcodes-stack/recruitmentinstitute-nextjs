import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpayPaymentSignature } from '@/lib/razorpay'
import { sendEmail } from '@/lib/email'

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
        paidAmount: feeAccount.finalFee,
        pendingAmount: 0,
        status: 'PAID',
      },
    })

    // 5. Create or activate Course Enrollment
    const targetBatchId = batchId ? Number(batchId) : feeAccount.batchId || null

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        courseId: course.id,
      },
    })

    if (existingEnrollment) {
      await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          batchId: targetBatchId,
          status: 'ACTIVE',
        },
      })
    } else {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          batchId: targetBatchId,
          status: 'ACTIVE',
        },
      })
    }

    // 6. Generate Paid Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    await prisma.feeInvoice.create({
      data: {
        feeAccountId: feeAccount.id,
        invoiceNumber,
        subtotal: feeAccount.finalFee,
        totalAmount: feeAccount.finalFee,
        paidAmount: feeAccount.finalFee,
        status: 'PAID',
        issueDate: new Date(),
        dueDate: new Date(),
      },
    })

    // 7. Send confirmation email
    try {
      if (student.email) {
        await sendEmail({
          to: student.email,
          subject: `Enrollment Confirmed: ${course.title} - Recruitment Institute`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0A1628;">
              <h2 style="color: #E63946;">Welcome to Recruitment Institute!</h2>
              <p>Hi <strong>${student.name}</strong>,</p>
              <p>Your payment of <strong>₹${Number(feeAccount.finalFee).toLocaleString('en-IN')}</strong> has been successfully processed via Razorpay.</p>
              <p><strong>Course Enrolled:</strong> ${course.title}</p>
              <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <br/>
              <p>You can now log in to your Student Portal to access your learning schedule, study materials, and live batches:</p>
              <a href="https://recruitmentinstitute.in/student-login" style="background-color: #E63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Student Dashboard</a>
              <br/><br/>
              <p>If you have any questions, reply to this email or message our support team on WhatsApp at +91 7385204165.</p>
              <p>Best regards,<br/><strong>Recruitment Institute Admissions Team</strong></p>
            </div>
          `,
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
