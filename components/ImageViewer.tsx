'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './ImageViewer.module.css'

interface ImageViewerProps {
  images: SanityImageAsset[]
  initialIndex: number
  onClose: () => void
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [hoveredSide, setHoveredSide] = useState<'prev' | 'next' | null>(null)

  const prev = useCallback(
    () => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length]
  )
  const next = useCallback(
    () => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, onClose])

  // Preload adjacent images so navigation feels instant
  useEffect(() => {
    if (images.length <= 1) return
    const toPreload = [
      images[(current + 1) % images.length],
      images[(current - 1 + images.length) % images.length],
    ]
    toPreload.forEach((img) => {
      if (!img?.asset) return
      const preloadImg = new window.Image()
      preloadImg.src = urlFor(img).auto('format').quality(85).url()
    })
  }, [current, images])

  const img = images[current]
  const src = urlFor(img).auto('format').quality(85).url()
  const lqip = img.asset?.metadata?.lqip
  const blurProps = lqip ? { placeholder: 'blur' as const, blurDataURL: lqip } : {}

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 40) {
      if (delta < 0) next()
      else prev()
    }
    setTouchStartX(null)
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Centered close button */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close viewer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Image fills the overlay, contained */}
      <div className={styles.imageWrap}>
        <Image
          key={src}
          src={src}
          alt={img.alt ?? ''}
          fill
          style={{ objectFit: 'contain' }}
          sizes="100vw"
          priority
          {...blurProps}
        />
      </div>

      {/* Image counter */}
      <div className={styles.counter} aria-live="polite">
        {current + 1}/{images.length}
      </div>

      {/* Click-zone halves — left = prev, right = next */}
      <button
        className={styles.prevZone}
        onClick={prev}
        aria-label="Previous image"
        data-cursor="left"
        onMouseEnter={() => setHoveredSide('prev')}
        onMouseLeave={() => setHoveredSide(null)}
      />
      <button
        className={styles.nextZone}
        onClick={next}
        aria-label="Next image"
        data-cursor="right"
        onMouseEnter={() => setHoveredSide('next')}
        onMouseLeave={() => setHoveredSide(null)}
      />

      {/* Visible navigation arrows */}
      {images.length > 1 && (
        <>
          <span
            className={`${styles.prevArrow} ${hoveredSide === 'prev' ? styles.prevArrowActive : ''}`}
            aria-hidden="true"
          >
            ←
          </span>
          <span
            className={`${styles.nextArrow} ${hoveredSide === 'next' ? styles.nextArrowActive : ''}`}
            aria-hidden="true"
          >
            →
          </span>
        </>
      )}
    </div>
  )
}
