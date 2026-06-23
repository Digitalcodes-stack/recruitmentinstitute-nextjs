import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { assignmentSchema } from '@/lib/validations'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const batchId = req.nextUrl.searchParams.get('batchId')
  const assignments = await prisma.assignment.findMany({
    where: batchId ? { batchId: parseInt(batchId) } : undefined,
    include: {
      batch: { select: { id: true, name: true, course: { select: { title: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: assignments })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const validated = assignmentSchema.safeParse({
    ...body,
    batchId: Number(body.batchId),
  })
  if (!validated.success)
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })

  const { dueAt, ...rest } = validated.data
  const assignment = await prisma.assignment.create({
    data: { ...rest, dueAt: new Date(dueAt) },
  })
  return NextResponse.json({ success: true, data: assignment }, { status: 201 })
}
