import type { ImageLoaderProps } from 'next/image'

export function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src)
  const existingH = url.searchParams.get('h')
  if (existingH) {
    const existingW = parseInt(url.searchParams.get('w') ?? String(width))
    url.searchParams.set('h', String(Math.round((parseInt(existingH) * width) / existingW)))
  }
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 85))
  return url.toString()
}
