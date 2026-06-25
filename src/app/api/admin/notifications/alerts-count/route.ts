import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const count = await prisma.notification.count({
    where: { status: { in: ['FAILED', 'PARTIALLY_FAILED'] } },
  })

  return NextResponse.json({ success: true, data: { count } })
}
