'use client'

import { useLayoutEffect, useRef } from 'react'
import Link from 'next/link'

const DURATION = 500
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)'

interface Props {
  href: string
  className: string
  children: React.ReactNode
}

export default function GalleryLink({ href, className, children }: Props) {
  const linkRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const returningHref = sessionStorage.getItem('gallery-returning-href')
    if (returningHref !== href || !linkRef.current) return

    const storedY    = sessionStorage.getItem('gallery-title-y')
    const storedSize = sessionStorage.getItem('gallery-title-size')
    if (!storedY) return

    const nameEl = linkRef.current.querySelector<HTMLElement>('p')
    if (!nameEl) return

    const nameY = nameEl.getBoundingClientRect().top
    const delta = parseFloat(storedY) - nameY

    let startScale = 1
    if (storedSize) {
      const nameSize = parseFloat(getComputedStyle(nameEl).fontSize)
      startScale = parseFloat(storedSize) / nameSize
    }

    nameEl.style.transformOrigin = 'left top'
    nameEl.style.transform = `translateY(${delta}px) scale(${startScale})`

    sessionStorage.removeItem('gallery-returning-href')
    sessionStorage.removeItem('gallery-title-y')
    sessionStorage.removeItem('gallery-title-size')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nameEl.style.transition = `transform ${DURATION}ms ${EASING}`
        nameEl.style.transform = 'none'
      })
    })
  }, [href])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const nameEl = e.currentTarget.querySelector<HTMLElement>('p')
    if (nameEl) {
      sessionStorage.setItem('gallery-origin-y', String(nameEl.getBoundingClientRect().top))
      sessionStorage.setItem('gallery-origin-size', getComputedStyle(nameEl).fontSize)
    }
  }

  return (
    <Link ref={linkRef} href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
