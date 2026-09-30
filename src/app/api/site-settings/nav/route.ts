import { NextResponse } from 'next/server'
import { getNavOverrides } from '@/lib/nav-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const overrides = await getNavOverrides()
    return NextResponse.json({ success: true, overrides })
  } catch (error) {
    console.error('Failed to get public nav overrides:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve navigation' }, { status: 500 })
  }
}
