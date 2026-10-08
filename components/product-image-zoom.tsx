"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

type ProductImageZoomProps = { src: string; alt: string }
type Point = { x: number; y: number }

const HOVER_SCALE = 2.5
const MAX_SCALE = 4

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

export function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef({ startDistance: 0, startScale: 1, dragFrom: { x: 0, y: 0 }, dragOffset: { x: 0, y: 0 }, moved: false })
  const lastTap = useRef(0)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const scaleRef = useRef(1)
  const offsetRef = useRef<Point>({ x: 0, y: 0 })

  const apply = useCallback((nextScale: number, nextOffset: Point) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const limitX = rect ? ((nextScale - 1) * rect.width) / 2 : 0
    const limitY = rect ? ((nextScale - 1) * rect.height) / 2 : 0
    const safeOffset = nextScale <= 1 ? { x: 0, y: 0 } : { x: clamp(nextOffset.x, -limitX, limitX), y: clamp(nextOffset.y, -limitY, limitY) }
    scaleRef.current = nextScale
    offsetRef.current = safeOffset
    setScale(nextScale)
    setOffset(safeOffset)
  }, [])

  useEffect(() => {
    pointers.current.clear()
    setHover(null)
    apply(1, { x: 0, y: 0 })
  }, [src, apply])

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") trackMouse(event)
  }

  const trackMouse = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHover({
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]
    gesture.current.moved = false
    if (points.length === 2) {
      gesture.current.startDistance = distance(points[0], points[1])
      gesture.current.startScale = scaleRef.current
    } else {
      gesture.current.dragFrom = points[0]
      gesture.current.dragOffset = offsetRef.current
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      trackMouse(event)
      return
    }
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]
    if (points.length === 2 && gesture.current.startDistance > 0) {
      gesture.current.moved = true
      apply(clamp(gesture.current.startScale * (distance(points[0], points[1]) / gesture.current.startDistance), 1, MAX_SCALE), offsetRef.current)
    } else if (points.length === 1 && scaleRef.current > 1) {
      const dx = points[0].x - gesture.current.dragFrom.x
      const dy = points[0].y - gesture.current.dragFrom.y
      if (Math.hypot(dx, dy) > 6) gesture.current.moved = true
      apply(scaleRef.current, { x: gesture.current.dragOffset.x + dx, y: gesture.current.dragOffset.y + dy })
    } else if (points.length === 1) {
      const dx = points[0].x - gesture.current.dragFrom.x
      const dy = points[0].y - gesture.current.dragFrom.y
      if (Math.hypot(dx, dy) > 6) gesture.current.moved = true
    }
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return
    const wasTracked = pointers.current.delete(event.pointerId)
    if (!wasTracked) return
    const remaining = [...pointers.current.values()]
    if (remaining.length === 1) {
      gesture.current.dragFrom = remaining[0]
      gesture.current.dragOffset = offsetRef.current
      return
    }
    if (scaleRef.current < 1.05) apply(1, { x: 0, y: 0 })
    if (event.type === "pointerup" && !gesture.current.moved) {
      const now = Date.now()
      if (now - lastTap.current < 320) {
        apply(scaleRef.current > 1 ? 1 : HOVER_SCALE, { x: 0, y: 0 })
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    }
  }

  const toggleZoom = () => apply(scaleRef.current > 1 ? 1 : HOVER_SCALE, { x: 0, y: 0 })

  const isHovering = hover !== null
  const transform = isHovering ? `scale(${HOVER_SCALE})` : `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`
  const transformOrigin = isHovering ? `${hover.x}% ${hover.y}%` : "50% 50%"
  const isGesturing = pointers.current.size > 0

  return (
    <div
      ref={containerRef}
      className={`product-image-zoom ${isHovering ? "is-hovering" : ""} ${scale > 1 ? "is-zoomed" : ""}`}
      style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setHover(null) }}
      role="button"
      tabIndex={0}
      aria-label={scale > 1 ? "Zoomed product image. Press Enter to zoom out." : "Product image. Hover, pinch or double tap to zoom in."}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleZoom() } }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 700px) 100vw, 55vw"
        className="product-image-zoom-img"
        style={{ transform, transformOrigin, transition: isGesturing ? "none" : undefined }}
        priority
        draggable={false}
      />
      {scale > 1 && !isHovering && <span className="product-image-zoom-hint" aria-hidden="true">Double tap to reset</span>}
    </div>
  )
}
