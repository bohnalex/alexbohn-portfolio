'use client'

import { useState, useMemo } from 'react'
import SanityImage from './SanityImage'
import ImageViewer from './ImageViewer'
import type { MobileRow, SanityImageAsset } from '@/sanity/lib/queries'
import styles from './MobileGalleryGrid.module.css'

interface Props {
  rows: MobileRow[]
}

function getDimensions(img: SanityImageAsset): { width: number; height: number } | null {
  const d = img.asset?.metadata?.dimensions
  if (d?.width && d?.height) return d
  // Parse from asset ID: image-{hash}-{W}x{H}-{ext}
  const ref = (img.asset as { _ref?: string; _id?: string })?._ref ?? (img.asset as { _id?: string })?._id ?? ''
  const m = ref.match(/-(\d+)x(\d+)-/)
  if (m) return { width: parseInt(m[1]), height: parseInt(m[2]) }
  return null
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
            const dims = getDimensions(img)
            const w = dims?.width ?? 3
            const h = dims?.height ?? 2
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

          // Pair row: each cell uses its own natural aspect ratio + a flex value
          // proportional to that ratio. Both cells end up at identical height with
          // no cropping and no grey space.
          return (
            <div key={row._key} className={styles.pair}>
              {row.images.map((img: SanityImageAsset, i: number) => {
                const d = getDimensions(img)
                const w = d?.width ?? 2
                const h = d?.height ?? 3
                return (
                  <button
                    key={img._key ?? i}
                    className={styles.pairCell}
                    style={{ flex: w / h, aspectRatio: `${w} / ${h}` }}
                    onClick={() => setViewerIndex(row.startIndex + i)}
                    aria-label={img.alt ?? `Image ${row.startIndex + i + 1}`}
                  >
                    <SanityImage
                      image={img}
                      fill
                      sizes="50vw"
                      priority={row.startIndex + i < 4}
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                )
              })}
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
