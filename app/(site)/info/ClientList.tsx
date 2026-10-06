'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SanityImage from '@/components/SanityImage'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './page.module.css'

export interface ClientItem {
  key: string
  name: string
  image?: SanityImageAsset
}

export default function ClientList({ clients }: { clients: ClientItem[] }) {
  const [active, setActive] = useState<string | null>(null)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setSlot(document.getElementById('client-preview-slot'))
  }, [])

  const current = clients.find((c) => c.key === active)

  return (
    <>
      <ul className={styles.clientList}>
        {clients.map((c) => (
          <li
            key={c.key}
            className={`${styles.clientRow} ${active === c.key ? styles.clientRowActive : ''}`}
            onMouseEnter={() => setActive(c.key)}
            onMouseLeave={() => setActive(null)}
          >
            <span>{c.name}</span>
            {c.image?.asset ? <span className={styles.clientTag}>← View</span> : null}
          </li>
        ))}
      </ul>

      {slot && current?.image?.asset
        ? createPortal(
            <div className={styles.preview}>
              <SanityImage image={current.image} alt={current.name} fill sizes="200px" />
            </div>,
            slot
          )
        : null}
    </>
  )
}
