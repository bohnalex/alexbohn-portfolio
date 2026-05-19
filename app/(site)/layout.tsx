import NavWrapper from '@/components/NavWrapper'
import GalleryAwareMain from '@/components/GalleryAwareMain'
import { getNavSettings } from '@/sanity/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navSettings = await getNavSettings()
  return (
    <>
      <NavWrapper navSettings={navSettings} />
      <GalleryAwareMain>{children}</GalleryAwareMain>
    </>
  )
}
