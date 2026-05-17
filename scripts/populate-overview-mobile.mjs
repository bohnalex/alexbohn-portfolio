// Run: SANITY_TOKEN=<your-token> node scripts/populate-overview-mobile.mjs
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '7qh9c83t',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

function uid() { return Math.random().toString(36).slice(2, 9) }

const overview = await client.fetch(
  `*[_type == "overview" && _id == "singleton-overview"][0] {
    _id,
    images[] {
      _key,
      alt,
      image {
        asset->{ _id, url, metadata { dimensions } }
      }
    }
  }`
)

if (!overview?.images?.length) {
  console.error('No overview document or no images found.')
  process.exit(1)
}

console.log(`Found ${overview.images.length} overview images`)

const classified = overview.images.map((item) => {
  const dims = item.image?.asset?.metadata?.dimensions
  // Also parse from asset ID as fallback: image-{hash}-{W}x{H}-{ext}
  const id = item.image?.asset?._id ?? ''
  const m = id.match(/-(\d+)x(\d+)-/)
  const w = dims?.width  ?? (m ? parseInt(m[1]) : 0)
  const h = dims?.height ?? (m ? parseInt(m[2]) : 0)
  const isLandscape = w > 0 && h > 0 ? w > h : false
  return { ref: id, isLandscape }
}).filter(item => item.ref)

// Build rows: landscapes → full, portraits → always paired.
// A pending portrait waits for the next portrait to pair with;
// landscapes are flushed in place. Lone portrait at end → pair with one slot.
const rows = []
let pending = null

for (const img of classified) {
  if (img.isLandscape) {
    rows.push({
      _type: 'mobileRow',
      _key: uid(),
      rowType: 'full',
      images: [{ _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: img.ref } }],
    })
  } else {
    if (pending) {
      rows.push({
        _type: 'mobileRow',
        _key: uid(),
        rowType: 'pair',
        images: [
          { _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: pending.ref } },
          { _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: img.ref } },
        ],
      })
      pending = null
    } else {
      pending = img
    }
  }
}

// Flush any lone trailing portrait
if (pending) {
  rows.push({
    _type: 'mobileRow',
    _key: uid(),
    rowType: 'pair',
    images: [{ _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: pending.ref } }],
  })
}

console.log(`Built ${rows.length} rows`)
rows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r.rowType} (${r.images.length} image${r.images.length > 1 ? 's' : ''})`))

await client
  .patch('singleton-overview')
  .set({ mobileLayout: rows })
  .commit()

console.log('Done — overview mobileLayout populated.')
