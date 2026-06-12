import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const { searchParams } = new URL(req.url)
  const blogId = searchParams.get('blogId')
  if (!blogId)
    return NextResponse.json({ success: false, message: 'blogId required' }, { status: 400 })

  const faqs = await prisma.blogFaq.findMany({
    where: { blogId: Number(blogId) },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ success: true, data: faqs })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const { blogId, question, answer, sortOrder } = body

  if (!blogId || !question || !answer)
    return NextResponse.json({ success: false, message: 'blogId, question, and answer are required' }, { status: 400 })

  const faq = await prisma.blogFaq.create({
    data: {
      blogId: Number(blogId),
      question,
      answer,
      sortOrder: Number(sortOrder) || 0,
    },
  })
  return NextResponse.json({ success: true, data: faq }, { status: 201 })
}
