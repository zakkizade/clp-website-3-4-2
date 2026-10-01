"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

type Slide = { id: string; image: string; href: string; label: string; percentOff?: number; sale?: boolean }

export function HeroSlider({ slides = [] }: { slides?: Slide[] }) {
  const [index, setIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const activeSlides = slides.filter((slide) => Boolean(slide.image))
  useEffect(() => {
    activeSlides.forEach((slide) => { const image = new window.Image(); image.src = slide.image })
  }, [activeSlides])
  useEffect(() => { if (index >= activeSlides.length) setIndex(0) }, [activeSlides.length, index])
  const go = (direction: number) => setIndex((current) => (current + direction + activeSlides.length) % activeSlides.length)
  useEffect(() => { const timer = window.setInterval(() => go(1), 3000); return () => window.clearInterval(timer) }, [activeSlides.length])
  if (!activeSlides.length) return null
  const activeSlide = activeSlides[index] ?? activeSlides[0]
  if (!activeSlide) return null
  return <div className="hero-slider" onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)} onTouchEnd={(event) => { if (touchStart === null) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart; if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1); setTouchStart(null) }}><a className="hero-slider-link" href={activeSlide.href} aria-label={activeSlide.label}><img src={activeSlide.image} alt={activeSlide.label} loading="eager" fetchPriority="high" decoding="async" /><span className="hero-slider-caption">{activeSlide.sale && <strong className="hero-slider-sale-badge">{activeSlide.percentOff ? `${activeSlide.percentOff}% OFF` : "SPECIAL OFFER"}</strong>}{activeSlide.percentOff ? <><br /><strong>LIMITED TIME SALE: UP TO {activeSlide.percentOff}% OFF</strong></> : null}<br />{activeSlide.label}</span></a><button className="hero-slider-arrow hero-slider-prev" onClick={(event) => { event.preventDefault(); go(-1) }} aria-label="Previous banner"><ArrowLeft /></button><button className="hero-slider-arrow hero-slider-next" onClick={(event) => { event.preventDefault(); go(1) }} aria-label="Next banner"><ArrowRight /></button><div className="hero-slider-dots" aria-label="Banner slides">{activeSlides.map((slide, slideIndex) => <button key={slide.id} className={slideIndex === index ? "active" : ""} onClick={() => setIndex(slideIndex)} aria-label={`Go to banner ${slideIndex + 1}`} />)}</div></div>
}
