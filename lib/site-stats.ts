import { prisma } from '@/lib/prisma'
import { DEFAULT_SITE_STATS, type SiteStatItem } from '@/lib/site-stats-constants'

export type { SiteStatItem }
export { DEFAULT_SITE_STATS }

/**
 * Fetch dynamic site stats from site_settings table.
 * Uses direct SQL query so it never breaks regardless of Prisma Client in-memory state.
 */
export async function getSiteStats(): Promise<SiteStatItem[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ stats_json: any }>>(
      'SELECT stats_json FROM site_settings WHERE id = 1 LIMIT 1'
    )

    if (rows && rows.length > 0 && rows[0]?.stats_json) {
      let stats = rows[0].stats_json
      if (typeof stats === 'string') {
        try {
          stats = JSON.parse(stats)
        } catch {
          stats = null
        }
      }
      if (Array.isArray(stats) && stats.length > 0) {
        return stats.map((item, idx) => ({
          icon: String(item?.icon || DEFAULT_SITE_STATS[idx]?.icon || 'award'),
          value: String(item?.value || DEFAULT_SITE_STATS[idx]?.value || ''),
          label: String(item?.label || DEFAULT_SITE_STATS[idx]?.label || ''),
          iconBg: String(item?.iconBg || DEFAULT_SITE_STATS[idx]?.iconBg || '#EFF6FF'),
          iconColor: String(item?.iconColor || DEFAULT_SITE_STATS[idx]?.iconColor || '#1D4ED8'),
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic site stats:', error)
  }

  return DEFAULT_SITE_STATS
}

/**
 * Update dynamic site stats in SiteSettings table
 */
export async function updateSiteStats(stats: SiteStatItem[]) {
  const jsonStr = JSON.stringify(stats)
  return prisma.$executeRawUnsafe(
    `INSERT INTO site_settings (id, site_name, stats_json, updated_at)
     VALUES (1, 'Recruitment Institute', $1::jsonb, NOW())
     ON CONFLICT (id)
     DO UPDATE SET stats_json = $1::jsonb, updated_at = NOW()`,
    jsonStr
  )
}
