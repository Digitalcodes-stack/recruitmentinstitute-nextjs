import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const data = await prisma.membership.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const { id, isActive } = await req.json()
  const membership = await prisma.membership.update({ where: { id: Number(id) }, data: { isActive: Boolean(isActive) } })
  return NextResponse.json({ success: true, data: membership })
}
