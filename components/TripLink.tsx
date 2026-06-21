'use client'

import dynamic from 'next/dynamic'
import styles from './TripLink.module.css'

const SpinningGlobe = dynamic(() => import('./SpinningGlobe'), { ssr: false })

export default function TripLink() {
  return (
    <a
      href="https://world.alexbohn.com"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      <SpinningGlobe />
      <span className={styles.label}>Take a trip with me</span>
    </a>
  )
}
