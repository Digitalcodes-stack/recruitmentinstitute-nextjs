import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clients = await prisma.clientLogo.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      logo: true,
      website: true,
    },
  })
  return NextResponse.json({ success: true, data: clients })
}
