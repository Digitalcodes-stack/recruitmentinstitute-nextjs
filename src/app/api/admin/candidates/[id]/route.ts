import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const candidate = await prisma.candidate.update({
    where: { id: parseInt(id) },
    data: { acceptSignin: body.acceptSignin },
  })

  return NextResponse.json({ success: true, data: candidate })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.candidate.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Candidate deleted' })
}
