import type { Metadata } from 'next'
import { getMotionEntries } from '@/sanity/lib/queries'
import MotionEntry from '@/components/MotionEntry'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Motion' }

export default async function MotionPage() {
  const entries = await getMotionEntries()

  if (!entries.length) {
    return (
      <section className={styles.empty}>
        <p>No motion entries yet.</p>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <div className={styles.grid}>
        {entries.map((entry) => (
          <MotionEntry
            key={entry._id}
            title={entry.title}
            vimeoUrl={entry.vimeoUrl}
            previewImage={entry.previewImage}
          />
        ))}
      </div>
    </section>
  )
}
