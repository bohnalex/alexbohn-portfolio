'use client'

import { useState } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './ThreesGrid.module.css'

interface Props {
  images: SanityImageAsset[]
}

export default function ThreesGrid({ images }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  if (!images?.length) return null

  return (
    <>
      <div className={styles.grid}>
        {images.map((image, i) => (
          <button
            key={image._key ?? i}
            className={styles.item}
            onClick={() => setViewerIndex(i)}
            aria-label={image.alt ?? `Image ${i + 1}`}
          >
            <SanityImage
              image={image}
              fill
              priority={i < 10}
              sizes="(max-width: 768px) 33vw, 20vw"
              style={{ objectFit: 'cover' }}
            />
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
