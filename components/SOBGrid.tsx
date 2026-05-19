'use client'

import { useState } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './SOBGrid.module.css'

interface Props {
  images: SanityImageAsset[]
  loose?: boolean
}

function getDimensions(img: SanityImageAsset): { width: number; height: number } | null {
  const d = img.asset?.metadata?.dimensions
  if (d?.width && d?.height) return d
  const ref = (img.asset as { _ref?: string; _id?: string })?._ref ?? (img.asset as { _id?: string })?._id ?? ''
  const m = ref.match(/-(\d+)x(\d+)-/)
  if (m) return { width: parseInt(m[1]), height: parseInt(m[2]) }
  return null
}

export default function SOBGrid({ images, loose }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  if (!images?.length) return null

  return (
    <>
      <div className={`${styles.grid}${loose ? ` ${styles.loose}` : ''}`}>
        {images.map((image, i) => {
          const d = getDimensions(image)
          const w = d?.width ?? 3
          const h = d?.height ?? 2
          return (
            <button
              key={image._key ?? i}
              className={styles.item}
              style={{ aspectRatio: `${w} / ${h}` }}
              onClick={() => setViewerIndex(i)}
              aria-label={image.alt ?? `Image ${i + 1}`}
            >
              <SanityImage
                image={image}
                fill
                sizes="100vw"
                priority={i < 3}
                style={{ objectFit: 'cover' }}
              />
            </button>
          )
        })}
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
