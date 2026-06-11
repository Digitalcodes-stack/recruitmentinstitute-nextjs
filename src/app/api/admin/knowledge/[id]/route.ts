import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

const schema = z.object({
  question: z.string().min(5).optional(),
  answer: z.string().min(5).optional(),
  addedBy: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err
  const { id } = await params
  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success) return NextResponse.json({ success: false }, { status: 400 })

  const item = await prisma.knowledgeItem.update({
    where: { id: parseInt(id) },
    data: validated.data,
  })
  return NextResponse.json({ success: true, data: item })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err
  const { id } = await params
  await prisma.knowledgeItem.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Deleted' })
}
