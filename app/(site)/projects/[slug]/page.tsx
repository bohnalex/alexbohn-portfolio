import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, getProjects } from '@/sanity/lib/queries'
import MasonryGrid from '@/components/MasonryGrid'
import ThreesGrid from '@/components/ThreesGrid'
import MobileGalleryGrid from '@/components/MobileGalleryGrid'
import styles from '../../gallery.module.css'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug)
  return { title: project?.title ?? 'Project' }
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject(params.slug)
  if (!project) notFound()

  const isThrees = params.slug === 'threes'

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Link href="/projects" className={styles.back} aria-label="Back to Projects">
          ←
        </Link>
        <h1 className={styles.title}>{project.title}</h1>
      </header>
      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}
      {project.mobileLayout?.length ? (
        <>
          <div className={styles.desktopGrid}>
            {isThrees
              ? <ThreesGrid images={project.images ?? []} />
              : <MasonryGrid images={project.images ?? []} />}
          </div>
          <div className={styles.mobileGrid}>
            <MobileGalleryGrid rows={project.mobileLayout} />
          </div>
        </>
      ) : (
        isThrees
          ? <ThreesGrid images={project.images ?? []} />
          : <MasonryGrid images={project.images ?? []} />
      )}
    </section>
  )
}
