'use client'

import { useState, useMemo } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { MobileRow, SanityImageAsset } from '@/sanity/lib/queries'
import styles from './MobileGalleryGrid.module.css'

interface Props {
  rows: MobileRow[]
}

export default function MobileGalleryGrid({ rows }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const allImages = useMemo(() => rows.flatMap((r) => r.images), [rows])

  const rowsIndexed = useMemo(() => {
    let idx = 0
    return rows.map((row) => {
      const startIndex = idx
      idx += row.images.length
      return { ...row, startIndex }
    })
  }, [rows])

  if (!rows.length) return null

  return (
    <>
      <div className={styles.grid}>
        {rowsIndexed.map((row) => {
          if (row.rowType === 'full') {
            const img = row.images[0]
            if (!img) return null
            const w = img.asset?.metadata?.dimensions?.width ?? 3
            const h = img.asset?.metadata?.dimensions?.height ?? 2
            return (
              <button
                key={row._key}
                className={styles.fullCell}
                style={{ aspectRatio: `${w} / ${h}` }}
                onClick={() => setViewerIndex(row.startIndex)}
                aria-label={img.alt ?? 'Image'}
              >
                <SanityImage
                  image={img}
                  fill
                  sizes="100vw"
                  priority={row.startIndex < 2}
                  style={{ objectFit: 'cover' }}
                />
              </button>
            )
          }

          // Pair row: derive a shared aspect ratio from the tallest image so neither is cropped
          const ratios = row.images.map((img: SanityImageAsset) => {
            const d = img.asset?.metadata?.dimensions
            return d && d.width > 0 ? d.height / d.width : 1.5
          })
          const maxRatio = Math.max(...ratios, 0.1)

          return (
            <div key={row._key} className={styles.pair}>
              {row.images.map((img: SanityImageAsset, i: number) => (
                <button
                  key={img._key ?? i}
                  className={styles.pairCell}
                  style={{ aspectRatio: `1 / ${maxRatio}` }}
                  onClick={() => setViewerIndex(row.startIndex + i)}
                  aria-label={img.alt ?? `Image ${row.startIndex + i + 1}`}
                >
                  <SanityImage
                    image={img}
                    fill
                    sizes="50vw"
                    priority={row.startIndex + i < 4}
                    style={{ objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {viewerIndex !== null && (
        <ImageViewer
          images={allImages}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  )
}
