import { groq } from 'next-sanity'
import { client } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SanityImageAsset {
  _key?: string
  asset: {
    _ref: string
    _type: string
    url?: string
    metadata?: {
      dimensions?: { width: number; height: number }
      lqip?: string
    }
  }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

export interface OverviewItem {
  _key?: string
  alt?: string
  linkUrl?: string
  image: SanityImageAsset
}

export interface Overview {
  images: OverviewItem[]
}

export interface Portfolio {
  _id: string
  title: string
  slug: { current: string }
  images: SanityImageAsset[]
  coverImage?: SanityImageAsset
  thumbnails?: SanityImageAsset[]
  mobileLayout?: MobileRow[]
}

export interface ClientGallery {
  _id: string
  name: string
  slug: { current: string }
  images: SanityImageAsset[]
  coverImage?: SanityImageAsset
  thumbnails?: SanityImageAsset[]
  mobileLayout?: MobileRow[]
}

export interface Project {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  images: SanityImageAsset[]
  coverImage?: SanityImageAsset
  thumbnails?: SanityImageAsset[]
  mobileLayout?: MobileRow[]
}

export interface MobileRow {
  _key: string
  rowType: 'pair' | 'full'
  images: SanityImageAsset[]
}

export interface MotionEntry {
  _id: string
  title: string
  vimeoUrl: string
  previewImage: SanityImageAsset
}

export interface NavSettings {
  portfoliosVisible: boolean
  selectedClientsVisible: boolean
  projectsVisible: boolean
  motionVisible: boolean
  infoVisible: boolean
}

export interface Info {
  bio?: unknown[]
  email?: string
  instagram?: string
  representation?: string
  clientList?: unknown[]
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const IMAGE_FIELDS = `
  _key,
  alt,
  hotspot,
  crop,
  asset->{ _id, _ref, url, metadata { dimensions, lqip } }
`

export async function getOverview(): Promise<Overview | null> {
  return client.fetch(
    groq`*[_type == "overview" && _id == "singleton-overview"][0] {
      images[] {
        _key,
        alt,
        linkUrl,
        image { hotspot, crop, asset->{ _id, url, metadata { dimensions, lqip } } }
      }
    }`,
    {},
    { cache: 'no-store' }
  )
}

export async function getPortfolios(): Promise<Portfolio[]> {
  return client.fetch(
    groq`*[_type == "portfolio" && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id, title, slug,
      "thumbnails": images[0..7] { ${IMAGE_FIELDS} }
    }`,
    {},
    { cache: 'no-store' }
  )
}

const MOBILE_LAYOUT_FIELDS = `
  "mobileLayout": mobileLayout[] {
    _key,
    rowType,
    "images": images[] { ${IMAGE_FIELDS} }
  }
`

export async function getPortfolio(slug: string): Promise<Portfolio | null> {
  return client.fetch(
    groq`*[_type == "portfolio" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      title, slug,
      images[] { ${IMAGE_FIELDS} },
      ${MOBILE_LAYOUT_FIELDS}
    }`,
    { slug },
    { cache: 'no-store' }
  )
}

export async function getClientGalleries(): Promise<ClientGallery[]> {
  return client.fetch(
    groq`*[_type == "clientGallery" && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id, name, slug,
      "thumbnails": images[0..7] { ${IMAGE_FIELDS} }
    }`,
    {},
    { cache: 'no-store' }
  )
}

export async function getClientGallery(slug: string): Promise<ClientGallery | null> {
  return client.fetch(
    groq`*[_type == "clientGallery" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      name, slug,
      images[] { ${IMAGE_FIELDS} },
      ${MOBILE_LAYOUT_FIELDS}
    }`,
    { slug },
    { cache: 'no-store' }
  )
}

export async function getProjects(): Promise<Project[]> {
  return client.fetch(
    groq`*[_type == "project" && !(_id in path("drafts.**"))] | order(orderRank asc) {
      _id, title, slug, description,
      "thumbnails": images[0..7] { ${IMAGE_FIELDS} }
    }`,
    {},
    { cache: 'no-store' }
  )
}

export async function getProject(slug: string): Promise<Project | null> {
  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      title, slug, description,
      images[] { ${IMAGE_FIELDS} },
      ${MOBILE_LAYOUT_FIELDS}
    }`,
    { slug },
    { cache: 'no-store' }
  )
}

export async function getMotionEntries(): Promise<MotionEntry[]> {
  return client.fetch(
    groq`*[_type == "motionEntry" && !(_id in path("drafts.**"))] | order(order asc) {
      _id, title, vimeoUrl,
      previewImage { ${IMAGE_FIELDS} }
    }`,
    {},
    { cache: 'no-store' }
  )
}

export async function getNavSettings(): Promise<NavSettings> {
  const result = await client.fetch(
    groq`*[_type == "navSettings" && _id == "singleton-navSettings"][0] {
      portfoliosVisible, selectedClientsVisible, projectsVisible, motionVisible, infoVisible
    }`,
    {},
    { cache: 'no-store' }
  )
  return result ?? {
    portfoliosVisible: true,
    selectedClientsVisible: true,
    projectsVisible: true,
    motionVisible: true,
    infoVisible: true,
  }
}

export async function getInfo(): Promise<Info | null> {
  return client.fetch(
    groq`*[_type == "info" && _id == "singleton-info"][0] {
      bio, email, instagram, representation, clientList
    }`,
    {},
    { cache: 'no-store' }
  )
}
