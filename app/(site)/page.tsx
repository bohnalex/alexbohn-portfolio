import type { Metadata } from 'next'
import Link from 'next/link'
import { getOverview } from '@/sanity/lib/queries'
import OverviewGrid from '@/components/OverviewGrid'
import MobileGalleryGrid from '@/components/MobileGalleryGrid'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Overview' }

export default async function OverviewPage() {
  const overview = await getOverview()

  if (!overview?.images?.length) {
    return (
      <section className={styles.empty}>
        <p>No images yet</p>
        <Link href="/studio">Add content in Studio →</Link>
      </section>
    )
  }

  if (overview.mobileLayout?.length) {
    return (
      <>
        <div className={styles.desktopGrid}>
          <OverviewGrid items={overview.images} />
        </div>
        <div className={styles.mobileGrid}>
          <MobileGalleryGrid rows={overview.mobileLayout} loose peekFirst />
        </div>
      </>
    )
  }

  return <OverviewGrid items={overview.images} />
}
