import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const blogId = searchParams.get('blogId')
  const categoryId = searchParams.get('categoryId')

  if (blogId) {
    const blogFaqs = await prisma.blogFaq.findMany({
      where: { blogId: Number(blogId) },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: blogFaqs })
  }

  const faqs = await prisma.faq.findMany({
    where: categoryId ? { categoryId: Number(categoryId) } : {},
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ success: true, data: faqs })
}
