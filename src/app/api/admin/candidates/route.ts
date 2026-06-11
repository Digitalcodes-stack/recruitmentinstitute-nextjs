import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // 'pending' | 'approved' | 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where = status === 'pending' ? { acceptSignin: 0 }
    : status === 'approved' ? { acceptSignin: 1 }
    : {}

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true, name: true, email: true, mobile: true, courseSelect: true,
        acceptSignin: true, createdAt: true, city: true, gender: true,
      },
    }),
    prisma.candidate.count({ where }),
  ])

  return NextResponse.json({ success: true, data: candidates, total })
}
