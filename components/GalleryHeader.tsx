'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/app/(site)/gallery.module.css'

const DURATION = 450

interface Props {
  backHref: string
  backLabel: string
  title: string
}

export default function GalleryHeader({ backHref, backLabel, title }: Props) {
  const router = useRouter()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const deltaRef = useRef<number>(0)
  const [titleStyle, setTitleStyle] = useState<React.CSSProperties>({})

  useLayoutEffect(() => {
    const stored = sessionStorage.getItem('gallery-origin-y')
    if (!stored || !titleRef.current) return

    const originY = parseFloat(stored)
    const titleY = titleRef.current.getBoundingClientRect().top
    const delta = originY - titleY
    deltaRef.current = delta

    // Place title at origin position before first paint
    setTitleStyle({ transform: `translateY(${delta}px)` })

    // After initial position is committed, animate to final position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTitleStyle({
          transform: 'translateY(0)',
          transition: `transform ${DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        })
      })
    })
  }, [])

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    const delta = deltaRef.current
    setTitleStyle({
      transform: `translateY(${delta}px)`,
      transition: `transform ${DURATION}ms cubic-bezier(0.55, 0, 1, 0.45)`,
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
