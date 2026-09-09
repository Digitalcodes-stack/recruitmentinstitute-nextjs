import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers()
  const isAdminLogin = headerList.get('x-is-admin-login') === '1'

  // If on login route, bypass session check to prevent redirect loops
  if (isAdminLogin) {
    return <>{children}</>
  }

  // Server-side session check
  const session = await getAdminSession()
  if (!session || session.type !== 'admin' || !['ADMIN', 'SUPER_ADMIN'].includes(session.role as string)) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
