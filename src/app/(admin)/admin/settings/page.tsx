import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import { ShieldCheck, LockKeyhole, BellRing, Paintbrush, Users2, Laptop } from 'lucide-react'

export default async function AdminSettingsPage() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') redirect('/admin/login')

  const sections = [
    { title: 'Profile Settings', desc: 'Update admin name, email, and profile information.', icon: Users2 },
    { title: 'Security Settings', desc: 'Manage passwords, sessions, and access protection.', icon: LockKeyhole },
    { title: 'Role & Permissions', desc: 'Review permissions for different admin roles.', icon: ShieldCheck },
    { title: 'Notification Settings', desc: 'Control email and system notifications.', icon: BellRing },
    { title: 'Branding Settings', desc: 'Adjust colors, logo, and portal branding.', icon: Paintbrush },
    { title: 'System Preferences', desc: 'Tweak platform defaults and admin behavior.', icon: Laptop },
  ]

  return (
    <AdminLayout title="Settings">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure the portal, access, branding, and security preferences.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map(({ title, desc, icon: Icon }) => (
          <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-500">{desc}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
              Configuration controls can be added here as forms, toggles, and permission matrices.
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
