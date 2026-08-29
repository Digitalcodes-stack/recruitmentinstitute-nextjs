import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getSiteStats, updateSiteStats, DEFAULT_SITE_STATS, SiteStatItem } from '@/lib/site-stats'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const currentStats = await getSiteStats()

    // Also get live system telemetry for auto-fill suggestions
    const [totalStudents, totalCourses] = await Promise.all([
      prisma.student.count(),
      prisma.course.count(),
    ])

    const autoSuggestions = {
      professionalsTrained: `${(5000 + totalStudents).toLocaleString('en-IN')}+`,
      programsAvailable: `${totalCourses || 6}`,
      industryExpertise: '10+ Yrs',
      placementSuccess: '95%',
    }

    return NextResponse.json({
      success: true,
      stats: currentStats,
      defaultStats: DEFAULT_SITE_STATS,
      autoSuggestions,
    })
  } catch (error) {
    console.error('Admin stats GET error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { stats } = body

    if (!Array.isArray(stats) || stats.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid stats payload. Must be an array.' }, { status: 400 })
    }

    const sanitizedStats: SiteStatItem[] = stats.map((item: any, idx: number) => ({
      icon: String(item.icon || DEFAULT_SITE_STATS[idx]?.icon || 'award'),
      value: String(item.value || DEFAULT_SITE_STATS[idx]?.value || '').trim(),
      label: String(item.label || DEFAULT_SITE_STATS[idx]?.label || '').trim(),
      iconBg: String(item.iconBg || DEFAULT_SITE_STATS[idx]?.iconBg || '#EFF6FF'),
      iconColor: String(item.iconColor || DEFAULT_SITE_STATS[idx]?.iconColor || '#1D4ED8'),
    }))

    await updateSiteStats(sanitizedStats)

    return NextResponse.json({
      success: true,
      message: 'Site statistics updated successfully!',
      stats: sanitizedStats,
    })
  } catch (error) {
    console.error('Admin stats PUT error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 })
  }
}
