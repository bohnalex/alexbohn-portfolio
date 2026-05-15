'use client'

import { useState } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './MasonryGrid.module.css'

interface MasonryGridProps {
  images: SanityImageAsset[]
}

export default function MasonryGrid({ images }: MasonryGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  if (!images?.length) {
    return <p className={styles.empty}>No images yet.</p>
  }

  return (
    <>
      <div className={styles.masonry}>
        {images.map((image, i) => (
          <button
            key={image._key ?? i}
            className={styles.item}
            onClick={() => setViewerIndex(i)}
            aria-label={image.alt ?? `Image ${i + 1}`}
          >
            <div className={styles.inner}>
              <SanityImage
                image={image}
                fill
                priority={i < 8}
                sizes="(max-width: 900px) 50vw, 25vw"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </div>
          </button>
        ))}
      </div>

      {viewerIndex !== null && (
        <ImageViewer
          images={images}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  )
}
