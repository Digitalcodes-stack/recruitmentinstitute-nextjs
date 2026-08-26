import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { razorpayClient } from '@/lib/razorpay'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      courseId,
      batchId,
      amount,
      studentName,
      studentEmail,
      studentPhone,
      address,
    } = body

    if (!courseId || !studentName || !studentEmail || !studentPhone) {
      return NextResponse.json(
        { error: 'Missing required enrollment details (name, email, phone, course)' },
        { status: 400 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      include: { category: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Determine final amount in INR
    const finalAmount = amount ? Number(amount) : 24999
    const amountInPaise = Math.round(finalAmount * 100)

    // 1. Find or create student account
    let student = await prisma.student.findUnique({
      where: { email: studentEmail.trim().toLowerCase() },
    })

    if (!student) {
      const defaultHash = await bcrypt.hash('Student@123', 10)
      student = await prisma.student.create({
        data: {
          name: studentName.trim(),
          email: studentEmail.trim().toLowerCase(),
          contact: studentPhone.trim(),
          password: defaultHash,
          isActive: true,
        },
      })
    }

    // 2. Find or create StudentFeeAccount
    let feeAccount = await prisma.studentFeeAccount.findFirst({
      where: {
        studentId: student.id,
        courseId: course.id,
      },
    })

    if (!feeAccount) {
      feeAccount = await prisma.studentFeeAccount.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          batchId: batchId ? Number(batchId) : null,
          totalFee: finalAmount,
          finalFee: finalAmount,
          paidAmount: 0,
          pendingAmount: finalAmount,
          status: 'PENDING',
        },
      })
    }

    // 3. Create Razorpay Order
    const receiptId = `RI_${Date.now().toString().slice(-8)}`
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        courseId: String(course.id),
        courseTitle: course.title,
        batchId: batchId ? String(batchId) : '',
        studentId: String(student.id),
        studentEmail: student.email,
        feeAccountId: String(feeAccount.id),
      },
    }

    const razorpayOrder = await razorpayClient.orders.create(options)

    // 4. Record initial FeePayment in database as PENDING
    const paymentRecord = await prisma.feePayment.create({
      data: {
        feeAccountId: feeAccount.id,
        gateway: 'RAZORPAY',
        gatewayRef: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        status: 'PENDING',
        rawPayload: razorpayOrder as object,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TUJvHxa7DhM26d',
      courseTitle: course.title,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.contact || studentPhone,
      paymentRecordId: paymentRecord.id,
    })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize payment order' },
      { status: 500 }
    )
  }
}
