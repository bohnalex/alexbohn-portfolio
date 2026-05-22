import type { Metadata } from 'next'
import PortableTextClient from '@/components/PortableTextClient'
import { getInfo } from '@/sanity/lib/queries'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Info' }

export default async function InfoPage() {
  const info = await getInfo()

  return (
    <>
      <section className={styles.page}>
        <div className={styles.cols}>
          <div className={styles.col}>
            {info?.bio ? (
              <div className={styles.bio}>
                <PortableTextClient value={info.bio as unknown[]} />
              </div>
            ) : null}

            <div className={styles.contact}>
              {info?.email && (
                <p>
                  <a href={`mailto:${info.email}`} className={styles.contactLink}>
                    {info.email.toLowerCase()}
                  </a>
                </p>
              )}
              {info?.phone && (
                <p>
                  <a href={`tel:${info.phone}`} className={styles.contactLink}>
                    {info.phone}
                  </a>
                </p>
              )}
              {info?.instagram && (
                <p>
                  <a
                    href={info.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.contactLink} ${styles.contactLinkRed}`}
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
              <p className={styles.sectionLabel}>Select Clients</p>
              <div className={styles.rightColContent}>
                <div className={styles.clientList}>
                  <PortableTextClient value={info.clientList as unknown[]} />
                </div>
                {info?.additionalInfo && (
                  <div className={styles.additionalInfo}>
                    {info.additionalInfo}
                  </div>
                )}
                {info?.rightColumnText && (
                  <div className={styles.rightColumnText}>
                    {info.rightColumnText}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <a
        href="https://world.alexbohn.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.tripLink}
      >
        psst - check this out
      </a>
    </>
  )
}
