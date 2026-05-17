'use client'

import { set, insert, setIfMissing, unset, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps, ObjectItem } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import { useState } from 'react'

function uid() { return Math.random().toString(36).slice(2, 9) }

type ImgRef = { _key: string; _type: string; asset?: { _ref: string } }
interface MobileRow extends ObjectItem {
  rowType?: 'pair' | 'full'
  images?: ImgRef[]
}

export function MobileLayoutInput(props: ArrayOfObjectsInputProps) {
  const client  = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)
  const rows    = (props.value ?? []) as MobileRow[]

  // Row reorder state
  const [rowDrag, setRowDrag] = useState<number | null>(null)
  const [rowOver, setRowOver] = useState<number | null>(null)

  // Image drag state
  const [imgDrag, setImgDrag] = useState<{ r: number; i: number } | null>(null)
  const [imgOver, setImgOver] = useState<{ r: number; i: number } | null>(null)

  function thumb(ref: string) {
    try { return builder.image({ asset: { _ref: ref } }).width(600).auto('format').url() }
    catch { return '' }
  }

  // ─── Row reorder ──────────────────────────────────────────────────────────

  function rowHandleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('drag-type', 'row')
    setRowDrag(index)
  }

  function rowDragOver(e: React.DragEvent, index: number) {
    if (rowDrag === null) return
    e.preventDefault()
    setRowOver(index)
  }

  function rowDrop(index: number) {
    if (rowDrag === null || rowDrag === index) { resetAll(); return }
    const next = [...rows]
    const [moved] = next.splice(rowDrag, 1)
    next.splice(index, 0, moved)
    props.onChange(set(next))
    resetAll()
  }

  // ─── Image drag ───────────────────────────────────────────────────────────

  function imgDragStart(e: React.DragEvent, r: number, i: number) {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('drag-type', 'image')
    setImgDrag({ r, i })
  }

  function imgDragOver(e: React.DragEvent, r: number, i: number) {
    e.preventDefault()
    e.stopPropagation()
    if (imgDrag) setImgOver({ r, i })
  }

  function imgDrop(e: React.DragEvent, toR: number, toI: number) {
    e.preventDefault()
    e.stopPropagation()
    if (!imgDrag) return
    const { r: fromR, i: fromI } = imgDrag
    if (fromR === toR && fromI === toI) { resetAll(); return }

    const next: MobileRow[] = rows.map(row => ({ ...row, images: [...(row.images ?? [])] }))
    const fromImg = next[fromR].images![fromI]
    const toImg   = next[toR].images?.[toI]

    if (toImg) {
      // Swap
      next[fromR].images![fromI] = toImg
      next[toR].images![toI]     = fromImg
    } else {
      // Move to empty slot
      next[fromR].images!.splice(fromI, 1)
      if (!next[toR].images) next[toR].images = []
      next[toR].images![toI] = fromImg
    }

    props.onChange(set(next))
    resetAll()
  }

  function resetAll() {
    setRowDrag(null); setRowOver(null)
    setImgDrag(null); setImgOver(null)
  }

  // ─── Row mutations ────────────────────────────────────────────────────────

  function addRow(rowType: 'pair' | 'full') {
    const newRow: MobileRow = { _type: 'mobileRow', _key: uid(), rowType, images: [] }
    props.onChange([setIfMissing([]), insert([newRow], 'after', [-1])])
    setTimeout(() => props.onItemOpen([{ _key: newRow._key as string }]), 60)
  }

  function removeRow(key: string, e: React.MouseEvent) {
    e.stopPropagation()
    props.onChange(unset([{ _key: key }]))
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const ROW_H = 140

  return (
    <div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        onDragEnd={resetAll}
      >
        {rows.map((row, rIdx) => {
          const isPair   = row.rowType !== 'full'
          const imgs     = row.images ?? []
          const isRowTarget = rowOver === rIdx && rowDrag !== null && rowDrag !== rIdx

          return (
            <div
              key={row._key}
              onDragOver={(e) => rowDragOver(e, rIdx)}
              onDrop={() => rowDrop(rIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '3px 4px',
                borderRadius: 4,
                borderTop: isRowTarget ? '2px solid #2276fc' : '2px solid transparent',
                opacity: rowDrag === rIdx ? 0.35 : 1,
              }}
            >
              {/* Row drag handle */}
              <span
                draggable
                onDragStart={(e) => rowHandleDragStart(e, rIdx)}
                style={{
                  color: '#bbb',
                  fontSize: 18,
                  userSelect: 'none',
                  lineHeight: 1,
                  cursor: 'grab',
                  flexShrink: 0,
                }}
              >
                ⠿
              </span>

              {/* Image cells */}
              <div style={{ flex: 1, display: 'flex', gap: 3, height: ROW_H }}>
                {isPair ? (
                  [0, 1].map((slot) => {
                    const img = imgs[slot]
                    const ref = img?.asset?._ref
                    const isDragSrc  = imgDrag?.r === rIdx && imgDrag?.i === slot
                    const isDropTarget = imgOver?.r === rIdx && imgOver?.i === slot
                    return (
                      <div
                        key={slot}
                        draggable={!!ref}
                        onDragStart={(e) => ref && imgDragStart(e, rIdx, slot)}
                        onDragOver={(e) => imgDragOver(e, rIdx, slot)}
                        onDrop={(e) => imgDrop(e, rIdx, slot)}
                        style={{
                          flex: 1,
                          height: ROW_H,
                          background: '#ebebeb',
                          borderRadius: 3,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: ref ? 'grab' : 'default',
                          opacity: isDragSrc ? 0.25 : 1,
                          outline: isDropTarget ? '2px solid #2276fc' : 'none',
                          outlineOffset: -2,
                          transition: 'outline 0.08s',
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref)}
                            alt=""
                            draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: '#bbb', userSelect: 'none' }}>empty</span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  (() => {
                    const img = imgs[0]
                    const ref = img?.asset?._ref
                    const isDragSrc    = imgDrag?.r === rIdx && imgDrag?.i === 0
                    const isDropTarget = imgOver?.r === rIdx && imgOver?.i === 0
                    return (
                      <div
                        draggable={!!ref}
                        onDragStart={(e) => ref && imgDragStart(e, rIdx, 0)}
                        onDragOver={(e) => imgDragOver(e, rIdx, 0)}
                        onDrop={(e) => imgDrop(e, rIdx, 0)}
                        style={{
                          flex: 1,
                          height: ROW_H,
                          background: '#ebebeb',
                          borderRadius: 3,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: ref ? 'grab' : 'default',
                          opacity: isDragSrc ? 0.25 : 1,
                          outline: isDropTarget ? '2px solid #2276fc' : 'none',
                          outlineOffset: -2,
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref)}
                            alt=""
                            draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: '#bbb', userSelect: 'none' }}>empty</span>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>

              {/* Type label + remove */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', userSelect: 'none' }}>
                  {isPair ? 'pair' : 'full'}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeRow(row._key as string, e)}
                  title="Remove row"
                  style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: 3, cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1, padding: '2px 6px' }}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: rows.length ? 14 : 4 }}>
        <button type="button" onClick={() => addRow('pair')}
          style={{ padding: '6px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          + Add Pair
        </button>
        <button type="button" onClick={() => addRow('full')}
          style={{ padding: '6px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
          + Add Full Width
        </button>
      </div>
    </div>
  )
}
