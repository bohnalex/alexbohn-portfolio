import SanityImage from './SanityImage'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './ImageGrid.module.css'

interface ImageGridProps {
  images: SanityImageAsset[]
  columns?: 2 | 3 | 4
  priority?: boolean
}

export default function ImageGrid({
  images,
  columns = 3,
  priority = false,
}: ImageGridProps) {
  if (!images?.length) {
    return <p className={styles.empty}>No images yet.</p>
  }

  return (
    <div className={styles.grid} data-columns={columns}>
      {images.map((image, i) => (
        <div key={image._key ?? i} className={styles.item}>
          <SanityImage
            image={image}
            fill
            priority={priority && i < 4}
            sizes={
              columns === 2
                ? '(max-width: 768px) 100vw, 50vw'
                : columns === 4
                ? '(max-width: 768px) 50vw, 25vw'
                : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            }
          />
        </div>
      ))}
    </div>
  )
}
