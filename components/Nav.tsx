'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const MIN_FONT = 6
const MAX_FONT = 300
const GALLERY_ROUTE = /^\/(portfolios|selected-clients|projects)\/[^/]+/

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
  const logoRef = useRef<HTMLSpanElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const [logoLeft, setLogoLeft] = useState<number | null>(null)
  const [logoReady, setLogoReady] = useState(false)

  const isGallery = GALLERY_ROUTE.test(pathname)

  const activeHref = (
    visibleLinks.find(({ href }) =>
      href === '/' ? pathname === '/' : pathname.startsWith(href)
    ) ?? visibleLinks[0]
  )?.href

  const targetHref = hoveredHref ?? activeHref

  const logoUpdateRef = useRef<() => void>(() => {})

  const updateLogoPosition = useCallback(() => {
    if (window.innerWidth <= 768) {
      setLogoLeft(null)
      return
    }

    if (isGallery) {
      const gridPadding = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--grid-padding')
      ) || 24
      const logoWidth = logoRef.current?.offsetWidth ?? 0
      setLogoLeft(window.innerWidth - gridPadding - logoWidth)
      setLogoReady(true)
      return
    }

    const el = targetHref ? linkRefs.current.get(targetHref) : null
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return

    const logoWidth = logoRef.current?.offsetWidth ?? 0
    let left: number
    if (targetHref === '/') {
      // Overview: left-justify
      left = rect.left
    } else if (targetHref === '/info') {
      // Info: right-justify
      left = rect.right - logoWidth
    } else {
      // All others: center above the link
      left = rect.left + rect.width / 2 - logoWidth / 2
    }

    setLogoLeft(left)
    setLogoReady(true)
  }, [targetHref, isGallery])

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
        {!isGallery && visibleLinks.map(({ href, label }) => {
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

        {!isGallery && (
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBar1Open : ''}`} />
            <span className={`${styles.hamburgerBar} ${mobileOpen ? styles.hamburgerBar2Open : ''}`} />
          </button>
        )}

        <span
          ref={logoRef}
          className={`${styles.logo} ${logoReady ? styles.logoReady : ''}`}
          style={logoLeft !== null ? { left: logoLeft } : undefined}
        >
          <Link href="/" className={styles.logoLink}>Alex Bohn</Link>
        </span>
      </nav>

      {!isGallery && mobileOpen && (
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
