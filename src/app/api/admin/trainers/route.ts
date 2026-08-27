import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { trainerAvailabilitySlotSchema } from '@/lib/validations'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  availability: z.array(trainerAvailabilitySlotSchema).optional(),
})

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const trainers = await prisma.trainer.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true, name: true, email: true, phone: true, specialization: true,
      bio: true, image: true, isActive: true, createdAt: true,
      availability: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true } },
    },
  })
  return NextResponse.json({ success: true, data: trainers })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = createSchema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const existing = await prisma.trainer.findUnique({ where: { email: validated.data.email } })
  if (existing)
    return NextResponse.json({ success: false, errors: { email: ['A trainer with this email already exists'] } }, { status: 400 })

  const { password, availability, ...rest } = validated.data
  const trainer = await prisma.trainer.create({
    data: {
      ...rest,
      password: await hashPassword(password),
      availability: availability?.length ? { create: availability } : undefined,
    },
    select: {
      id: true, name: true, email: true, phone: true, specialization: true,
      bio: true, image: true, isActive: true, createdAt: true,
      availability: { select: { id: true, dayOfWeek: true, startTime: true, endTime: true } },
    },
  })
  return NextResponse.json({ success: true, data: trainer }, { status: 201 })
}
