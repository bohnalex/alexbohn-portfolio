'use client'

import Nav from './Nav'
import type { NavSettings } from '@/sanity/lib/queries'

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
  const visibleLinks = ALL_LINKS.filter(
    (link) => !('key' in link) || navSettings[link.key] !== false
  )

  return <Nav visibleLinks={visibleLinks} />
}
