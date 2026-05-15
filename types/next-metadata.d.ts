// next@14.x ships without a root types.d.ts so `export * from './types'` in
// next/index.d.ts resolves to nothing — Metadata and friends are invisible to
// tsc. This augmentation re-exports them from the actual dist location.
import type {
  Metadata,
  Viewport,
  ResolvedMetadata,
  ResolvedViewport,
  ResolvingMetadata,
  ResolvingViewport,
  MetadataRoute,
} from 'next/dist/lib/metadata/types/metadata-interface'

declare module 'next' {
  export type {
    Metadata,
    Viewport,
    ResolvedMetadata,
    ResolvedViewport,
    ResolvingMetadata,
    ResolvingViewport,
    MetadataRoute,
  }
}
