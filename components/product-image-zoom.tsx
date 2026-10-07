"use client"

import Image from "next/image"
import { useRef, useState } from "react"

type ProductImageZoomProps = { src: string; alt: string }

export function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const pointerStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
  const lastTap = useRef(0)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
          if (event.pointerType === "mouse") {
      setHovering(true)
      const rect = event.currentTarget.getBoundingClientRect()
      setOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`)
    } else if (zoomed && event.buttons) {
      setOffset({
        x: pointerStart.current.offsetX + event.clientX - pointerStart.current.x,
        y: pointerStart.current.offsetY + event.clientY - pointerStart.current.y,
      })
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" && zoomed) {
      event.currentTarget.setPointerCapture(event.pointerId)
      pointerStart.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail > 1 || Date.now() - lastTap.current < 320) {
      setZoomed((current) => !current)
      setOffset({ x: 0, y: 0 })
    }
    lastTap.current = Date.now()
  }

  return (
    <div
      className={`product-image-zoom ${zoomed ? "is-zoomed" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={() => setHovering(false)}
      onClick={handleClick}
      onDoubleClick={(event) => event.preventDefault()}
      role="button"
      tabIndex={0}
      aria-label={zoomed ? "Zoomed product image. Double tap to zoom out." : "Product image. Double tap to zoom in."}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setZoomed((current) => !current) }}
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 700px) 100vw, 55vw" className="product-image-zoom-img" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomed || hovering ? 2.5 : 1})`, transformOrigin: zoomed ? "50% 50%" : origin }} priority draggable={false} />
      <span className="product-image-zoom-hint" aria-hidden="true">{zoomed ? "Double tap to reset" : "Hover or double tap to zoom"}</span>
    </div>
  )
}
