import { NextResponse } from 'next/server'
import { getSiteStats } from '@/lib/site-stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getSiteStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Failed to get public site stats:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve stats' }, { status: 500 })
  }
}
