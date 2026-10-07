import type { Metadata, Viewport } from 'next'
import StudioClient from './studio-client'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Studio',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function StudioPage() {
  return <StudioClient />
}
