import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const clients = await prisma.clientLogo.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ success: true, data: clients })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const { name, logo, website, isActive, sortOrder } = body

  if (!name || !logo)
    return NextResponse.json({ success: false, message: 'name and logo are required' }, { status: 400 })

  const client = await prisma.clientLogo.create({
    data: {
      name,
      logo,
      website: website || null,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    },
  })
  return NextResponse.json({ success: true, data: client }, { status: 201 })
}
