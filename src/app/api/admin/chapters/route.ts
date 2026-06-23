import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { chapterSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const moduleId = req.nextUrl.searchParams.get('moduleId')
  const chapters = await prisma.chapter.findMany({
    where: moduleId ? { moduleId: parseInt(moduleId) } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { topics: true } } },
  })
  return NextResponse.json({ success: true, data: chapters })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = chapterSchema.safeParse({
    ...body,
    moduleId: Number(body.moduleId),
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const chapter = await prisma.chapter.create({ data: validated.data })
  return NextResponse.json({ success: true, data: chapter }, { status: 201 })
}
