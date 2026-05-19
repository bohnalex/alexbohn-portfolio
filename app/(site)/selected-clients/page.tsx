import type { Metadata } from 'next'
import { getClientGalleries } from '@/sanity/lib/queries'
import SanityImage from '@/components/SanityImage'
import Link from 'next/link'
import GalleryLink from '@/components/GalleryLink'
import listingStyles from '../listing.module.css'
import styles from '../portfolios/portfolios.module.css'

export const metadata: Metadata = { title: 'Selected Clients' }

export default async function SelectedClientsPage() {
  const clients = await getClientGalleries()

  if (!clients.length) {
    return (
      <section className={listingStyles.empty}>
        <p>No client galleries yet</p>
        <Link href="/studio">Add content in Studio →</Link>
      </section>
    )
  }

  return (
    <section className={styles.list}>
      {clients.map((c) => (
        <div key={c._id}>
          <hr className={styles.rule} />
          <GalleryLink href={`/selected-clients/${c.slug.current}`} className={styles.row}>
            <div className={styles.strip}>
              {c.thumbnails?.map((img, i) => (
                <div key={img._key ?? i} className={styles.thumb}>
                  <SanityImage
                    image={img}
                    fill
                    sizes="49px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            <p className={styles.name}>{c.name}</p>
          </GalleryLink>
        </div>
      ))}
      <hr className={styles.rule} />
    </section>
  )
}
