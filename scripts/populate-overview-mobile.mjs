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
        asset->{ _ref, url, metadata { dimensions } }
      }
    }
  }`
)

if (!overview?.images?.length) {
  console.error('No overview document or no images found.')
  process.exit(1)
}

console.log(`Found ${overview.images.length} overview images`)

// Classify each image
const classified = overview.images.map((item) => {
  const dims = item.image?.asset?.metadata?.dimensions
  const isLandscape = dims ? dims.width > dims.height : false
  return { ref: item.image?.asset?._ref, isLandscape }
}).filter(item => item.ref)

// Build mobileLayout rows
const rows = []
const portrait = classified.filter(i => !i.isLandscape)
const landscape = classified.filter(i => i.isLandscape)

// Interleave: process in original order
const remaining = [...classified]
let i = 0
while (i < remaining.length) {
  const cur = remaining[i]
  if (cur.isLandscape) {
    rows.push({
      _type: 'mobileRow',
      _key: uid(),
      rowType: 'full',
      images: [{ _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: cur.ref } }],
    })
    i++
  } else {
    // Try to pair with next portrait
    const next = remaining[i + 1]
    if (next && !next.isLandscape) {
      rows.push({
        _type: 'mobileRow',
        _key: uid(),
        rowType: 'pair',
        images: [
          { _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: cur.ref } },
          { _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: next.ref } },
        ],
      })
      i += 2
    } else {
      // Lone portrait — put in a full row
      rows.push({
        _type: 'mobileRow',
        _key: uid(),
        rowType: 'full',
        images: [{ _type: 'image', _key: uid(), asset: { _type: 'reference', _ref: cur.ref } }],
      })
      i++
    }
  }
}

console.log(`Built ${rows.length} rows`)
rows.forEach((r, idx) => console.log(`  Row ${idx + 1}: ${r.rowType} (${r.images.length} image${r.images.length > 1 ? 's' : ''})`))

await client
  .patch('singleton-overview')
  .set({ mobileLayout: rows })
  .commit()

console.log('Done — overview mobileLayout populated.')
