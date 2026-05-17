'use client'

import { set, insert, setIfMissing, unset, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps, ObjectItem } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import { useState } from 'react'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

interface MobileRow extends ObjectItem {
  rowType?: 'pair' | 'full'
  images?: Array<{ _key: string; _type: string; asset?: { _ref: string } }>
}

export function MobileLayoutInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)
  const rows = (props.value ?? []) as MobileRow[]

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex]  = useState<number | null>(null)

  function thumb(ref: string, w: number, h: number) {
    try {
      return builder.image({ asset: { _ref: ref } }).width(w).height(h).fit('crop').url()
    } catch { return '' }
  }

  function addRow(rowType: 'pair' | 'full') {
    const newRow: MobileRow = { _type: 'mobileRow', _key: uid(), rowType, images: [] }
    props.onChange([setIfMissing([]), insert([newRow], 'after', [-1])])
    setTimeout(() => props.onItemOpen([{ _key: newRow._key as string }]), 60)
  }

  function removeRow(key: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Remove this row?')) return
    props.onChange(unset([{ _key: key }]))
  }

  function onDragStart(index: number) { setDragIndex(index) }
  function onDragOver(e: React.DragEvent, index: number) { e.preventDefault(); setOverIndex(index) }
  function onDrop(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) { reset(); return }
    const next = [...rows]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(toIndex, 0, moved)
    props.onChange(set(next))
    reset()
  }
  function reset() { setDragIndex(null); setOverIndex(null) }

  const THUMB_H = 110 // px height of each thumbnail row in the UI

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {rows.map((row, index) => {
          const isPair   = row.rowType !== 'full'
          const dragging = dragIndex === index
          const isOver   = overIndex === index && dragIndex !== null && dragIndex !== index
          const imgs     = row.images ?? []

          return (
            <div
              key={row._key}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={reset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                borderRadius: 4,
                background: dragging ? '#f5f5f5' : 'transparent',
                borderTop: isOver ? '2px solid #2276fc' : '2px solid transparent',
                opacity: dragging ? 0.4 : 1,
                cursor: 'grab',
              }}
            >
              {/* Drag handle */}
              <span style={{ color: '#bbb', fontSize: 18, userSelect: 'none', lineHeight: 1 }}>⠿</span>

              {/* Thumbnails — click to open row editor */}
              <div
                role="button"
                onClick={() => props.onItemOpen([{ _key: row._key as string }])}
                title="Click to edit row"
                style={{
                  flex: 1,
                  display: 'flex',
                  gap: 3,
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: THUMB_H,
                }}
              >
                {isPair ? (
                  /* Two equal portrait cells */
                  [0, 1].map((slot) => {
                    const img = imgs[slot]
                    const ref = img?.asset?._ref
                    return (
                      <div
                        key={slot}
                        style={{
                          flex: 1,
                          height: THUMB_H,
                          background: '#e4e4e4',
                          borderRadius: 2,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref, Math.round(THUMB_H * 2 / 3), THUMB_H)}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: '#bbb' }}>empty</span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  /* Single landscape cell */
                  (() => {
                    const ref = imgs[0]?.asset?._ref
                    return (
                      <div
                        style={{
                          flex: 1,
                          height: THUMB_H,
                          background: '#e4e4e4',
                          borderRadius: 2,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref, Math.round(THUMB_H * 3 / 2), THUMB_H)}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: '#bbb' }}>empty</span>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>

              {/* Label + remove */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', userSelect: 'none' }}>
                  {isPair ? 'pair' : 'full'}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeRow(row._key as string, e)}
                  title="Remove row"
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: 3,
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: 14,
                    lineHeight: 1,
                    padding: '2px 6px',
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: rows.length ? 12 : 4 }}>
        <button
          type="button"
          onClick={() => addRow('pair')}
          style={{
            padding: '6px 14px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          + Add Pair
        </button>
        <button
          type="button"
          onClick={() => addRow('full')}
          style={{
            padding: '6px 14px',
            background: '#555',
            color: '#fff',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          + Add Full Width
        </button>
      </div>
    </div>
  )
}
