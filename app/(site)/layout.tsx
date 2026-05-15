import Link from 'next/link'
import NavWrapper from '@/components/NavWrapper'
import GalleryAwareMain from '@/components/GalleryAwareMain'
import Cursor from '@/components/Cursor'
import { getNavSettings } from '@/sanity/lib/queries'
import styles from './layout.module.css'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const navSettings = await getNavSettings()
  return (
    <>
      <Cursor />
      <NavWrapper navSettings={navSettings} />
      <Link href="/" className={styles.siteName}>Alex Bohn</Link>
      <GalleryAwareMain>{children}</GalleryAwareMain>
    </>
  )
}
