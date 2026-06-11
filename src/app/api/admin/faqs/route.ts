import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { faqSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const faqs = await prisma.faq.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: faqs })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = faqSchema.safeParse({
    ...body,
    categoryId: body.categoryId ? Number(body.categoryId) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const faq = await prisma.faq.create({ data: validated.data })
  return NextResponse.json({ success: true, data: faq }, { status: 201 })
}
