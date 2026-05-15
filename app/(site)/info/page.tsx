import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { getInfo } from '@/sanity/lib/queries'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Info' }

export default async function InfoPage() {
  const info = await getInfo()

  return (
    <section className={styles.page}>
      <div className={styles.cols}>
        <div className={styles.col}>
          {info?.bio ? (
            <div className={styles.bio}>
              <PortableText value={info.bio as any} />
            </div>
          ) : null}

          <div className={styles.contact}>
            {info?.email && (
              <p>
                <a href={`mailto:${info.email}`} className={styles.contactLink}>
                  {info.email}
                </a>
              </p>
            )}
            {info?.instagram && (
              <p>
                <a
                  href={info.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  Instagram
                </a>
              </p>
            )}
            {info?.representation && (
              <div className={styles.rep}>
                <p className={styles.repLabel}>Representation</p>
                <p className={styles.repText}>{info.representation}</p>
              </div>
            )}
          </div>
        </div>

        {info?.clientList?.length ? (
          <div className={styles.col}>
            <p className={styles.sectionLabel}>Clients</p>
            <ul className={styles.clientList}>
              {info.clientList.map((name, i) => (
                <li key={i} className={styles.clientItem}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
