import NavWrapper from '@/components/NavWrapper'
import GalleryAwareMain from '@/components/GalleryAwareMain'
import Cursor from '@/components/Cursor'
import { getNavSettings } from '@/sanity/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navSettings = await getNavSettings()
  return (
    <>
      <Cursor />
      <NavWrapper navSettings={navSettings} />
      <GalleryAwareMain>{children}</GalleryAwareMain>
    </>
  )
}
