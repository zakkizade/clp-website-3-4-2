"use client"

import Image from "next/image"
import { Rotate3D } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type ProductViewer360Props = { images: string[]; alt: string }

export function ProductViewer360({ images, alt }: ProductViewer360Props) {
  const [frame, setFrame] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const startX = useRef(0)
  const startFrame = useRef(0)
  const frameCount = images.length

  useEffect(() => {
    if (!hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 4200)
    return () => window.clearTimeout(timer)
  }, [hintVisible])

  const updateFromPointer = (clientX: number) => {
    const delta = clientX - startX.current
    const nextFrame = Math.round(startFrame.current - delta / 18)
    setFrame(((nextFrame % frameCount) + frameCount) % frameCount)
    setHintVisible(false)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    startX.current = event.clientX
    startFrame.current = frame
    setDragging(true)
    setHintVisible(false)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) updateFromPointer(event.clientX)
  }

  const handlePointerUp = () => setDragging(false)

  return <div className={`viewer-360 ${dragging ? "is-dragging" : ""}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} role="application" aria-label="Interactive 360 degree product viewer">
    <Image src={images[frame]} alt={`${alt}, 360 degree view ${frame + 1} of ${frameCount}`} fill sizes="(max-width: 700px) 100vw, 55vw" className="object-contain viewer-360-image" draggable={false} priority={frame === 0} />
    <div className="viewer-360-badge"><Rotate3D size={14} /> 360° VIEW</div>
    {hintVisible && <div className="viewer-360-hint">Drag to rotate</div>}
    <div className="viewer-360-controls" onPointerDown={(event) => event.stopPropagation()}>
      <input className="angle-slider" type="range" min="0" max={frameCount - 1} value={frame} onChange={(event) => { setFrame(Number(event.target.value)); setHintVisible(false) }} aria-label="Rotate product 360 degrees" />
      <span>{String(frame + 1).padStart(2, "0")} / {String(frameCount).padStart(2, "0")}</span>
    </div>
  </div>
}
