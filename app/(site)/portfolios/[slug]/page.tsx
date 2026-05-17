import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPortfolio, getPortfolios } from '@/sanity/lib/queries'
import MasonryGrid from '@/components/MasonryGrid'
import MobileGalleryGrid from '@/components/MobileGalleryGrid'
import styles from '../../gallery.module.css'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const portfolios = await getPortfolios()
  return portfolios.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug)
  return { title: portfolio?.title ?? 'Portfolio' }
}

export default async function PortfolioPage({ params }: Props) {
  const portfolio = await getPortfolio(params.slug)
  if (!portfolio) notFound()

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Link href="/portfolios" className={styles.back} aria-label="Back to Portfolios">
          ←
        </Link>
        <h1 className={styles.title}>{portfolio.title}</h1>
      </header>
      {portfolio.mobileLayout?.length ? (
        <>
          <div className={styles.desktopGrid}>
            <MasonryGrid images={portfolio.images ?? []} />
          </div>
          <div className={styles.mobileGrid}>
            <MobileGalleryGrid rows={portfolio.mobileLayout} />
          </div>
        </>
      ) : (
        <MasonryGrid images={portfolio.images ?? []} />
      )}
    </section>
  )
}
