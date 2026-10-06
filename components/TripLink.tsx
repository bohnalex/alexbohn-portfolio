'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './TripLink.module.css'

const SpinningGlobe = dynamic(() => import('./SpinningGlobe'), { ssr: false })

interface Props {
  /** Line + text color. Omit for the original black style. */
  color?: string
  /** Color on hover (globe lines + text). */
  hoverColor?: string
  className?: string
}

export default function TripLink({ color, hoverColor, className }: Props) {
  const [hover, setHover] = useState(false)
  const colored = Boolean(color)
  const current = colored ? (hover && hoverColor ? hoverColor : color!) : '#000000'

  return (
    <a
      href="https://world.alexbohn.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${colored ? styles.colored : ''} ${className ?? ''}`}
      style={colored ? { color: current } : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <SpinningGlobe color={current} />
      <span className={styles.label}>Take a trip with me</span>
    </a>
  )
}
