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
  const body = await req.json()
  const { name, logo, website, isActive, sortOrder } = body

  const client = await prisma.clientLogo.update({
    where: { id: Number(id) },
    data: {
      name,
      logo,
      website: website || null,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    },
  })
  return NextResponse.json({ success: true, data: client })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.clientLogo.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
