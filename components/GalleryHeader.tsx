'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/app/(site)/gallery.module.css'

const EXIT_MS = 350

interface Props {
  backHref: string
  backLabel: string
  title: string
}

export default function GalleryHeader({ backHref, backLabel, title }: Props) {
  const router = useRouter()
  const [exiting, setExiting] = useState(false)

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault()
    setExiting(true)
    setTimeout(() => router.push(backHref), EXIT_MS)
  }

  return (
    <header className={styles.header}>
      <Link href={backHref} className={styles.back} onClick={handleBack} aria-label={backLabel}>
        ←
      </Link>
      <h1 className={`${styles.title} ${exiting ? styles.titleExit : styles.titleEnter}`}>
        {title}
      </h1>
    </header>
  )
}
