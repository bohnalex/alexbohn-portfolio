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

          // Pair row: shorter image sets the row height; both fill with cover (no grey)
          const ratios = row.images.map((img: SanityImageAsset) => {
            const d = getDimensions(img)
            return d && d.width > 0 ? d.height / d.width : 1.5
          })
          const rowRatio = ratios.length > 0 ? Math.min(...ratios) : 1.5

          return (
            <div key={row._key} className={styles.pair}>
              {[0, 1].map((slot) => {
                const img = row.images[slot]
                if (!img) return <div key={slot} className={styles.pairCell} style={{ aspectRatio: `1 / ${rowRatio}` }} />
                return (
                  <button
                    key={img._key ?? slot}
                    className={styles.pairCell}
                    style={{ aspectRatio: `1 / ${rowRatio}` }}
                    onClick={() => setViewerIndex(row.startIndex + slot)}
                    aria-label={img.alt ?? `Image ${row.startIndex + slot + 1}`}
                  >
                    <SanityImage
                      image={img}
                      fill
                      sizes="50vw"
                      priority={row.startIndex + slot < 4}
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
