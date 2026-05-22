'use client'

import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { SanityImageAsset } from '@/sanity/lib/queries'

interface SanityImageProps {
  image: SanityImageAsset
  alt?: string
  fill?: boolean
  sizes?: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  width?: number
  height?: number
  cropWidth?: number
  cropHeight?: number
}

export default function SanityImage({
  image,
  alt = '',
  fill = false,
  sizes,
  className,
  style,
  priority = false,
  width,
  height,
  cropWidth,
  cropHeight,
}: SanityImageProps) {
  if (!image?.asset) return null

  const src =
    cropWidth && cropHeight
      ? urlFor(image).width(cropWidth).height(cropHeight).fit('crop').auto('format').url()
      : urlFor(image).auto('format').fit('max').url()
  const lqip = image.asset?.metadata?.lqip
  const blurProps = lqip ? { placeholder: 'blur' as const, blurDataURL: lqip } : {}

  const noSave = {
    draggable: false,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
  }

  if (fill) {
    return (
      <>
        <Image
          src={src}
          alt={image.alt ?? alt}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          quality={85}
          className={className}
          style={{ objectFit: 'cover', objectPosition: 'center', ...style }}
          priority={priority}
          {...noSave}
          {...blurProps}
        />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />
      </>
    )
  }

  const w = width ?? image.asset?.metadata?.dimensions?.width ?? 1200
  const h = height ?? image.asset?.metadata?.dimensions?.height ?? 800

  return (
    <Image
      src={src}
      alt={image.alt ?? alt}
      width={w}
      height={h}
      sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      quality={85}
      className={className}
      style={{ width: '100%', height: 'auto', ...style }}
      priority={priority}
      {...noSave}
      {...blurProps}
    />
  )
}
