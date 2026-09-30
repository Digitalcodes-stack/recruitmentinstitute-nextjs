import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const tier = await prisma.coursePricingTier.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  })
  if (!tier) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: tier })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  const body = await req.json()
  const { categoryId, name, priceRange, duration, badge, bestFor, isHighlighted, sortOrder } = body

  if (!name?.trim()) return NextResponse.json({ success: false, message: 'Plan name is required' }, { status: 400 })
  if (!priceRange?.trim()) return NextResponse.json({ success: false, message: 'Price is required' }, { status: 400 })

  const tier = await prisma.coursePricingTier.update({
    where: { id: parseInt(id) },
    data: {
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      name: name.trim(),
      priceRange: priceRange.trim(),
      duration: duration?.trim() || null,
      badge: badge?.trim() || null,
      bestFor: bestFor?.trim() || null,
      isHighlighted: !!isHighlighted,
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
    },
    include: { category: true },
  })
  return NextResponse.json({ success: true, data: tier })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await guard()
  if (err) return err

  const { id } = await params
  await prisma.coursePricingTier.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true, message: 'Pricing tier deleted' })
}
