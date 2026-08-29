import { prisma } from '@/lib/prisma'
import { DEFAULT_SITE_STATS, type SiteStatItem } from '@/lib/site-stats-constants'

export type { SiteStatItem }
export { DEFAULT_SITE_STATS }

/**
 * Fetch dynamic site stats from SiteSettings (managed by Admin),
 * falling back to standardized defaults if not configured yet.
 */
export async function getSiteStats(): Promise<SiteStatItem[]> {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { id: 1 },
      select: { statsJson: true },
    })

    if (settings?.statsJson && Array.isArray(settings.statsJson) && settings.statsJson.length > 0) {
      const parsed = settings.statsJson as unknown as SiteStatItem[]
      return parsed.map((item, idx) => ({
        icon: item.icon || DEFAULT_SITE_STATS[idx]?.icon || 'award',
        value: item.value || DEFAULT_SITE_STATS[idx]?.value || '',
        label: item.label || DEFAULT_SITE_STATS[idx]?.label || '',
        iconBg: item.iconBg || DEFAULT_SITE_STATS[idx]?.iconBg || '#EFF6FF',
        iconColor: item.iconColor || DEFAULT_SITE_STATS[idx]?.iconColor || '#1D4ED8',
      }))
    }
  } catch (error) {
    console.error('Error fetching dynamic site stats:', error)
  }

  return DEFAULT_SITE_STATS
}

/**
 * Update dynamic site stats in SiteSettings
 */
export async function updateSiteStats(stats: SiteStatItem[]) {
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      statsJson: stats as any,
    },
    create: {
      id: 1,
      siteName: 'Recruitment Institute',
      statsJson: stats as any,
    },
  })
}
