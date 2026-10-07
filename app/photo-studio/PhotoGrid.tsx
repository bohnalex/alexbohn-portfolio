'use client'

import { useCallback, useEffect, useState } from 'react'
import SanityImage from '@/components/SanityImage'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './page.module.css'

export default function PhotoGrid({ photos }: { photos: SanityImageAsset[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const n = photos.length

  const close = useCallback(() => setOpen(null), [])
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + n) % n)), [n])
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % n)), [n])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close, prev, next])

  const current = open === null ? null : photos[open]

  return (
    <>
      <div className={styles.grid}>
        {photos.map((p, i) => (
          <button
            key={p._key ?? i}
            type="button"
            className={styles.photo}
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${n}`}
          >
            <SanityImage image={p} alt={p.alt ?? 'Photo studio'} fill sizes="(max-width: 960px) 50vw, 15vw" />
          </button>
        ))}
      </div>

      {current ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Studio photos"
          onClick={close}
        >
          <div className={styles.lightboxImage} onClick={(e) => { e.stopPropagation(); next() }}>
            <SanityImage
              image={current}
              alt={current.alt ?? 'Photo studio'}
              sizes="90vw"
              style={{ width: 'auto', height: 'auto', maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain' }}
              priority
            />
          </div>

          {n > 1 ? (
            <>
              <button type="button" className={`${styles.lbBtn} ${styles.lbPrev}`} onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Previous photo">←</button>
              <button type="button" className={`${styles.lbBtn} ${styles.lbNext}`} onClick={(e) => { e.stopPropagation(); next() }} aria-label="Next photo">→</button>
            </>
          ) : null}
          <button type="button" className={`${styles.lbBtn} ${styles.lbClose}`} onClick={close} aria-label="Close">✕</button>
          <span className={styles.lbCount}>{String(open! + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        </div>
      ) : null}
    </>
  )
}
