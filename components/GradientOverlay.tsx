'use client'

import { usePathname } from 'next/navigation'
import styles from '@/app/(site)/layout.module.css'

const GALLERY_ROUTE = /^\/(portfolios|selected-clients|projects)\/[^/]+/

export default function GradientOverlay() {
  const pathname = usePathname()
  if (GALLERY_ROUTE.test(pathname)) return null
  return <div className={styles.gradientOverlay} aria-hidden="true" />
}
