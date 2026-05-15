'use client'

import { usePathname } from 'next/navigation'
import styles from '@/app/(site)/layout.module.css'

const GALLERY_ROUTE = /^\/(portfolios|selected-clients|projects)\/[^/]+/

export default function GalleryAwareMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isGallery = GALLERY_ROUTE.test(pathname)
  return (
    <main className={isGallery ? styles.mainGallery : styles.main}>
      {children}
    </main>
  )
}
