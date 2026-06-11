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
  const { isApproved } = await req.json()

  const answer = await prisma.answer.update({
    where: { id: parseInt(id) },
    data: { isApproved: Boolean(isApproved) },
  })
  return NextResponse.json({ success: true, data: answer })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.answer.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Answer deleted' })
}
