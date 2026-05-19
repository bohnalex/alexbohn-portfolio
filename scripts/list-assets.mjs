/**
 * list-assets.mjs
 * Lists every image asset in the Sanity project and saves a manifest file.
 *
 * Usage:
 *   SANITY_API_TOKEN=your_write_token node scripts/list-assets.mjs
 *
 * Output:
 *   - Prints each asset's filename, dimensions and URL to the console
 *   - Saves scripts/asset-manifest.json for use by replace-assets.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const client = createClient({
  projectId: '7qh9c83t',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN env var is required.')
  console.error('Get a token at sanity.io/manage → your project → API → Tokens')
  process.exit(1)
}

console.log('Fetching image assets from Sanity…\n')

const assets = await client.fetch(
  `*[_type == "sanity.imageAsset"] | order(_createdAt asc) {
    _id,
    originalFilename,
    url,
    "width":  metadata.dimensions.width,
    "height": metadata.dimensions.height,
    "size":   metadata.size
  }`
)

if (!assets.length) {
  console.log('No image assets found.')
  process.exit(0)
}

console.log(`Found ${assets.length} image assets:\n`)
assets.forEach((a, i) => {
  const kb = a.size ? `${Math.round(a.size / 1024)} KB` : 'unknown size'
  console.log(`${String(i + 1).padStart(4, ' ')}. ${a.originalFilename}`)
  console.log(`       ${a.width}×${a.height}  ${kb}`)
  console.log(`       ${a.url}`)
})

const manifestPath = path.join(__dirname, 'asset-manifest.json')
fs.writeFileSync(manifestPath, JSON.stringify(assets, null, 2))
console.log(`\nManifest saved to scripts/asset-manifest.json`)
console.log(`\nName your optimised files to match the filenames listed above,`)
console.log(`put them in a folder, then run:`)
console.log(`  SANITY_API_TOKEN=... node scripts/replace-assets.mjs <folder>`)
