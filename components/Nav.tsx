'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const MIN_FONT = 6
const MAX_FONT = 300
const GAP = 28

interface NavLink {
  href: string
  label: string
}

interface Props {
  visibleLinks: readonly NavLink[]
  paddingBottom: number
}

export default function Nav({ visibleLinks, paddingBottom }: Props) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const fitNav = useCallback(() => {
    const nav = navRef.current
    if (!nav) return

    if (window.innerWidth <= 768) {
      nav.style.fontSize = ''
      return
    }

    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a'))
    if (!links.length) return

    const minGapTotal = (links.length - 1) * GAP

    const cs = window.getComputedStyle(nav)
    const availableWidth =
      nav.clientWidth -
      parseFloat(cs.paddingLeft || '0') -
      parseFloat(cs.paddingRight || '0')

    if (availableWidth <= 0) return

    let lo = MIN_FONT
    let hi = MAX_FONT

    while (hi - lo > 0.25) {
      const mid = (lo + hi) / 2
      nav.style.fontSize = `${mid}px`
      const totalNeeded = links.reduce((sum, el) => sum + el.scrollWidth, 0)
      if (totalNeeded + minGapTotal <= availableWidth) lo = mid
      else hi = mid
    }

    nav.style.fontSize = `${lo}px`
  }, [])

  useEffect(() => {
    fitNav()
    document.fonts.ready.then(fitNav)

    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fitNav)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [fitNav])

  useEffect(() => {
    fitNav()
  }, [visibleLinks, fitNav])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <nav ref={navRef} className={styles.nav} style={{ paddingBottom }}>
        {visibleLinks.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${active ? styles.active : ''}`}
            >
              {label}
            </Link>
          )
        })}
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBar1Open : ''}`} />
          <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBar2Open : ''}`} />
        </button>
      </nav>

      {mobileOpen && (
        <div className={styles.mobileOverlay}>
          {visibleLinks.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.mobileLink} ${active ? styles.active : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
