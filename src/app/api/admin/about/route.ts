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

  const sections = await prisma.aboutSection.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json({ success: true, data: sections })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const { title, subtitle, description, image } = body

  if (!title?.trim())
    return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 })

  const section = await prisma.aboutSection.create({
    data: {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      description: description?.trim() || null,
      image: image?.trim() || null,
    },
  })
  return NextResponse.json({ success: true, data: section }, { status: 201 })
}
