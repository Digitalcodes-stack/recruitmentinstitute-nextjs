import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const fees = await prisma.courseFee.findMany({
    include: { category: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json({ success: true, data: fees })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const { courseName, categoryId, fees, discount, subtotal, feeTotal, finalTotal, couponCode } = body

  if (!courseName?.trim())
    return NextResponse.json({ success: false, message: 'Course name is required' }, { status: 400 })
  if (!categoryId)
    return NextResponse.json({ success: false, message: 'Category is required' }, { status: 400 })

  const toDecimal = (v: unknown) => (v !== '' && v != null ? Number(v) : null)

  const fee = await prisma.courseFee.create({
    data: {
      courseName: courseName.trim(),
      categoryId: Number(categoryId),
      fees: toDecimal(fees),
      discount: toDecimal(discount),
      subtotal: toDecimal(subtotal),
      feeTotal: toDecimal(feeTotal),
      finalTotal: toDecimal(finalTotal),
      couponCode: couponCode?.trim() || null,
    },
    include: { category: true },
  })
  return NextResponse.json({ success: true, data: fee }, { status: 201 })
}
