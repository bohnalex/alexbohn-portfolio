'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import styles from '@/app/(site)/layout.module.css'

const GALLERY_ROUTE  = /^\/(portfolios|selected-clients|projects)\/[^/]+/
const LISTING_ROUTES = new Set(['/portfolios', '/projects', '/selected-clients'])

export default function GalleryAwareMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isGallery  = GALLERY_ROUTE.test(pathname)
  const isListing  = LISTING_ROUTES.has(pathname)
  const cls = isGallery ? styles.mainGallery : isListing ? styles.mainListing : styles.main

  useEffect(() => {
    if (isListing) window.scrollTo(0, 0)
  }, [pathname, isListing])

  useEffect(() => {
    const el = document.documentElement
    if (isListing) {
      el.style.overflow = 'hidden'
    } else {
      el.style.overflow = ''
    }
    return () => {
      el.style.overflow = ''
    }
  }, [isListing, pathname])

  return <main className={cls}>{children}</main>
}
