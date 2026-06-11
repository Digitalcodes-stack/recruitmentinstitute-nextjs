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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const faq = await prisma.faq.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  })
  if (!faq) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: faq })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = faqSchema.partial().safeParse({
    ...body,
    categoryId: body.categoryId ? Number(body.categoryId) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const faq = await prisma.faq.update({
    where: { id: parseInt(id) },
    data: validated.data,
  })
  return NextResponse.json({ success: true, data: faq })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.faq.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'FAQ deleted' })
}
