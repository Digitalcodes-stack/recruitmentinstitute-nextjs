import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  title:      z.string().min(2),
  profession: z.string().optional(),
  image:      z.string().optional(),
  categoryId: z.number().int().positive(),
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

  const experts = await prisma.expert.findMany({
    include: { category: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json({ success: true, data: experts })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = schema.safeParse({ ...body, categoryId: Number(body.categoryId) })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const expert = await prisma.expert.create({ data: validated.data })
  return NextResponse.json({ success: true, data: expert }, { status: 201 })
}
