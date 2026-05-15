'use client'

import { useState } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { OverviewItem, SanityImageAsset } from '@/sanity/lib/queries'
import pageStyles from '@/app/(site)/page.module.css'
import styles from './OverviewGrid.module.css'

interface Props {
  items: OverviewItem[]
}

export default function OverviewGrid({ items }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  // Merge item-level alt into the image object so the viewer has it
  const viewerImages: SanityImageAsset[] = items.map((item) => ({
    ...item.image,
    alt: item.alt ?? item.image.alt,
  }))

  return (
    <>
      <section className={pageStyles.grid}>
        {items.map((item, i) => (
          <button
            key={item._key ?? i}
            className={styles.cellBtn}
            onClick={() => setViewerIndex(i)}
            aria-label={item.alt ?? `Image ${i + 1}`}
          >
            <div className={pageStyles.cell}>
              <div className={pageStyles.cellInner}>
                <SanityImage
                  image={item.image}
                  alt={item.alt}
                  fill
                  priority={i < 4}
                  sizes="(max-width: 768px) 50vw, 22vw"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                />
              </div>
            </div>
          </button>
        ))}
      </section>

      {viewerIndex !== null && (
        <ImageViewer
          images={viewerImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  )
}
