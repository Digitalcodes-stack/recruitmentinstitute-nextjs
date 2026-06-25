import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

function toMoney(value: Prisma.Decimal | number | string | null | undefined) {
  return Number(value ?? 0)
}

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2))
}

function calcGst(base: number, gstRate?: Prisma.Decimal | null) {
  const rate = toMoney(gstRate)
  if (!rate) return { totalTax: 0, cgst: 0, sgst: 0, igst: 0 }
  const totalTax = +(base * (rate / 100)).toFixed(2)
  const split = +(totalTax / 2).toFixed(2)
  return { totalTax, cgst: split, sgst: split, igst: 0 }
}

export async function createFeeAccountForEnrollment(enrollmentId: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: true,
      batch: { include: { course: true } },
    },
  })

  if (!enrollment) return null

  const feePlan = await prisma.courseFee.findFirst({
    where: {
      courseName: enrollment.batch.course.title,
      categoryId: enrollment.batch.course.categoryId,
    },
  })

  const gross = toMoney(feePlan?.fees ?? feePlan?.finalTotal ?? 0)
  const discount = toMoney(feePlan?.discount ?? 0)
  const net = Math.max(gross - discount, 0)
  const gstRate = process.env.DEFAULT_GST_RATE ? new Prisma.Decimal(process.env.DEFAULT_GST_RATE) : null
  const gst = calcGst(net, gstRate)
  const payable = +(net + gst.totalTax).toFixed(2)

  const existing = await prisma.studentFeeAccount.findFirst({
    where: {
      studentId: enrollment.studentId,
      courseId: enrollment.batch.courseId,
      batchId: enrollment.batchId,
    },
  })

  const accountData = {
    planName: feePlan?.courseName ?? enrollment.batch.course.title,
    grossAmount: decimal(gross),
    discountAmount: decimal(discount),
    gstAmount: decimal(gst.totalTax),
    netPayable: decimal(payable),
    outstandingAmount: decimal(payable),
    gstEnabled: Boolean(gstRate),
    gstRate: gstRate ?? null,
    courseFeeId: feePlan?.id ?? null,
    enrollmentId: enrollment.id,
    dueDate: enrollment.batch.startDate,
  }

  const account = existing
    ? await prisma.studentFeeAccount.update({
        where: { id: existing.id },
        data: accountData,
      })
    : await prisma.studentFeeAccount.create({
        data: {
          studentId: enrollment.studentId,
          batchId: enrollment.batchId,
          courseId: enrollment.batch.courseId,
          ...accountData,
        },
      })

  return account
}

export async function issueInitialInvoice(feeAccountId: number) {
  const account = await prisma.studentFeeAccount.findUnique({
    where: { id: feeAccountId },
    include: { student: true, batch: { include: { course: true } }, courseFee: true },
  })
  if (!account) return null

  const existing = await prisma.feeInvoice.findFirst({ where: { feeAccountId }, orderBy: { invoiceDate: 'desc' } })
  if (existing) return existing

  const invoiceNo = `INV-${new Date().getFullYear()}-${String(account.id).padStart(5, '0')}`
  const total = toMoney(account.netPayable)
  const gst = toMoney(account.gstAmount)

  return prisma.feeInvoice.create({
    data: {
      feeAccountId,
      invoiceNo,
      invoiceDate: new Date(),
      dueDate: account.dueDate ?? account.batch?.startDate ?? undefined,
      subtotal: account.grossAmount,
      discountAmount: account.discountAmount,
      taxableAmount: decimal(Math.max(toMoney(account.grossAmount) - toMoney(account.discountAmount), 0)),
      cgstAmount: decimal(gst / 2),
      sgstAmount: decimal(gst / 2),
      igstAmount: decimal(0),
      gstRate: account.gstRate,
      totalAmount: account.netPayable,
      paidAmount: decimal(0),
      balanceAmount: decimal(total),
      status: 'ISSUED',
      notes: `Auto-generated for ${account.student.name} - ${account.planName}`,
      items: {
        create: [
          {
            description: account.planName,
            quantity: 1,
            unitPrice: account.grossAmount,
            taxableValue: decimal(Math.max(toMoney(account.grossAmount) - toMoney(account.discountAmount), 0)),
            gstRate: account.gstRate,
            cgstAmount: decimal(gst / 2),
            sgstAmount: decimal(gst / 2),
            igstAmount: decimal(0),
            total: account.netPayable,
          },
        ],
      },
    },
    include: { items: true, feeAccount: true },
  })
}

export async function getFinanceSnapshot() {
  const [
    accounts,
    invoices,
    payments,
    refunds,
    overdueAccounts,
  ] = await Promise.all([
    prisma.studentFeeAccount.findMany({ include: { student: true, batch: true, course: true } }),
    prisma.feeInvoice.findMany(),
    prisma.feePayment.findMany(),
    prisma.feeRefund.findMany(),
    prisma.studentFeeAccount.findMany({ where: { status: 'OVERDUE' } }),
  ])

  const outstanding = accounts.reduce((sum, a) => sum + toMoney(a.outstandingAmount), 0)
  const collected = payments
    .filter((p) => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + toMoney(p.amount), 0)
  const refunded = refunds
    .filter((r) => r.status === 'PROCESSED')
    .reduce((sum, r) => sum + toMoney(r.amount), 0)

  return {
    accounts: accounts.length,
    invoices: invoices.length,
    payments: payments.length,
    refunds: refunds.length,
    overdueAccounts: overdueAccounts.length,
    outstanding,
    collected,
    refunded,
  }
}
