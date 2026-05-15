'use client'

import { useCallback, useRef, useState } from 'react'
import { set, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function BulkImageUpload(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  // Flat image array (portfolio/gallery/project) vs nested object with image field (overview)
  const isFlat = (props.schemaType.of[0] as { name?: string })?.name === 'image'
  const nestedTypeName = (props.schemaType.of[0] as { name?: string })?.name ?? 'object'

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true)
      setError(null)
      setProgress({ done: 0, total: files.length })

      const existing = (props.value ?? []) as unknown[]
      const additions: unknown[] = []

      try {
        for (let i = 0; i < files.length; i++) {
          const asset = await client.assets.upload('image', files[i], {
            filename: files[i].name,
          })
          const ref = { _type: 'reference' as const, _ref: asset._id }

          if (isFlat) {
            additions.push({ _type: 'image', _key: uid(), asset: ref })
          } else {
            additions.push({
              _type: nestedTypeName,
              _key: uid(),
              image: { _type: 'image', asset: ref },
            })
          }

          setProgress({ done: i + 1, total: files.length })
        }

        props.onChange(set([...existing, ...additions]))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [client, isFlat, nestedTypeName, props]
  )

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '6px 14px',
            background: uploading ? '#e5e5e5' : '#111',
            color: uploading ? '#888' : '#fff',
            border: 'none',
            borderRadius: 3,
            cursor: uploading ? 'default' : 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          {uploading ? `Uploading ${progress.done} / ${progress.total}…` : '+ Bulk Upload'}
        </button>
        {error && (
          <span style={{ color: '#c00', fontSize: 13 }}>{error}</span>
        )}
      </div>
      {props.renderDefault(props)}
    </>
  )
}
