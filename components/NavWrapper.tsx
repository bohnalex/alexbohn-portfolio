'use client'

import { usePathname } from 'next/navigation'
import Nav from './Nav'
import type { NavSettings } from '@/sanity/lib/queries'

const GALLERY_ROUTE = /^\/(portfolios|selected-clients|projects)\/[^/]+/

const ALL_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/portfolios', label: 'Portfolios', key: 'portfoliosVisible' },
  { href: '/selected-clients', label: 'Selected Clients', key: 'selectedClientsVisible' },
  { href: '/projects', label: 'Projects', key: 'projectsVisible' },
  { href: '/motion', label: 'Motion', key: 'motionVisible' },
  { href: '/info', label: 'Info', key: 'infoVisible' },
] as const

interface Props {
  navSettings: NavSettings
}

export default function NavWrapper({ navSettings }: Props) {
  const pathname = usePathname()
  if (GALLERY_ROUTE.test(pathname)) return null

  const visibleLinks = ALL_LINKS.filter(
    (link) => !('key' in link) || navSettings[link.key] !== false
  )

  return <Nav visibleLinks={visibleLinks} />
}
