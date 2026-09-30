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

  const categoryId = req.nextUrl.searchParams.get('categoryId')
  const tiers = await prisma.coursePricingTier.findMany({
    where: categoryId ? { categoryId: Number(categoryId) } : undefined,
    include: { category: true },
    orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json({ success: true, data: tiers })
}

export async function POST(req: NextRequest) {
  const err = await guard()
  if (err) return err

  const body = await req.json()
  const { categoryId, name, priceRange, duration, badge, bestFor, isHighlighted, sortOrder } = body

  if (!categoryId) return NextResponse.json({ success: false, message: 'Category is required' }, { status: 400 })
  if (!name?.trim()) return NextResponse.json({ success: false, message: 'Plan name is required' }, { status: 400 })
  if (!priceRange?.trim()) return NextResponse.json({ success: false, message: 'Price is required' }, { status: 400 })

  const tier = await prisma.coursePricingTier.create({
    data: {
      categoryId: Number(categoryId),
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
  return NextResponse.json({ success: true, data: tier }, { status: 201 })
}
