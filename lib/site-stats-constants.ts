export interface SiteStatItem {
  icon: 'users' | 'book' | 'award' | 'trending' | string
  value: string
  label: string
  iconBg: string
  iconColor: string
}

export const DEFAULT_SITE_STATS: SiteStatItem[] = [
  { icon: 'users',   value: '5,000+',  label: 'Professionals Trained', iconBg: '#EFF6FF', iconColor: '#1D4ED8' },
  { icon: 'book',    value: '6',       label: 'Programs Available',     iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { icon: 'award',   value: '25+ Yrs', label: 'Industry Expertise',     iconBg: '#FFFBEB', iconColor: '#D97706' },
  { icon: 'trending',value: '95%',     label: 'Placement Success',      iconBg: '#F0FDF4', iconColor: '#16A34A' },
]
