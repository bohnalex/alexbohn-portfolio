import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import PortableTextClient from '@/components/PortableTextClient'
import TripLink from '@/components/TripLink'
import ClientList, { type ClientItem } from './ClientList'
import { getInfo } from '@/sanity/lib/queries'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Info' }

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' })

const RED = '#cd3232'
const TEAL = '#32cdcd' // what the nav's red becomes on hover (difference blend)

// Pull plain text lines out of the Portable Text client list (fallback source)
function blocksToNames(blocks: unknown[] | undefined): string[] {
  if (!blocks) return []
  return blocks
    .map((b) => {
      const children = (b as { children?: { text?: string }[] }).children ?? []
      return children.map((c) => c.text ?? '').join('').trim()
    })
    .filter(Boolean)
}

export default async function InfoPage() {
  const info = await getInfo()

  const clients: ClientItem[] = info?.clients?.length
    ? info.clients.map((c, i) => ({ key: c._key ?? String(i), name: c.name, image: c.image }))
    : blocksToNames(info?.clientList).map((name, i) => ({ key: String(i), name }))

  return (
    <section className={`${styles.page} ${archivo.variable} ${mono.variable}`}>
      <aside className={styles.side}>
        <div>
          <p className={styles.label}>Info</p>
          {info?.bio ? (
            <div className={styles.bio}>
              <PortableTextClient value={info.bio as unknown[]} />
            </div>
          ) : null}
        </div>

        <div className={styles.contact}>
          {info?.email && (
            <div className={styles.contactRow}>
              <span className={styles.contactKey}>Email</span>
              <a href={`mailto:${info.email}`} className={styles.contactLink}>
                {info.email.toLowerCase()}
              </a>
            </div>
          )}
          {info?.phone && (
            <div className={styles.contactRow}>
              <span className={styles.contactKey}>Phone</span>
              <a href={`tel:${info.phone.replace(/[^\d+]/g, '')}`} className={styles.contactLink}>
                {info.phone}
              </a>
            </div>
          )}
          {info?.instagram && (
            <div className={styles.contactRow}>
              <span className={styles.contactKey}>Social</span>
              <a
                href={info.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                Instagram ↗
              </a>
            </div>
          )}
          {info?.representation && (
            <div className={styles.contactRow}>
              <span className={styles.contactKey}>Rep</span>
              <span className={styles.repText}>{info.representation}</span>
            </div>
          )}
        </div>

        <div id="client-preview-slot" className={styles.previewSlot} />

        <TripLink color={RED} hoverColor={TEAL} className={styles.trip} />
      </aside>

      {clients.length ? (
        <div className={styles.main}>
          <p className={styles.label}>Selected Clients</p>
          <ClientList clients={clients} />
        </div>
      ) : null}
    </section>
  )
}
