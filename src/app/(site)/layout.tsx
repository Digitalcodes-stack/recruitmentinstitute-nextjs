import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatAssistant from '@/components/ChatAssistant'
import { getNavOverrides } from '@/lib/nav-config'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navOverrides = await getNavOverrides()

  return (
    <>
      <Header navOverrides={navOverrides} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatAssistant />
    </>
  )
}
