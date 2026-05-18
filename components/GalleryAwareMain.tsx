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

    const update = () => {
      if (!isListing) {
        el.style.overflowY = ''
        return
      }
      // Only lock scroll when all content fits — allows scroll if accessibility
      // zoom or large text pushes content beyond the viewport
      const fits = el.scrollHeight <= window.innerHeight + 1
      el.style.overflowY = fits ? 'hidden' : ''
    }

    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      el.style.overflowY = ''
    }
  }, [isListing, pathname])

  return <main className={cls}>{children}</main>
}
