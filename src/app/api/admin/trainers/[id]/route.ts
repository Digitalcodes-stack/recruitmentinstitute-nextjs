import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, hashPassword } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
})

const trainerSelect = {
  id: true, name: true, email: true, phone: true, specialization: true,
  bio: true, image: true, isActive: true, createdAt: true,
} as const

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
  const trainer = await prisma.trainer.findUnique({ where: { id: parseInt(id) }, select: trainerSelect })
  if (!trainer) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: trainer })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const validated = updateSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { password, ...rest } = validated.data
  const data = password ? { ...rest, password: await hashPassword(password) } : rest

  const trainer = await prisma.trainer.update({
    where: { id: parseInt(id) },
    data,
    select: trainerSelect,
  })
  return NextResponse.json({ success: true, data: trainer })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.trainer.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Trainer deleted' })
}
