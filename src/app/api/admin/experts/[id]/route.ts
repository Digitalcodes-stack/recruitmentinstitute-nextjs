import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  title:      z.string().min(2).optional(),
  profession: z.string().optional(),
  image:      z.string().optional(),
  categoryId: z.number().int().positive().optional(),
})

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
  const expert = await prisma.expert.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  })
  if (!expert) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: expert })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = schema.safeParse({
    ...body,
    ...(body.categoryId !== undefined && { categoryId: Number(body.categoryId) }),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const expert = await prisma.expert.update({
    where: { id: parseInt(id) },
    data: validated.data,
  })
  return NextResponse.json({ success: true, data: expert })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.expert.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Expert deleted' })
}
