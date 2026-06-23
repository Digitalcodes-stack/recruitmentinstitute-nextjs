import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const modules = await prisma.module.findMany({
    where: { courseId: parseInt(id) },
    orderBy: { sortOrder: 'asc' },
    include: {
      chapters: {
        orderBy: { sortOrder: 'asc' },
        include: {
          topics: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
                include: { resources: true },
              },
            },
          },
        },
      },
    },
  })

  return NextResponse.json({ success: true, data: modules })
}
