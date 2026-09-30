import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getNavOverrides, updateNavOverrides, DEFAULT_NAV_OVERRIDES, NavOverride } from '@/lib/nav-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const overrides = await getNavOverrides()
    return NextResponse.json({ success: true, overrides, defaults: DEFAULT_NAV_OVERRIDES })
  } catch (error) {
    console.error('Admin nav GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch navigation settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { overrides } = body

    if (!Array.isArray(overrides) || overrides.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid navigation payload. Must be an array.' }, { status: 400 })
    }

    const validIds = new Set(DEFAULT_NAV_OVERRIDES.map((d) => d.id))
    const sanitized: NavOverride[] = overrides
      .filter((item: any) => validIds.has(item?.id))
      .map((item: any, idx: number) => {
        const def = DEFAULT_NAV_OVERRIDES.find((d) => d.id === item.id)!
        return {
          id: def.id,
          label: String(item.label || def.label).trim() || def.label,
          visible: item.visible !== false,
          order: Number.isFinite(Number(item.order)) ? Number(item.order) : idx,
        }
      })

    // Every default item must be present — never let admin accidentally drop
    // a top-level nav entry from the payload entirely.
    if (sanitized.length !== DEFAULT_NAV_OVERRIDES.length) {
      return NextResponse.json({ success: false, message: 'All navigation items must be included in the update' }, { status: 400 })
    }

    await updateNavOverrides(sanitized)

    return NextResponse.json({
      success: true,
      message: 'Navigation settings updated successfully!',
      overrides: sanitized,
    })
  } catch (error) {
    console.error('Admin nav PUT error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update navigation settings' }, { status: 500 })
  }
}
