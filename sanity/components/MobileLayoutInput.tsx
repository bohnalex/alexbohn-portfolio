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

  const [rowDrag, setRowDrag] = useState<number | null>(null)
  const [rowOver, setRowOver] = useState<number | null>(null)
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
      next[fromR].images![fromI] = toImg
      next[toR].images![toI]     = fromImg
    } else {
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

  return (
    <div>
      {/* Phone screen column — constrained to phone-like width */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 260 }}
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
                alignItems: 'stretch',
                marginTop: isRowTarget ? 0 : 0,
                borderTop: isRowTarget ? '3px solid #2276fc' : rIdx === 0 ? 'none' : '3px solid transparent',
                opacity: rowDrag === rIdx ? 0.35 : 1,
              }}
            >
              {/* Drag handle — thin left strip */}
              <span
                draggable
                onDragStart={(e) => rowHandleDragStart(e, rIdx)}
                style={{
                  width: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#ccc',
                  fontSize: 13,
                  cursor: 'grab',
                  userSelect: 'none',
                  background: '#fafafa',
                  borderRight: '1px solid #ebebeb',
                }}
              >
                ⠿
              </span>

              {/* Image cells — fills remaining width */}
              <div style={{ flex: 1, display: 'flex', gap: 3, background: '#ebebeb' }}>
                {isPair ? (
                  [0, 1].map((slot) => {
                    const img = imgs[slot]
                    const ref = img?.asset?._ref
                    const isDragSrc    = imgDrag?.r === rIdx && imgDrag?.i === slot
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
                          aspectRatio: '2 / 3',
                          background: '#ebebeb',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: ref ? 'grab' : 'default',
                          opacity: isDragSrc ? 0.25 : 1,
                          outline: isDropTarget ? '2px solid #2276fc' : 'none',
                          outlineOffset: -2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref)}
                            alt=""
                            draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 10, color: '#bbb', userSelect: 'none' }}>empty</span>
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
                          aspectRatio: '3 / 2',
                          background: '#ebebeb',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: ref ? 'grab' : 'default',
                          opacity: isDragSrc ? 0.25 : 1,
                          outline: isDropTarget ? '2px solid #2276fc' : 'none',
                          outlineOffset: -2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {ref ? (
                          <img
                            src={thumb(ref)}
                            alt=""
                            draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 10, color: '#bbb', userSelect: 'none' }}>empty</span>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>

              {/* Remove — thin right strip */}
              <button
                type="button"
                onClick={(e) => removeRow(row._key as string, e)}
                title="Remove row"
                style={{
                  width: 18,
                  flexShrink: 0,
                  background: '#fafafa',
                  border: 'none',
                  borderLeft: '1px solid #ebebeb',
                  cursor: 'pointer',
                  color: '#bbb',
                  fontSize: 14,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ×
              </button>
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
