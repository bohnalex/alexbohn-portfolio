import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClientGallery, getClientGalleries } from '@/sanity/lib/queries'
import MasonryGrid from '@/components/MasonryGrid'
import ThreesGrid from '@/components/ThreesGrid'
import MobileGalleryGrid from '@/components/MobileGalleryGrid'
import SOBGrid from '@/components/SOBGrid'
import styles from '../../gallery.module.css'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const clients = await getClientGalleries()
  return clients.map((c) => ({ slug: c.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gallery = await getClientGallery(params.slug)
  return { title: gallery?.name ?? 'Client Gallery' }
}

export default async function ClientGalleryPage({ params }: Props) {
  const gallery = await getClientGallery(params.slug)
  if (!gallery) notFound()

  const isThrees = params.slug === 'threes'
  const isSOB    = params.slug === 'strike-on-box'

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Link href="/selected-clients" className={styles.back} aria-label="Back to Selected Clients">
          ←
        </Link>
        <h1 className={styles.title}>{gallery.name}</h1>
      </header>
      {isThrees ? (
        <ThreesGrid images={gallery.images ?? []} />
      ) : isSOB ? (
        <SOBGrid images={gallery.images ?? []} />
      ) : gallery.mobileLayout?.length ? (
        <>
          <div className={styles.desktopGrid}>
            <MasonryGrid images={gallery.images ?? []} />
          </div>
          <div className={styles.mobileGrid}>
            <MobileGalleryGrid rows={gallery.mobileLayout} />
          </div>
        </>
      ) : (
        <MasonryGrid images={gallery.images ?? []} />
      )}
    </section>
  )
}
