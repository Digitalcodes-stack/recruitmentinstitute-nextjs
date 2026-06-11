import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9_]+$/, 'Slug must be lowercase letters, numbers, underscores'),
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

  const categories = await prisma.courseCategory.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ success: true, data: categories })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = schema.safeParse(body)
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  try {
    const category = await prisma.courseCategory.create({ data: validated.data })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 409 })
  }
}
