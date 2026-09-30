// Pure types/defaults for main nav overrides — safe to import from client components.
// DB read/write logic lives in lib/nav-config.ts (server-only, imports prisma).

export interface NavOverride {
  id: string
  label: string
  visible: boolean
  order: number
}

// Defaults mirror Header.tsx's navItems order exactly, so an empty/missing DB
// row never changes what the header renders today.
//
// 'tools' and 'events' are defined here (visible: false) but have NO corresponding
// entry in Header.tsx's navItems — no page exists for either yet. They exist here
// so Admin can see them as "planned" and so turning one on later is a single
// Header.tsx addition + flipping this flag, not a rediscovery exercise. Toggling
// visible:true on one of these today does nothing until its navItems entry exists.
// 'startup-tech' and 'consulting' now have real navItems entries (each with one
// real dropdown link) and are visible by default.
export const DEFAULT_NAV_OVERRIDES: NavOverride[] = [
  { id: 'home',            label: 'Home',                visible: true,  order: 0 },
  { id: 'training',        label: 'Training',            visible: true,  order: 1 },
  { id: 'accelerator',     label: 'Business Accelerator', visible: true,  order: 2 },
  { id: 'startup-tech',    label: 'Startup & Tech',       visible: true,  order: 3 },
  { id: 'consulting',      label: 'Consulting',           visible: true,  order: 4 },
  { id: 'trainers',        label: 'Trainers',             visible: true,  order: 5 },
  { id: 'events',          label: 'Events',               visible: true,  order: 6 },
  { id: 'tools',           label: 'Tools',                visible: true,  order: 7 },
  { id: 'recruitment-hub', label: 'Recruitment Hub',     visible: true,  order: 8 },
  { id: 'contact',         label: 'Contact',              visible: true,  order: 9 },
  { id: 'knowledge',       label: 'Knowledge',            visible: false, order: 10 },
  { id: 'success-stories', label: 'Success Stories',      visible: false, order: 11 },
  { id: 'community',       label: 'Community',            visible: false, order: 12 },
  { id: 'about',           label: 'About',                visible: false, order: 13 },
]
