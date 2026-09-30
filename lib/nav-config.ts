import { prisma } from '@/lib/prisma'
import { DEFAULT_NAV_OVERRIDES, type NavOverride } from '@/lib/nav-config-constants'

export type { NavOverride }
export { DEFAULT_NAV_OVERRIDES }

/**
 * Fetch nav overrides from site_settings.nav_json.
 * Uses direct SQL so it never breaks regardless of Prisma Client in-memory state
 * (matches the existing getSiteStats() pattern in lib/site-stats.ts).
 * Falls back to defaults on any error or missing/empty data — header is never empty.
 */
export async function getNavOverrides(): Promise<NavOverride[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ nav_json: any }>>(
      'SELECT nav_json FROM site_settings WHERE id = 1 LIMIT 1'
    )

    if (rows && rows.length > 0 && rows[0]?.nav_json) {
      let nav = rows[0].nav_json
      if (typeof nav === 'string') {
        try { nav = JSON.parse(nav) } catch { nav = null }
      }
      if (Array.isArray(nav) && nav.length > 0) {
        // Merge by id so a newly-added default item is never silently dropped
        // if an older/shorter override array is saved in the DB.
        return DEFAULT_NAV_OVERRIDES.map((def) => {
          const saved = nav.find((n: any) => n?.id === def.id)
          if (!saved) return def
          return {
            id: def.id,
            label: String(saved.label || def.label),
            visible: saved.visible !== false,
            order: Number.isFinite(saved.order) ? Number(saved.order) : def.order,
          }
        })
      }
    }
  } catch (error) {
    console.error('Error fetching nav overrides:', error)
  }

  return DEFAULT_NAV_OVERRIDES
}

export async function updateNavOverrides(overrides: NavOverride[]) {
  const jsonStr = JSON.stringify(overrides)
  return prisma.$executeRawUnsafe(
    `INSERT INTO site_settings (id, site_name, nav_json, updated_at)
     VALUES (1, 'Recruitment Institute', $1::jsonb, NOW())
     ON CONFLICT (id)
     DO UPDATE SET nav_json = $1::jsonb, updated_at = NOW()`,
    jsonStr
  )
}
