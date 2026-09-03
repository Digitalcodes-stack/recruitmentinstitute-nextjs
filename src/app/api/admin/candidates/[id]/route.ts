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

  // When candidate is approved (acceptSignin: 1), sync to Student table so they can be enrolled in batches
  if (body.acceptSignin === 1) {
    const email = candidate.email.trim().toLowerCase()
    await prisma.student.upsert({
      where: { email },
      update: {
        name: candidate.name,
        contact: candidate.mobile || candidate.phone || undefined,
        isActive: true,
      },
      create: {
        name: candidate.name,
        email,
        password: candidate.password,
        contact: candidate.mobile || candidate.phone || null,
        isActive: true,
      },
    })
  } else if (body.acceptSignin === 0) {
    const email = candidate.email.trim().toLowerCase()
    await prisma.student.updateMany({
      where: { email },
      data: { isActive: false },
    })
  }

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
