import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClientGallery, getClientGalleries } from '@/sanity/lib/queries'
import MasonryGrid from '@/components/MasonryGrid'
import ThreesGrid from '@/components/ThreesGrid'
import MobileGalleryGrid from '@/components/MobileGalleryGrid'
import SOBGrid from '@/components/SOBGrid'
import GalleryHeader from '@/components/GalleryHeader'
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
      <GalleryHeader backHref="/selected-clients" backLabel="Back to Selected Clients" title={gallery.name} />
      {isThrees ? (
        <ThreesGrid images={gallery.images ?? []} loose />
      ) : isSOB ? (
        <SOBGrid images={gallery.images ?? []} loose />
      ) : gallery.mobileLayout?.length ? (
        <>
          <div className={styles.desktopGrid}>
            <MasonryGrid images={gallery.images ?? []} />
          </div>
          <div className={styles.mobileGrid}>
            <MobileGalleryGrid rows={gallery.mobileLayout} loose />
          </div>
        </>
      ) : (
        <MasonryGrid images={gallery.images ?? []} loose />
      )}
    </section>
  )
}
