/**
 * replace-assets.mjs
 * Uploads optimised images and replaces every reference to the old asset
 * across all Sanity documents, preserving array order and metadata.
 *
 * Usage:
 *   SANITY_API_TOKEN=your_write_token node scripts/replace-assets.mjs <folder> [--dry-run]
 *
 * Arguments:
 *   <folder>    Path to folder containing replacement images.
 *               Each filename must match an originalFilename in Sanity.
 *   --dry-run   Preview what would be replaced without changing anything.
 *
 * Run list-assets.mjs first to generate asset-manifest.json and see filenames.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' }
const IMAGE_EXTS = new Set(Object.keys(MIME))
const DELAY_MS = 150 // pause between uploads to stay within rate limits

const folderArg = process.argv[2]
const dryRun = process.argv.includes('--dry-run')

if (!folderArg) {
  console.error('Usage: SANITY_API_TOKEN=... node scripts/replace-assets.mjs <folder> [--dry-run]')
  process.exit(1)
}
if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN env var is required.')
  process.exit(1)
}

const folder = path.resolve(folderArg)
if (!fs.existsSync(folder)) {
  console.error(`Folder not found: ${folder}`)
  process.exit(1)
}

const client = createClient({
  projectId: '7qh9c83t',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Recursively replace any _ref matching oldRef anywhere in a document value
function deepReplaceRef(value, oldRef, newRef) {
  if (Array.isArray(value)) return value.map(v => deepReplaceRef(v, oldRef, newRef))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = (k === '_ref' && v === oldRef) ? newRef : deepReplaceRef(v, oldRef, newRef)
    }
    return out
  }
  return value
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ─── Load asset manifest (or query fresh) ────────────────────────────────────

let assets
const manifestPath = path.join(__dirname, 'asset-manifest.json')
if (fs.existsSync(manifestPath)) {
  assets = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  console.log(`Loaded ${assets.length} assets from manifest.\n`)
} else {
  console.log('No manifest found — querying Sanity…')
  assets = await client.fetch(
    `*[_type == "sanity.imageAsset"] { _id, originalFilename }`
  )
  console.log(`Found ${assets.length} assets.\n`)
}

const assetByFilename = Object.fromEntries(assets.map(a => [a.originalFilename, a._id]))

// ─── Find replacement files ───────────────────────────────────────────────────

const files = fs.readdirSync(folder).filter(f => {
  const ext = path.extname(f).slice(1).toLowerCase()
  return IMAGE_EXTS.has(ext)
})

if (!files.length) {
  console.error(`No image files found in ${folder}`)
  process.exit(1)
}

console.log(`Found ${files.length} files in folder.`)
if (dryRun) console.log('DRY RUN — no changes will be made.\n')
console.log()

let replaced = 0, skipped = 0, errors = 0

for (const filename of files) {
  const oldAssetId = assetByFilename[filename]
  if (!oldAssetId) {
    console.log(`⚠  SKIP  ${filename} — no matching asset in Sanity`)
    skipped++
    continue
  }

  if (dryRun) {
    console.log(`✓  WOULD replace  ${filename}  (${oldAssetId})`)
    replaced++
    continue
  }

  // Upload new file
  const filePath = path.join(folder, filename)
  const ext = path.extname(filename).slice(1).toLowerCase()
  const contentType = MIME[ext] ?? 'image/jpeg'

  let newAsset
  try {
    newAsset = await client.assets.upload('image', fs.createReadStream(filePath), {
      filename,
      contentType,
    })
  } catch (err) {
    console.error(`✗  ERROR uploading ${filename}: ${err.message}`)
    errors++
    continue
  }

  const newAssetId = newAsset._id

  // Find all documents that reference the old asset
  const docs = await client.fetch(`*[references($id)]{ _id, _type }`, { id: oldAssetId })

  if (!docs.length) {
    console.log(`✓  ${filename} — uploaded, no document references found`)
    replaced++
    await sleep(DELAY_MS)
    continue
  }

  // Patch each document
  for (const { _id: docId } of docs) {
    const doc = await client.getDocument(docId)
    if (!doc) continue

    const updated = deepReplaceRef(doc, oldAssetId, newAssetId)

    // Remove system fields before patching
    const { _id, _type, _rev, ...fields } = updated
    await client.patch(docId).set(fields).commit()
  }

  console.log(`✓  ${filename} — replaced in ${docs.length} document(s)`)
  replaced++
  await sleep(DELAY_MS)
}

console.log()
console.log(`Done. Replaced: ${replaced}  Skipped: ${skipped}  Errors: ${errors}`)
if (!dryRun && replaced > 0) {
  console.log('\nOld assets are still in Sanity storage. Delete them at:')
  console.log('sanity.io/manage → your project → Media Library')
}
