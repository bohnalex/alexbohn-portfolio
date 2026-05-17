'use client'

import { set, insert, setIfMissing, unset, useClient, useFormValue } from 'sanity'
import type { ArrayOfObjectsInputProps, ObjectItem } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import { useState, useEffect, useRef } from 'react'

function uid() { return Math.random().toString(36).slice(2, 9) }

type ImgRef = { _key: string; _type: string; asset?: { _type?: string; _ref: string } }
interface MobileRow extends ObjectItem {
  rowType?: 'pair' | 'full'
  images?: ImgRef[]
}

// Extract asset _ref from either flat image or overview-style nested object
function extractAssetRef(item: unknown): string | null {
  if (!item || typeof item !== 'object') return null
  const obj = item as Record<string, unknown>
  if (obj.asset && typeof obj.asset === 'object') {
    return (obj.asset as { _ref?: string })._ref ?? null
  }
  if (obj.image && typeof obj.image === 'object') {
    const img = obj.image as Record<string, unknown>
    if (img.asset && typeof img.asset === 'object') {
      return (img.asset as { _ref?: string })._ref ?? null
    }
  }
  return null
}

export function MobileLayoutInput(props: ArrayOfObjectsInputProps) {
  const client  = useClient({ apiVersion: '2024-01-01' })
  const builder = imageUrlBuilder(client)
  const rows    = (props.value ?? []) as MobileRow[]

  // All images in the parent gallery document
  const galleryImages = (useFormValue(['images']) ?? []) as unknown[]

  // ─── Smooth auto-scroll ───────────────────────────────────────────────────
  const rafRef      = useRef<number | null>(null)
  const dragClientY = useRef(0)

  useEffect(() => {
    const track = (e: DragEvent) => { dragClientY.current = e.clientY }
    document.addEventListener('dragover', track, { passive: true })
    return () => document.removeEventListener('dragover', track)
  }, [])

  function startAutoScroll() {
    if (rafRef.current !== null) return
    const EDGE    = 120
    const MAX_SPD = 3
    function tick() {
      const y  = dragClientY.current
      const vh = window.innerHeight
      let speed = 0
      if (y < EDGE)           speed = -((EDGE - y) / EDGE) * MAX_SPD
      else if (y > vh - EDGE)  speed = ((y - (vh - EDGE)) / EDGE) * MAX_SPD
      if (speed !== 0) window.scrollBy(0, speed)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function stopAutoScroll() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // ─── Drag state ───────────────────────────────────────────────────────────
  const [rowDrag, setRowDrag] = useState<number | null>(null)
  const [rowOver, setRowOver] = useState<number | null>(null)
  const [imgDrag, setImgDrag] = useState<{ r: number; i: number } | null>(null)
  const [imgOver, setImgOver] = useState<{ r: number; i: number } | null>(null)

  // ─── Picker state ─────────────────────────────────────────────────────────
  const [picker, setPicker] = useState<{ rowIdx: number; slot: number } | null>(null)

  function thumb(ref: string) {
    try { return builder.image({ asset: { _ref: ref } }).width(600).auto('format').url() }
    catch { return '' }
  }

  // ─── Row reorder ──────────────────────────────────────────────────────────

  function rowHandleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('drag-type', 'row')
    setRowDrag(index)
    startAutoScroll()
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
    startAutoScroll()
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
    stopAutoScroll()
  }

  // ─── Image picker ─────────────────────────────────────────────────────────

  function openPicker(rowIdx: number, slot: number, e: React.MouseEvent) {
    e.stopPropagation()
    setPicker({ rowIdx, slot })
  }

  function selectImage(ref: string) {
    if (!picker) return
    const next: MobileRow[] = rows.map(row => ({ ...row, images: [...(row.images ?? [])] }))
    const { rowIdx, slot } = picker
    if (!next[rowIdx].images) next[rowIdx].images = []
    const existing = next[rowIdx].images![slot]
    next[rowIdx].images![slot] = {
      _type: 'image',
      _key: existing?._key ?? uid(),
      asset: { _type: 'reference' as const, _ref: ref },
    }
    props.onChange(set(next))
    setPicker(null)
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

  // ─── Shared cell style builder ────────────────────────────────────────────

  function cellStyle(isDragSrc: boolean, isDropTarget: boolean, extraAspectRatio: string): React.CSSProperties {
    return {
      flex: 1,
      aspectRatio: extraAspectRatio,
      background: '#ebebeb',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      opacity: isDragSrc ? 0.25 : 1,
      outline: isDropTarget ? '2px solid #2276fc' : 'none',
      outlineOffset: -2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Phone screen column */}
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 260 }}
        onDragEnd={resetAll}
      >
        {rows.map((row, rIdx) => {
          const isPair      = row.rowType !== 'full'
          const imgs        = row.images ?? []
          const isRowTarget = rowOver === rIdx && rowDrag !== null && rowDrag !== rIdx

          return (
            <div
              key={row._key}
              onDragOver={(e) => rowDragOver(e, rIdx)}
              onDrop={() => rowDrop(rIdx)}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                borderTop: isRowTarget ? '3px solid #2276fc' : rIdx === 0 ? 'none' : '3px solid transparent',
                opacity: rowDrag === rIdx ? 0.35 : 1,
              }}
            >
              {/* Drag handle */}
              <span
                draggable
                onDragStart={(e) => rowHandleDragStart(e, rIdx)}
                style={{
                  width: 14, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ccc', fontSize: 13, cursor: 'grab', userSelect: 'none',
                  background: '#fafafa', borderRight: '1px solid #ebebeb',
                }}
              >⠿</span>

              {/* Image cells */}
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
                        onClick={(e) => openPicker(rIdx, slot, e)}
                        style={cellStyle(isDragSrc, isDropTarget, '2 / 3')}
                      >
                        {ref ? (
                          <img src={thumb(ref)} alt="" draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <span style={{ fontSize: 10, color: '#bbb', userSelect: 'none' }}>tap to add</span>
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
                        onClick={(e) => openPicker(rIdx, 0, e)}
                        style={cellStyle(isDragSrc, isDropTarget, '3 / 2')}
                      >
                        {ref ? (
                          <img src={thumb(ref)} alt="" draggable={false}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <span style={{ fontSize: 10, color: '#bbb', userSelect: 'none' }}>tap to add</span>
                        )}
                      </div>
                    )
                  })()
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={(e) => removeRow(row._key as string, e)}
                title="Remove row"
                style={{
                  width: 18, flexShrink: 0,
                  background: '#fafafa', border: 'none', borderLeft: '1px solid #ebebeb',
                  cursor: 'pointer', color: '#bbb', fontSize: 14, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >×</button>
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

      {/* Image picker modal */}
      {picker !== null && (
        <div
          onClick={() => setPicker(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 6,
              padding: 16, width: 480, maxWidth: '92vw',
              maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#888', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select replacement image
              </span>
              <button
                type="button"
                onClick={() => setPicker(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 18, lineHeight: 1, padding: '0 2px' }}
              >×</button>
            </div>

            {galleryImages.length === 0 ? (
              <p style={{ fontSize: 13, color: '#aaa', fontFamily: 'inherit' }}>No images found in this gallery.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {galleryImages.map((item, idx) => {
                  const ref = extractAssetRef(item)
                  if (!ref) return null
                  const isActive = rows[picker.rowIdx]?.images?.[picker.slot]?.asset?._ref === ref
                  return (
                    <div
                      key={idx}
                      onClick={() => selectImage(ref)}
                      style={{
                        aspectRatio: '1',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        borderRadius: 2,
                        outline: isActive ? '2px solid #2276fc' : '2px solid transparent',
                        outlineOffset: 1,
                        transition: 'outline 0.08s',
                      }}
                    >
                      <img
                        src={thumb(ref)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
