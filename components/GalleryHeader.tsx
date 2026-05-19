'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/app/(site)/gallery.module.css'

const DURATION = 500
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)'

interface Props {
  backHref: string
  backLabel: string
  title: string
}

export default function GalleryHeader({ backHref, backLabel, title }: Props) {
  const router = useRouter()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const deltaRef = useRef<number>(0)
  const scaleRef = useRef<number>(1)
  const [titleStyle, setTitleStyle] = useState<React.CSSProperties>({})

  useLayoutEffect(() => {
    const storedY    = sessionStorage.getItem('gallery-origin-y')
    const storedSize = sessionStorage.getItem('gallery-origin-size')
    if (!storedY || !titleRef.current) return

    const titleY = titleRef.current.getBoundingClientRect().top
    const delta  = parseFloat(storedY) - titleY
    deltaRef.current = delta

    let startScale = 1
    if (storedSize) {
      const currentSize = parseFloat(getComputedStyle(titleRef.current).fontSize)
      startScale = parseFloat(storedSize) / currentSize
    }
    scaleRef.current = startScale

    // Place at origin before first paint
    setTitleStyle({
      transform: `translateY(${delta}px) scale(${startScale})`,
      transformOrigin: 'left top',
    })

    // Double rAF: ensure origin is painted before transition begins
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTitleStyle({
          transform: 'none',
          transformOrigin: 'left top',
          transition: `transform ${DURATION}ms ${EASING}`,
        })
      })
    })
  }, [])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    setTitleStyle({
      transform: `translateY(${deltaRef.current}px) scale(${scaleRef.current})`,
      transformOrigin: 'left top',
      transition: `transform ${DURATION}ms ${EASING}`,
    })
    setTimeout(() => router.push(backHref), DURATION)
  }

  return (
    <header className={styles.header}>
      <Link href={backHref} className={styles.back} onClick={handleBack} aria-label={backLabel}>
        ←
      </Link>
      <h1 ref={titleRef} className={styles.title} style={titleStyle}>
        {title}
      </h1>
    </header>
  )
}
