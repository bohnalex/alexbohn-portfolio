'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
  const [dragOffset, setDragOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const horizontalLocked = useRef(false)

  const n = images.length

  // Instant navigation — used by click zones and keyboard (desktop)
  const goNext = useCallback(() => setCurrent((i) => (i + 1) % n), [n])
  const goPrev = useCallback(() => setCurrent((i) => (i - 1 + n) % n), [n])

  // Animated navigation — used only by touch swipe (mobile)
  const commitNext = useCallback(() => {
    if (n <= 1) return
    const w = overlayRef.current?.offsetWidth ?? window.innerWidth
    setIsAnimating(true)
    setDragOffset(-w)
    setTimeout(() => {
      setCurrent((i) => (i + 1) % n)
      setDragOffset(0)
      setIsAnimating(false)
    }, 280)
  }, [n])

  const commitPrev = useCallback(() => {
    if (n <= 1) return
    const w = overlayRef.current?.offsetWidth ?? window.innerWidth
    setIsAnimating(true)
    setDragOffset(w)
    setTimeout(() => {
      setCurrent((i) => (i - 1 + n) % n)
      setDragOffset(0)
      setIsAnimating(false)
    }, 280)
  }, [n])

  const snapBack = useCallback(() => {
    setIsAnimating(true)
    setDragOffset(0)
    setTimeout(() => setIsAnimating(false), 280)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev, goNext, onClose])

  // Non-passive touchmove so we can preventDefault on horizontal drags
  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const onMove = (e: TouchEvent) => {
      if (touchStartX.current === null) return
      const dx = e.touches[0].clientX - touchStartX.current
      const dy = e.touches[0].clientY - (touchStartY.current ?? e.touches[0].clientY)
      if (!horizontalLocked.current) {
        if (Math.abs(dx) > Math.abs(dy) + 3) {
          horizontalLocked.current = true
        } else if (Math.abs(dy) > Math.abs(dx) + 3) {
          touchStartX.current = null
          return
        }
      }
      if (horizontalLocked.current) {
        e.preventDefault()
        setDragOffset(dx)
      }
    }
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    horizontalLocked.current = false
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || !horizontalLocked.current) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    touchStartY.current = null
    const threshold = (overlayRef.current?.offsetWidth ?? window.innerWidth) * 0.25
    if (dx < -threshold) commitNext()
    else if (dx > threshold) commitPrev()
    else snapBack()
  }

  function renderSlide(img: SanityImageAsset, leftOffset: string) {
    if (!img?.asset) return null
    const src = urlFor(img).auto('format').fit('max').url()
    const lqip = img.asset?.metadata?.lqip
    const blurProps = lqip ? { placeholder: 'blur' as const, blurDataURL: lqip } : {}
    return (
      <div className={styles.slide} style={{ left: leftOffset }}>
        <Image
          src={src}
          alt={img.alt ?? ''}
          fill
          style={{ objectFit: 'contain' }}
          sizes="100vw"
          quality={85}
          priority
          {...blurProps}
        />
      </div>
    )
  }

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close viewer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="3" y1="3" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={styles.imageWrap}>
        <div
          className={styles.strip}
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isAnimating ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {n > 1 && renderSlide(images[(current - 1 + n) % n], '-100%')}
          {renderSlide(images[current], '0%')}
          {n > 1 && renderSlide(images[(current + 1) % n], '100%')}
        </div>
      </div>

      <div className={styles.counter} aria-live="polite">
        {current + 1}/{n}
      </div>

      <button className={styles.prevZone} onClick={goPrev} aria-label="Previous image" />
      <button className={styles.nextZone} onClick={goNext} aria-label="Next image" />
    </div>
  )
}
