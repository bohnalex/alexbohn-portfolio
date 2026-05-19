'use client'

import Link from 'next/link'

interface Props {
  href: string
  className: string
  children: React.ReactNode
}

export default function GalleryLink({ href, className, children }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const nameEl = e.currentTarget.querySelector<HTMLElement>('p')
    if (nameEl) {
      sessionStorage.setItem('gallery-origin-y', String(nameEl.getBoundingClientRect().top))
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
