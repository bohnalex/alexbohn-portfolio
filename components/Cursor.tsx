'use client'

import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const cursor = cursorRef.current
    if (!cursor) return

    // Force cursor:none via multiple layers
    const style = document.createElement('style')
    style.textContent =
      '*,*::before,*::after,*:hover,*:focus,*:active,*:focus-visible{cursor:none!important}'
    document.head.appendChild(style)

    document.documentElement.style.setProperty('cursor', 'none', 'important')
    document.body.style.setProperty('cursor', 'none', 'important')

    // Stamp cursor:none on every element the pointer enters
    const stampNoCursor = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (el && !el.closest('#sanity')) {
        el.style.setProperty('cursor', 'none', 'important')
      }
    }
    window.addEventListener('mouseover', stampNoCursor, true)

    cursor.style.opacity = '1'

    const onMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`

      const target = e.target as Element
      const dataCursor = target.closest('[data-cursor]')

      if (dataCursor) {
        cursor.dataset.state = (dataCursor as HTMLElement).dataset.cursor ?? 'x'
      } else {
        const clickable = target.closest('a, button, [role="button"], label, input, select, textarea')
        cursor.dataset.state = clickable ? 'plus' : 'x'
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', stampNoCursor, true)
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
      <span className={styles.xIcon}>
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
          <line x1="3.5" y1="3.5" x2="17.5" y2="17.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17.5" y1="3.5" x2="3.5" y2="17.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className={styles.leftIcon}>
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
          <line x1="17" y1="10.5" x2="4" y2="10.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="9,5.5 4,10.5 9,15.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
      <span className={styles.rightIcon}>
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
          <line x1="4" y1="10.5" x2="17" y2="10.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <polyline points="12,5.5 17,10.5 12,15.5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
    </div>
  )
}
