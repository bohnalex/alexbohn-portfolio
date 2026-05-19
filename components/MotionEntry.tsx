'use client'

import { useState } from 'react'
import SanityImage from './SanityImage'
import VideoTheater from './VideoTheater'
import type { SanityImageAsset } from '@/sanity/lib/queries'
import styles from './MotionEntry.module.css'

interface MotionEntryProps {
  title: string
  vimeoUrl: string
  previewImage: SanityImageAsset
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

export default function MotionEntry({ title, vimeoUrl, previewImage }: MotionEntryProps) {
  const [theaterOpen, setTheaterOpen] = useState(false)
  const videoId = extractVimeoId(vimeoUrl)

  return (
    <>
      <div className={styles.entry}>
        <div className={styles.media}>
          <button
            className={styles.thumbnail}
            onClick={() => setTheaterOpen(true)}
            aria-label={`Play ${title}`}
          >
            {previewImage.asset?.url?.toLowerCase().endsWith('.gif') ? (
              <img
                src={previewImage.asset.url}
                alt={previewImage.alt ?? ''}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <SanityImage
                image={previewImage}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            <div className={styles.playOverlay}>
              <svg
                className={styles.playIcon}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="23" stroke="white" strokeWidth="1.5" />
                <polygon points="19,14 37,24 19,34" fill="white" />
              </svg>
            </div>
          </button>
        </div>
        <p className={styles.title}>{title}</p>
      </div>

      {theaterOpen && videoId && (
        <VideoTheater videoId={videoId} onClose={() => setTheaterOpen(false)} />
      )}
    </>
  )
}
