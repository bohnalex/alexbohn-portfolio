import type { Metadata } from 'next'
import Link from 'next/link'
import { getPortfolios } from '@/sanity/lib/queries'
import SanityImage from '@/components/SanityImage'
import listingStyles from '../listing.module.css'
import styles from './portfolios.module.css'

export const metadata: Metadata = { title: 'Portfolios' }

export default async function PortfoliosPage() {
  const portfolios = await getPortfolios()

  if (!portfolios.length) {
    return (
      <section className={listingStyles.empty}>
        <p>No portfolios yet</p>
        <Link href="/studio">Add content in Studio →</Link>
      </section>
    )
  }

  return (
    <section className={styles.list}>
      {portfolios.map((p) => (
        <div key={p._id}>
          <hr className={styles.rule} />
          <Link href={`/portfolios/${p.slug.current}`} className={styles.row}>
            <div className={styles.strip}>
              {p.thumbnails?.map((img, i) => (
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
            <p className={styles.name}>{p.title}</p>
          </Link>
        </div>
      ))}
      <hr className={styles.rule} />
    </section>
  )
}
