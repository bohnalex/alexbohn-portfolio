'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const MIN_FONT = 6
const MAX_FONT = 300

interface NavLink {
  href: string
  label: string
}

interface Props {
  visibleLinks: readonly NavLink[]
}

export default function Nav({ visibleLinks }: Props) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const [logoRight, setLogoRight] = useState<number | null>(null)
  const [logoReady, setLogoReady] = useState(false)

  const activeHref = (
    visibleLinks.find(({ href }) =>
      href === '/' ? pathname === '/' : pathname.startsWith(href)
    ) ?? visibleLinks[0]
  )?.href

  const targetHref = hoveredHref ?? activeHref

  // Keep a stable ref to the latest updater so fitNav/resize can call it without stale closures
  const logoUpdateRef = useRef<() => void>(() => {})

  const updateLogoPosition = useCallback(() => {
    if (window.innerWidth <= 768) {
      setLogoRight(null)
      return
    }
    const el = targetHref ? linkRefs.current.get(targetHref) : null
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    setLogoRight(window.innerWidth - rect.right)
    setLogoReady(true)
  }, [targetHref])

  logoUpdateRef.current = updateLogoPosition

  useEffect(() => {
    updateLogoPosition()
    document.fonts.ready.then(updateLogoPosition)
  }, [updateLogoPosition])

  const fitNav = useCallback(() => {
    const nav = navRef.current
    if (!nav) return

    if (window.innerWidth <= 768) {
      nav.style.fontSize = ''
      return
    }

    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('[data-navlink]'))
    if (!links.length) return

    const cs = window.getComputedStyle(nav)
    const availableWidth =
      nav.clientWidth -
      parseFloat(cs.paddingLeft || '0') -
      parseFloat(cs.paddingRight || '0')
    const computedGap = parseFloat(cs.columnGap || '0') || 0
    const minGapTotal = (links.length - 1) * computedGap

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
    logoUpdateRef.current()
  }, [])

  useEffect(() => {
    fitNav()
    document.fonts.ready.then(fitNav)

    let timer = 0
    const onResize = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        fitNav()
        logoUpdateRef.current()
      }, 150)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
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
      <nav
        ref={navRef}
        className={styles.nav}
        onMouseLeave={() => setHoveredHref(null)}
      >
        {visibleLinks.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              data-navlink=""
              ref={(el: HTMLAnchorElement | null) => {
                if (el) linkRefs.current.set(href, el)
                else linkRefs.current.delete(href)
              }}
              className={`${styles.link} ${active ? styles.active : ''}`}
              onMouseEnter={() => setHoveredHref(href)}
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

        <span
          className={`${styles.logo} ${logoReady ? styles.logoReady : ''}`}
          style={logoRight !== null ? { right: logoRight } : undefined}
        >
          <Link href="/" className={styles.logoLink}>Alex Bohn</Link>
          <span className={styles.logoSuffix}>&apos;s</span>
        </span>
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
