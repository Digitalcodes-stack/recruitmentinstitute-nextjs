import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { blogSchema } from '@/lib/validations'

async function requireAdmin() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }), session: null }
  }
  return { error: null, session }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  const blog = await prisma.blog.findUnique({ where: { id: parseInt(id) } })
  if (!blog) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true, data: blog })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const validated = blogSchema.partial().safeParse(body)

  if (!validated.success) {
    return NextResponse.json({ success: false, errors: validated.error.flatten().fieldErrors }, { status: 400 })
  }

  const blog = await prisma.blog.update({
    where: { id: parseInt(id) },
    data: { ...validated.data, ...(body.featuredImage && { featuredImage: body.featuredImage }) },
  })

  return NextResponse.json({ success: true, data: blog })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await requireAdmin()
  if (error) return error

  await prisma.blog.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Blog deleted' })
}
