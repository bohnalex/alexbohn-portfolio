import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import SanityImage from '@/components/SanityImage'
import { getPhotoStudio } from '@/sanity/lib/queries'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Photo Studio',
  description: '1,500 sq ft photo studio in Gowanus, Brooklyn — tabletop, beauty and video productions.',
}

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' })

// Used until the Photo Studio document is filled in Sanity
const DEFAULTS = {
  headline: '1,500 sq ft photo studio',
  subhead: 'Built for small to midsize tabletop, beauty and video productions.',
  details: [
    { label: 'Location', value: '7th St & 3rd Ave, Gowanus', link: 'https://maps.google.com/?q=7th+St+%26+3rd+Ave,+Brooklyn,+NY' },
    { label: 'Train', value: 'F / G · Smith–9th St' },
    { label: 'Size', value: '1,500 sq ft' },
    { label: 'Booking', value: 'alex@alexbohn.com', link: 'mailto:alex@alexbohn.com' },
  ],
  specs: [
    '10 ft ceilings',
    '24 hour freight elevator',
    'High speed WiFi',
    'Client lounge + dining area',
    'Kitchenette + full size fridge',
  ],
}

export default async function PhotoStudioPage() {
  const data = await getPhotoStudio()

  const headline = data?.headline || DEFAULTS.headline
  const subhead = data?.subhead || DEFAULTS.subhead
  const details = data?.details?.length ? data.details : DEFAULTS.details
  const specs = data?.specs?.length ? data.specs : DEFAULTS.specs
  const photos = data?.photos?.filter((p) => p?.asset) ?? []

  return (
    <div className={`${styles.wrap} ${archivo.variable} ${mono.variable}`}>
      <header className={styles.header}>
        <a href="https://alexbohn.com" className={styles.logo}>
          Alex Bohn
        </a>
      </header>

      <section className={styles.page}>
        <aside className={styles.side}>
          <div>
            <p className={styles.label}>Studio</p>
            <h1 className={styles.headline}>{headline}</h1>
            <p className={styles.subhead}>{subhead}</p>
          </div>

          <div className={styles.rows}>
            {details.map((d, i) => (
              <div key={('_key' in d && d._key) || i} className={styles.row}>
                <span className={styles.rowKey}>{d.label}</span>
                {d.link ? (
                  <a
                    href={d.link}
                    className={styles.rowLink}
                    {...(d.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {d.value}
                    {d.link.startsWith('http') ? ' ↗' : ''}
                  </a>
                ) : (
                  <span className={styles.rowValue}>{d.value}</span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <div className={styles.main}>
          {data?.heroImage?.asset ? (
            <div className={styles.hero}>
              <SanityImage image={data.heroImage} alt="Photo studio" fill sizes="(max-width: 960px) 100vw, 66vw" priority />
            </div>
          ) : null}

          <section>
            <p className={styles.label}>Specifications</p>
            <ul className={styles.list}>
              {specs.map((s, i) => (
                <li key={i} className={styles.listRow}>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {photos.length ? (
            <section>
              <p className={styles.label}>Photos</p>
              <div className={styles.grid}>
                {photos.map((p, i) => (
                  <div key={p._key ?? i} className={styles.photo}>
                    <SanityImage image={p} alt="Photo studio" fill sizes="(max-width: 960px) 50vw, 22vw" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}
