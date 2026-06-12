import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const { question, answer, sortOrder } = await req.json()

  const faq = await prisma.blogFaq.update({
    where: { id: Number(id) },
    data: { question, answer, sortOrder: Number(sortOrder) || 0 },
  })
  return NextResponse.json({ success: true, data: faq })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.blogFaq.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
